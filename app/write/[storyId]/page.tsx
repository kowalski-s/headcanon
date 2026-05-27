import { notFound } from 'next/navigation';
import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { ChapterNav } from '@/components/write/ChapterNav';
import { ChapterEditor } from '@/components/write/ChapterEditor';
import { PublishToggle } from '@/components/write/PublishToggle';

type Props = {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ ch?: string }>;
};

export default async function WriteStoryPage({ params, searchParams }: Props) {
  const { storyId } = await params;
  const { ch } = await searchParams;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { chapters: { orderBy: { ordinal: 'asc' } } },
  });

  if (!story || story.authorId !== DEV_USER_ID) {
    notFound();
  }

  const activeOrdinal = Number(ch ?? '1');
  const active =
    story.chapters.find((c) => c.ordinal === activeOrdinal) ?? story.chapters[0];

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-DEFAULT">
        <h1 className="font-display text-2xl truncate">{story.title}</h1>
        <PublishToggle storyId={story.id} visibility={story.visibility} />
      </header>

      {/* Main layout */}
      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Left sidebar — chapter nav */}
        <aside className="w-56 shrink-0 border-r border-DEFAULT px-4 py-6">
          <ChapterNav
            storyId={story.id}
            chapters={story.chapters.map((c) => ({
              id: c.id,
              ordinal: c.ordinal,
              title: c.title,
            }))}
            activeOrdinal={active?.ordinal ?? 1}
          />
        </aside>

        {/* Center — editor or empty state */}
        <main className="flex-1 px-8 py-6">
          {active ? (
            <>
              <ChapterEditor
                key={active.id}
                chapterId={active.id}
                initialMarkdown={active.text}
              />
              {/* AI assistant placeholder — W3 */}
              <button
                disabled
                title="Скоро"
                className="mt-6 rounded-full border border-chrome-1/20 px-5 py-2.5 font-mono text-mono-m tracking-caps uppercase text-ink-dim opacity-40 cursor-not-allowed"
              >
                AI-ассистент
              </button>
            </>
          ) : (
            <p className="font-mono text-mono-s tracking-caps uppercase text-ink-dim">
              Добавьте первую главу с помощью кнопки слева.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
