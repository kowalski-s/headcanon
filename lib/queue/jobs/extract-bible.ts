import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import * as bibleExtract from '@/lib/prompts/bible-extract';

export interface ExtractBibleJob {
  chapterId: string;
}

export async function handleExtractBible(job: { data: ExtractBibleJob }) {
  const { chapterId } = job.data;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      paragraphs: { orderBy: { ordinal: 'asc' } },
      story: { include: { characters: true, characterStates: true, worldState: true } },
    },
  });
  if (!chapter) return;
  const chapterText = chapter.paragraphs.map((p) => p.text).join('\n\n');
  const characterRoster = chapter.story.characters.map((c) => c.name);

  const prompt = bibleExtract.build({
    chapterText,
    priorWorldState: (chapter.story.worldState?.stateJson ?? null) as object | null,
    priorCharacterStates: chapter.story.characterStates.map((s) => s.stateJson as object),
    characterRoster,
  });

  const result = await openaiLlm.completeStructured({
    callType: 'bible_extract',
    templateId: bibleExtract.TEMPLATE_ID,
    templateVersion: bibleExtract.TEMPLATE_VERSION,
    schema: bibleExtract.BibleExtractSchema,
    ...prompt,
    contextIds: { storyId: chapter.storyId, chapterId },
  });

  await prisma.$transaction(async (tx) => {
    // upsert world state
    await tx.worldState.upsert({
      where: { storyId: chapter.storyId },
      create: {
        storyId: chapter.storyId,
        stateJson: result.updated_world_state,
        updatedAtChapter: chapter.ordinal,
      },
      update: {
        stateJson: result.updated_world_state,
        updatedAtChapter: chapter.ordinal,
      },
    });
    // upsert character states (match by name → characterId)
    for (const cs of result.updated_character_states) {
      const character = chapter.story.characters.find(
        (c) => c.name.toLowerCase() === cs.character_name.toLowerCase(),
      );
      if (!character) continue;
      await tx.characterState.upsert({
        where: {
          characterId_storyId: { characterId: character.id, storyId: chapter.storyId },
        },
        create: {
          characterId: character.id,
          storyId: chapter.storyId,
          stateJson: cs as object,
          updatedAtChapter: chapter.ordinal,
        },
        update: { stateJson: cs as object, updatedAtChapter: chapter.ordinal },
      });
    }
    // upsert chapter summary
    await tx.chapterSummary.upsert({
      where: { chapterId },
      create: { chapterId, summary: result.chapter_summary },
      update: { summary: result.chapter_summary },
    });
  });
  console.log('[extract-bible] done', { chapterId, ordinal: chapter.ordinal });
}
