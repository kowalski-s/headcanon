import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import * as autoTag from '@/lib/prompts/auto-tag';

export interface AutoTagJob {
  storyId: string;
}

/** Canonical slug: lowercase, trimmed, spaces → hyphens (AO3 convention). */
function toSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-');
}

export async function handleAutoTag(job: { data: AutoTagJob }) {
  const { storyId } = job.data;
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: {
        where: { status: 'PUBLISHED' },
        include: { paragraphs: { orderBy: { ordinal: 'asc' } } },
      },
      // Only fetch user-confirmed tags so the worker doesn't read its own previous output as approved.
      tags: { include: { tag: true }, where: { prefilled: false } },
    },
  });
  if (!story) return;
  const storyText = story.chapters.flatMap((ch) => ch.paragraphs.map((p) => p.text)).join('\n\n');
  const existingTags = story.tags.map((st) => st.tag.name);

  const prompt = autoTag.build({ storyText, existingTags });
  const result = await openaiLlm.completeStructured({
    callType: 'auto_tag',
    templateId: autoTag.TEMPLATE_ID,
    templateVersion: autoTag.TEMPLATE_VERSION,
    schema: autoTag.AutoTagSchema,
    ...prompt,
    contextIds: { storyId },
  });

  // Write the suggestion blob FIRST so a mid-loop failure still surfaces suggestions to the UI.
  // Suggestions для rating/warnings/category — пишем в Story.aiTagSuggestion JSON-blob для UI.
  await prisma.story.update({
    where: { id: storyId },
    data: { aiTagSuggestion: result as object },
  });

  // Persist freeform tags only — rating + warnings ждут confirm от юзера.
  for (const raw of result.freeform_tags) {
    const slug = toSlug(raw);
    const tag = await prisma.tag.upsert({
      where: { type_slug: { type: 'FREEFORM', slug } },
      create: { type: 'FREEFORM', name: raw, slug },
      update: {},
    });
    await prisma.storyTag.upsert({
      where: { storyId_tagId: { storyId, tagId: tag.id } },
      create: { storyId, tagId: tag.id, prefilled: true },
      update: {},
    });
  }
  console.log('[auto-tag] done', { storyId, tags: result.freeform_tags.length });
}
