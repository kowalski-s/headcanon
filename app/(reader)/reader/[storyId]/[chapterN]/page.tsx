import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { chapterToParagraphs } from '@/lib/reader/written-paragraphs';
import { ReaderPageView } from './ReaderPageView';

type Params = { storyId: string; chapterN: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server component — resolves storyId + ordinal → chapterId + initial paragraphs.
 *
 * Option A: pre-fetch on the server so the client never has to do a separate
 * storyId→chapterId lookup. Non-UUID story keys fall through to the fixture path
 * so M1 preview URLs (e.g. /reader/hero-1/7) keep working unchanged.
 */
export default async function ReaderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { storyId, chapterN } = await params;
  const ordinal = Number(chapterN);

  // Non-UUID keys → fixture fallback (M1 preview URLs).
  if (!UUID_RE.test(storyId)) {
    return <ReaderPageView storyId={storyId} chapterN={chapterN} />;
  }

  const chapter = await prisma.chapter.findFirst({
    where: { storyId, ordinal },
    include: {
      paragraphs: { orderBy: { ordinal: 'asc' } },
      story: { select: { title: true, authorId: true } },
    },
  });

  if (!chapter) notFound();

  return (
    <ReaderPageView
      storyId={storyId}
      chapterN={chapterN}
      live={{
        chapterId: chapter.id,
        title: chapter.story.title,
        ordinal: chapter.ordinal,
        authorId: chapter.story.authorId,
        initialParagraphs:
          chapter.paragraphs.length > 0
            ? chapter.paragraphs.map((p) => ({ id: p.id, text: p.text }))           // generator path — unchanged
            : chapterToParagraphs(chapter).map((text, i) => ({ id: `${chapter.id}-${i}`, text })), // writer path
      }}
    />
  );
}
