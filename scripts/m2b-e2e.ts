// scripts/m2b-e2e.ts
//
// M2-B smoke: chapter 2 priorState reflects extracted chapter 1 bible.
//
// [$$$ WARNING] This makes a real LLM call (extract-bible worker hits OpenAI).
//
// Prerequisites:
//   pnpm worker  ← required: pg-boss worker must pick up extract-bible job
//   LLM env vars set (OPENAI_API_KEY or proxy equivalent)
//   pnpm dev     ← optional, only if you want to manually test /reader stream
//
// Run:
//   pnpm qa:m2b

import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { enqueue } from '@/lib/queue/boss';
import { loadPriorState } from '@/lib/chapter/load-prior-state';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('[$$$ WARNING] This makes a real LLM call.');
  console.log('M2-B smoke — requires: pnpm worker running, OPENAI_API_KEY set.\n');

  let story: Awaited<ReturnType<typeof createTestStoryWithChapter>>['story'] | null = null;
  let success = false;

  try {
    // ── [setup] ──────────────────────────────────────────────────────────────
    console.log('[setup] Creating test story, chapter, paragraphs, characters …');
    const fixture = await createTestStoryWithChapter();
    story = fixture.story;
    const { chapter } = fixture;

    await prisma.paragraph.createMany({
      data: [
        { chapterId: chapter.id, ordinal: 1, text: 'В библиотеке было тихо.' },
        { chapterId: chapter.id, ordinal: 2, text: 'Гермиона листала книгу.' },
        { chapterId: chapter.id, ordinal: 3, text: 'Гарри сел рядом.' },
      ],
    });

    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { status: 'PUBLISHED' },
    });

    // Characters need to exist so the worker can match names and upsert CharacterState
    await prisma.character.createMany({
      data: [
        { storyId: story.id, name: 'Гермиона', description: 'Умная волшебница, лучшая подруга Гарри.' },
        { storyId: story.id, name: 'Гарри', description: 'Мальчик, который выжил.' },
      ],
    });

    console.log(`   ↳ story.id: ${story.id}, chapter.id: ${chapter.id}`);

    // ── [enqueue] ────────────────────────────────────────────────────────────
    console.log('[enqueue] Enqueuing extract-bible job …');
    const jobId = await enqueue('extract-bible', { chapterId: chapter.id }, { singletonKey: chapter.id });
    console.log(`   ↳ job id: ${jobId ?? '(singleton deduped — already queued)'}`);

    // ── [poll] ───────────────────────────────────────────────────────────────
    console.log('[poll] Waiting for ChapterSummary (max 60s) …');
    const startAt = Date.now();
    const TIMEOUT_MS = 60_000;
    let chapterSummary: { summary: string } | null = null;

    process.stdout.write('   ');
    while (Date.now() - startAt < TIMEOUT_MS) {
      chapterSummary = await prisma.chapterSummary.findUnique({
        where: { chapterId: chapter.id },
      });
      if (chapterSummary) break;
      process.stdout.write('.');
      await sleep(2_000);
    }
    process.stdout.write('\n');

    if (!chapterSummary) {
      throw new Error(
        `Timeout: ChapterSummary not created after ${TIMEOUT_MS / 1000}s. ` +
          'Is `pnpm worker` running? Is OPENAI_API_KEY set?',
      );
    }

    console.log(`   ↳ ChapterSummary created (${chapterSummary.summary.length} chars)`);
    console.log(`   ↳ preview: "${chapterSummary.summary.slice(0, 80)}"`);

    // ── [verify] ─────────────────────────────────────────────────────────────
    console.log('[verify] Checking priorState for chapter 2 …');

    const priorState = await loadPriorState(story.id, 2);
    if (!priorState) {
      throw new Error(
        'priorState was null — coherence broken. ' +
          'Worker likely did not upsert WorldState (required for priorState to be non-null).',
      );
    }

    // For chapterOrdinal=2: summaries query is ordinal < 1 → empty (chapter 1 summary
    // is NOT in summaries; it appears as recentChapters[0] full paragraphs instead).
    if (priorState.summaries.length !== 0) {
      throw new Error(
        `Expected summaries.length === 0 for chapter 2, got ${priorState.summaries.length}`,
      );
    }

    // recentChapters[0] should be the chapter-1 paragraphs joined
    if (priorState.recentChapters.length !== 1) {
      throw new Error(
        `Expected recentChapters.length === 1, got ${priorState.recentChapters.length}`,
      );
    }
    const recentText = priorState.recentChapters[0];
    if (!recentText.includes('библиотеке')) {
      throw new Error(
        `Expected recentChapters[0] to contain 'библиотеке', got: "${recentText.slice(0, 120)}"`,
      );
    }
    console.log(`   ↳ recentChapters[0] includes 'библиотеке' ✓`);

    // worldState should be populated by the worker
    const worldState = priorState.worldState as Record<string, unknown>;
    const location = worldState['current_location'];
    if (!location) {
      throw new Error(
        `worldState.current_location is empty — worker may not have populated WorldState correctly. ` +
          `worldState: ${JSON.stringify(worldState).slice(0, 200)}`,
      );
    }
    console.log(`   ↳ worldState.current_location: "${String(location).slice(0, 80)}" ✓`);

    // characterStates — worker should have created at least one for Гермиона or Гарри
    if (priorState.characterStates.length < 1) {
      throw new Error(
        `Expected at least 1 CharacterState, got 0. ` +
          'Worker may have failed to match character names.',
      );
    }
    console.log(`   ↳ characterStates.length: ${priorState.characterStates.length} ✓`);

    // ── [cleanup] ────────────────────────────────────────────────────────────
    console.log('[cleanup] Deleting test story (cascade) …');
    await prisma.story.delete({ where: { id: story.id } });
    story = null; // mark cleaned up
    console.log('   ↳ deleted ✓');

    success = true;
  } catch (err: unknown) {
    console.error('\n✗ M2-B smoke FAILED:', err);
    if (story) {
      console.log(
        `\n[inspect] Test story left in DB for debugging: story.id = ${story.id}`,
        '\n          Run `pnpm db:studio` to inspect.',
      );
    }
    process.exit(1);
  }

  if (success) {
    console.log('\n✓ M2-B smoke OK — chapter 2 priorState correctly reflects extracted chapter 1.');
    process.exit(0);
  }
}

void main();
