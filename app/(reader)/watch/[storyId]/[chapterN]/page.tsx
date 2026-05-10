import { WatchPageView } from '@/components/watch/WatchPageView';

export default async function WatchPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterN: string }>;
}) {
  const { storyId, chapterN } = await params;
  return <WatchPageView storyId={storyId} chapterN={chapterN} />;
}
