import type { Story, Fandom, FandomChip } from '@/lib/types/story';

const aftg: Fandom = {
  id: 'aftg',
  name: 'All for the Game',
  slug: 'all-for-the-game',
  color1: '#1a0f0a',
  color2: '#2d1810',
};

const hp: Fandom = {
  id: 'hp',
  name: 'Harry Potter',
  slug: 'harry-potter',
  color1: '#0e1a2b',
  color2: '#1a2438',
};

const naruto: Fandom = {
  id: 'naruto',
  name: 'Naruto',
  slug: 'naruto',
  color1: '#2b0e0e',
  color2: '#3a1818',
};

const jjk: Fandom = {
  id: 'jjk',
  name: 'JJK',
  slug: 'jjk',
  color1: '#1a1a2e',
  color2: '#16213e',
};

export const fandomChips: FandomChip[] = [
  { id: 'all', name: 'все', active: true },
  { id: 'aftg', name: 'AFTG', sub: 'foxhole court' },
  { id: 'hp', name: 'HP', sub: 'дрэмиона' },
  { id: 'naruto', name: 'naruto', sub: 'sasunaru' },
  { id: 'jjk', name: 'JJK', sub: 'satosugu' },
];

export const heroStory: Story = {
  id: 'hero-1',
  title: 'кто остаётся в полночь',
  fandom: aftg,
  pair: 'Эндрю × Нил',
  tagline: 'когда лисы спят, на крыше остаются только двое',
  cover: null,
  likes: 24800,
  chapters: 14,
  hasWatch: true,
  watchEpisodes: 4,
  author: { id: 'u1', handle: 'palmetto' },
};

export const feedStories: Story[] = [
  {
    id: 's1',
    title: 'дешифровка',
    fandom: hp,
    pair: 'Драко × Гермиона',
    tagline: 'библиотека пуста, кроме них двоих',
    cover: null,
    likes: 12300,
    chapters: 9,
    hasWatch: false,
    author: { id: 'u2', handle: 'parchment' },
  },
  {
    id: 's2',
    title: 'дозор',
    fandom: naruto,
    pair: 'Саске × Наруто',
    tagline: 'третий час ночи на границе',
    cover: null,
    likes: 8700,
    chapters: 6,
    hasWatch: true,
    watchEpisodes: 2,
    author: { id: 'u3', handle: 'shinobi' },
  },
  {
    id: 's3',
    title: 'без проклятий',
    fandom: jjk,
    pair: 'Годжо × Гето',
    tagline: 'если бы они остались в академии',
    cover: null,
    likes: 15600,
    chapters: 11,
    hasWatch: true,
    watchEpisodes: 3,
    author: { id: 'u4', handle: 'limitless' },
  },
  {
    id: 's4',
    title: 'правила игры',
    fandom: aftg,
    pair: 'Кевин × Жан',
    tagline: 'старые шрамы новые партнёры',
    cover: null,
    likes: 5400,
    chapters: 4,
    hasWatch: false,
    author: { id: 'u5', handle: 'queen' },
  },
  {
    id: 's5',
    title: 'непрочитанное',
    fandom: hp,
    pair: 'Гарри × Драко',
    tagline: 'переписка восьмого курса',
    cover: null,
    likes: 9200,
    chapters: 7,
    hasWatch: false,
    author: { id: 'u6', handle: 'eighthyear' },
  },
];

export function getStoryById(id: string): Story | undefined {
  return [heroStory, ...feedStories].find((s) => s.id === id);
}
