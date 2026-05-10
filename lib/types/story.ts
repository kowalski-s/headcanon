export type FandomColor = { color1: string; color2: string };

export type Fandom = {
  id: string;
  name: string;
  slug: string;
  color1: string;
  color2: string;
};

export type FandomChip = {
  id: string;
  name: string;
  sub?: string;
  active?: boolean;
};

export type StoryAuthor = { id: string; handle: string };

export type Story = {
  id: string;
  title: string;
  fandom: Fandom;
  pair: string;
  tagline: string;
  cover: string | null;
  likes: number;
  chapters: number;
  hasWatch: boolean;
  watchEpisodes?: number;
  author: StoryAuthor;
};

export type ChapterState = 'read' | 'reading' | 'unread' | 'locked' | 'generating';

export type Chapter = {
  n: number;
  title: string;
  minutes: number;
  state: ChapterState;
};

export type ReadingProgress = {
  lastChapterN: number;
  lastParagraph: number;
};

export type StoryDetail = {
  story: Story;
  chapters: Chapter[];
  progress: ReadingProgress | null;
  watchAvailable: boolean;
  saved: boolean;
};

export type ChapterContent = {
  storyId: string;
  n: number;
  title: string;
  // Optional scene title shown as body h1 (chapter.title stays in breadcrumb/TOC).
  section?: string;
  paragraphs: string[];
};
