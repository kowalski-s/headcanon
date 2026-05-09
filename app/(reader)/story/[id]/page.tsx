'use client';

import { use } from 'react';
import { StoryPageView } from './StoryPageView';

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StoryPageView id={id} />;
}
