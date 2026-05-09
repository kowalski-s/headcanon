import type { Chapter, ChapterContent, StoryDetail, ReadingProgress } from '@/lib/types/story';
import { heroStory, getStoryById } from './stories';

const heroChapters: Chapter[] = [
  { n: 1, title: 'первый матч', minutes: 4, state: 'read' },
  { n: 2, title: 'разговор на крыше', minutes: 5, state: 'read' },
  { n: 3, title: 'после игры', minutes: 4, state: 'read' },
  { n: 4, title: 'тишина в раздевалке', minutes: 6, state: 'read' },
  { n: 5, title: 'дорога домой', minutes: 4, state: 'read' },
  { n: 6, title: 'между сменами', minutes: 5, state: 'read' },
  { n: 7, title: 'полночное чтиво', minutes: 4, state: 'reading' },
  { n: 8, title: 'утро воскресенья', minutes: 5, state: 'unread' },
  { n: 9, title: 'разговор с Беттси', minutes: 6, state: 'unread' },
  { n: 10, title: 'тренировка вне расписания', minutes: 4, state: 'unread' },
  { n: 11, title: 'команда против команды', minutes: 7, state: 'unread' },
  { n: 12, title: 'звонок в три ночи', minutes: 5, state: 'unread' },
  { n: 13, title: 'возвращение', minutes: 6, state: 'unread' },
  { n: 14, title: 'финал сезона', minutes: 8, state: 'locked' },
];

export function getStoryDetail(id: string): StoryDetail | null {
  const story = getStoryById(id);
  if (!story) return null;
  if (story.id !== heroStory.id) {
    return {
      story,
      chapters: Array.from({ length: story.chapters }, (_, i) => ({
        n: i + 1,
        title: `глава ${i + 1}`,
        minutes: 5,
        state: i === 0 ? 'unread' : 'unread',
      })),
      progress: null,
      watchAvailable: story.hasWatch,
      saved: false,
    };
  }
  return {
    story,
    chapters: heroChapters,
    progress: { lastChapterN: 7, lastParagraph: 0 },
    watchAvailable: true,
    saved: true,
  };
}

const ch7: ChapterContent = {
  storyId: heroStory.id,
  n: 7,
  title: 'полночное чтиво',
  paragraphs: [
    'Крыша всё ещё держала тепло прошедшего дня, и Нил подтянул колени к груди, упираясь подбородком в ткань тренировочной футболки. Огни Палметто внизу мигали ровно, как метроном, по которому можно было засыпать, если бы вообще получалось.',
    'Эндрю сидел рядом, в полуметре, вытянув ноги. Сигарета в его пальцах уже почти догорела, но он не торопился её гасить. Он молчал — но это было то самое его молчание, которое не значило отсутствие.',
    'Минут пять назад Нил спросил, что он читает. Эндрю ответил «ничего», и этого хватило.',
    '— Я не понимаю, почему ты остаёшься, — наконец сказал Нил, не глядя на него.',
    '— Сто процентов, — отозвался Эндрю. — Это и не должно быть понятно.',
    'Нил повернул голову. В свете далёкой неоновой вывески над парковкой ресницы Эндрю отбрасывали короткую тень. Он выглядел уставшим — не больше обычного, но иначе. Как человек, который долго что-то решал и теперь принял.',
    '— Ты злишься?',
    '— Нет.',
    '— Я не верю.',
    'Эндрю наконец посмотрел на него — спокойно, без вызова. — Тогда не верь.',
    'Сигарета погасла сама. Эндрю стряхнул пепел в банку, которую кто-то из лис оставил здесь ещё в сентябре. Нил всё ещё смотрел на него и думал, что у крыши есть одно странное свойство: на ней всё, что он говорил вслух, звучало честнее, чем внизу.',
    '— Кевин думает, ты собираешься ехать на тренировочный лагерь раньше команды, — сказал Нил.',
    '— Кевин много думает.',
    '— И что я должен ему сказать?',
    'Эндрю пожал плечами. — Скажи ему правду. Я не еду никуда без тебя.',
  ],
};

export function getChapterContent(storyId: string, n: number): ChapterContent | null {
  if (storyId === heroStory.id && n === 7) return ch7;
  return null;
}

export const heroProgress: ReadingProgress = { lastChapterN: 7, lastParagraph: 0 };
