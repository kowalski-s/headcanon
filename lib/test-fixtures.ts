import { prisma } from '@/lib/prisma';

export async function createTestUser(id = '00000000-0000-0000-0000-000000000001') {
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email: `${id}@hc.test`, handle: id.slice(0, 8) },
  });
}

export async function createTestStoryWithChapter() {
  const user = await createTestUser();
  const story = await prisma.story.create({
    data: { authorId: user.id, title: 'test', visibility: 'PRIVATE' },
  });
  const chapter = await prisma.chapter.create({
    data: { storyId: story.id, ordinal: 1, status: 'DRAFT' },
  });
  await prisma.chapterUsage.create({ data: { chapterId: chapter.id } });
  return { user, story, chapter };
}
