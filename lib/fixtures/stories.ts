import type { Story, Fandom, FandomChip } from '@/lib/types/story';

const aftg: Fandom = {
  id: 'aftg',
  name: 'foxhole court',
  slug: 'all-for-the-game',
  color1: '#3a160a',
  color2: '#1a0a06',
};

const hp: Fandom = {
  id: 'hp',
  name: 'Hogwarts',
  slug: 'harry-potter',
  color1: '#2d1432',
  color2: '#4a1d35',
};

const naruto: Fandom = {
  id: 'naruto',
  name: 'Naruto',
  slug: 'naruto',
  color1: '#3a1010',
  color2: '#1a0808',
};

const jjk: Fandom = {
  id: 'jjk',
  name: 'JJK',
  slug: 'jjk',
  color1: '#1a1432',
  color2: '#2a1a4a',
};

export const fandomChips: FandomChip[] = [
  { id: 'all', name: 'все', active: true },
  { id: 'hp', name: 'Хогвартс' },
  { id: 'aftg', name: "Baldur's Gate 3" },
  { id: 'avatar', name: 'Avatar' },
  { id: 'naruto', name: 'Дары смерти' },
];

// Hero matches v2 mocaps: HP/Dramione, Зимний свет в подземельях, @LunaHalf, 14ch / на 7-й.
export const heroStory: Story = {
  id: 'hero-1',
  title: 'Зимний свет в подземельях.',
  fandom: hp,
  pair: 'Драко × Гермиона',
  tagline:
    'Год седьмой. Хогвартс под комендантским часом — единственный, кто заметил её отсутствие в библиотеке, последний человек, которого она хотела бы видеть.',
  cover: null,
  likes: 24800,
  chapters: 14,
  hasWatch: true,
  watchEpisodes: 4,
  author: { id: 'u-luna', handle: 'LunaHalf' },
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
