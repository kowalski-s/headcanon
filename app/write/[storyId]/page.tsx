import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { ChapterNav } from '@/components/write/ChapterNav';
import { EditorWorkspace } from '@/components/write/EditorWorkspace';

// Черновик всегда свежий из БД — активная глава и порядок меняются вне кэша.
export const dynamic = 'force-dynamic';

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
  const active = story.chapters.find((c) => c.ordinal === activeOrdinal) ?? story.chapters[0];
  const chapters = story.chapters.map((c) => ({ id: c.id, ordinal: c.ordinal, title: c.title }));

  // Пустая история — guided start вместо голого холста.
  if (!active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-ink">
        <Link
          href="/write"
          className="absolute left-6 top-5 font-mono text-mono-s tracking-caps uppercase text-ink-dim hover:text-ink"
        >
          ← на стол
        </Link>
        <h1 className="text-center font-display text-3xl italic text-ink">{story.title}</h1>
        <p className="font-body text-body-l italic text-ink-faint">Здесь пока чистый лист.</p>
        <div className="w-56">
          <ChapterNav storyId={story.id} chapters={[]} activeOrdinal={1} />
        </div>
      </div>
    );
  }

  return (
    <EditorWorkspace
      storyId={story.id}
      storyTitle={story.title}
      visibility={story.visibility}
      chapters={chapters}
      active={{ id: active.id, ordinal: active.ordinal, title: active.title, text: active.text }}
    />
  );
}
