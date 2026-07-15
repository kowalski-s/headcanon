import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { DeskShelf } from '@/components/desk/DeskShelf';
import { MomentumPanel } from '@/components/desk/MomentumPanel';
import { EmptyDesk } from '@/components/desk/EmptyDesk';
import { countWords } from '@/lib/write/word-count';
import { computeStreak, deskLead, sparklineDays } from '@/lib/write/momentum';

// Стол время-зависим (стрик, «N ночей назад») — без этого Next пререндерит
// страницу статически на билде и данные замерзают до следующего деплоя.
export const dynamic = 'force-dynamic';

export default async function DeskPage() {
  const [stories, stats] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: DEV_USER_ID, source: 'WRITTEN' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        visibility: true,
        updatedAt: true,
        chapters: {
          select: { text: true, ordinal: true, updatedAt: true },
          orderBy: { ordinal: 'asc' },
        },
      },
    }),
    prisma.writingStat.findMany({
      where: { userId: DEV_USER_ID, date: { gte: new Date(Date.now() - 30 * 86_400_000) } },
      select: { date: true, wordsAdded: true },
    }),
  ]);

  if (stories.length === 0) {
    return (
      <main className="min-h-screen bg-bg px-4 py-10 text-ink">
        <EmptyDesk />
      </main>
    );
  }

  const today = new Date();
  const deskStories = stories.map((s) => ({
    id: s.id,
    title: s.title,
    ordinalCount: s.chapters.length,
    words: s.chapters.reduce((sum, c) => sum + countWords(c.text ?? ''), 0),
    isPublished: s.visibility === 'PUBLIC',
  }));

  const last = stories[0];
  const lastChapter = last.chapters.at(-1);
  const lead = lastChapter
    ? deskLead({
        storyTitle: last.title,
        chapterOrdinal: lastChapter.ordinal,
        lastEditedAt: last.updatedAt,
        today,
      })
    : '';

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-bg px-4 py-10 text-ink">
      <h1 className="font-display text-display-l mb-8">Мой стол</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <DeskShelf stories={deskStories} />
        <MomentumPanel
          streak={computeStreak(stats, today)}
          sparkline={sparklineDays(stats, today)}
          lead={lead}
          continueHref={lastChapter ? `/write/${last.id}` : null}
          continueLabel={lastChapter ? `продолжить главу ${lastChapter.ordinal}` : null}
        />
      </div>
    </main>
  );
}
