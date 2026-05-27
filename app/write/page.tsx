import { DEV_USER_ID } from '@/lib/auth/dev-user';
import { prisma } from '@/lib/prisma';
import { StoryList } from '@/components/write/StoryList';

export default async function WritePage() {
  const stories = await prisma.story.findMany({
    where: { authorId: DEV_USER_ID, source: 'WRITTEN' },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, visibility: true },
  });

  return (
    <div className="min-h-screen bg-bg text-ink px-4 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-4xl mb-8">Мои истории</h1>
      <StoryList stories={stories} />
    </div>
  );
}
