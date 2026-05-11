import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import * as autoTag from '@/lib/prompts/auto-tag';

export interface AutoTagJob { storyId: string; }

export async function handleAutoTag(job: { data: AutoTagJob }) {
  const { storyId } = job.data;
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: { where: { status: 'PUBLISHED' }, include: { paragraphs: { orderBy: { ordinal: 'asc' } } } },
      tags: { include: { tag: true } },
    },
  });
  if (!story) return;
  const storyText = story.chapters
    .flatMap((ch) => ch.paragraphs.map((p) => p.text))
    .join('\n\n');
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

  // Persist freeform tags only — rating + warnings ждут confirm от юзера.
  for (const slug of result.freeform_tags) {
    const tag = await prisma.tag.upsert({
      where: { type_slug: { type: 'FREEFORM', slug } },
      create: { type: 'FREEFORM', name: slug, slug },
      update: {},
    });
    await prisma.storyTag.upsert({
      where: { storyId_tagId: { storyId, tagId: tag.id } },
      create: { storyId, tagId: tag.id, prefilled: true },
      update: {},
    });
  }
  // Suggestions для rating/warnings/category — пишем в Story.aiTagSuggestion JSON-blob для UI.
  await prisma.story.update({
    where: { id: storyId },
    data: { aiTagSuggestion: result as object },
  });
  console.log('[auto-tag] done', { storyId, tags: result.freeform_tags.length });
}
