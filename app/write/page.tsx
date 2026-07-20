import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { NewStoryButton } from '@/components/layout/NewStoryButton';
import { HeroLead } from '@/components/desk/HeroLead';
import { DeskShelf } from '@/components/desk/DeskShelf';
import { MomentumPanel } from '@/components/desk/MomentumPanel';
import { EmptyDesk } from '@/components/desk/EmptyDesk';
import { countWords } from '@/lib/write/word-count';
import { computeStreak, deskKicker, deskLead, sparklineDays } from '@/lib/write/momentum';

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
      <main className="min-h-screen bg-bg text-ink">
        <EmptyDesk />
      </main>
    );
  }

  const today = new Date();

  // Активная = самая свежая по updatedAt (findMany отсортирован desc).
  const activeId = stories[0].id;
  const deskStories = stories.map((s) => ({
    id: s.id,
    title: s.title,
    ordinalCount: s.chapters.length,
    words: s.chapters.reduce((sum, c) => sum + countWords(c.text ?? ''), 0),
    visibility: s.visibility,
    isActive: s.id === activeId,
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
  const continueHref = lastChapter ? `/write/${last.id}?ch=${lastChapter.ordinal}` : null;
  const continueLabel = lastChapter ? `продолжить гл. ${lastChapter.ordinal}` : null;

  // Прогресс серии до финала (канва 05). Планового числа глав в модели нет —
  // берём разумный дефолт ~10, растягивая цель, если глав уже больше.
  const chapters = last.chapters.length;
  const series =
    chapters > 0
      ? {
          title: last.title,
          chapters,
          targetChapters: chapters >= 10 ? chapters + 2 : 10,
        }
      : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink">
      {/* свечной радиал у верхнего края (выразительный край, DESIGN-writer) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[18%] top-[-150px] h-[440px] w-[440px] bg-[radial-gradient(circle,var(--hc-glow),transparent_65%)]"
      />
      <SiteHeader active="desk" primaryAction={<NewStoryButton />} />
      <main className="relative z-[3] mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-7">
        <h1 className="sr-only">Мой стол</h1>
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <HeroLead
              kicker={deskKicker(today)}
              lead={lead}
              continueHref={continueHref}
              continueLabel={continueLabel}
            />
            <DeskShelf stories={deskStories} />
          </div>
          <MomentumPanel
            streak={computeStreak(stats, today)}
            sparkline={sparklineDays(stats, today)}
            series={series}
          />
        </div>
      </main>
    </div>
  );
}
