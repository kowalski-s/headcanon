'use client';

import { use } from 'react';
import { ReaderPageView } from './ReaderPageView';

type Params = { storyId: string; chapterN: string };

export default function ReaderPage({ params }: { params: Promise<Params> }) {
  const { storyId, chapterN } = use(params);
  return <ReaderPageView storyId={storyId} chapterN={chapterN} />;
}
