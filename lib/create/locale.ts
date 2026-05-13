import type { FocusType, Rating, Category, Pov, Tense, Tone } from '@prisma/client';

export const FOCUS_LABELS: Record<FocusType, string> = {
  ROMANCE: 'романтика',
  GEN: 'джен',
  CHARACTER_STUDY: 'один герой',
  FRIENDSHIP: 'дружба',
};

export const FOCUS_DESCRIPTIONS: Record<FocusType, string> = {
  ROMANCE: 'пейринг в центре сюжета',
  GEN: 'приключения, мистика, без любовной линии',
  CHARACTER_STUDY: 'один герой, его рост и арка',
  FRIENDSHIP: 'двое или больше — друзья, семья, союз',
};

export const RATING_LABELS: Record<Rating, string> = {
  GENERAL: 'общий',
  TEEN: '16+',
  MATURE: '18+',
  EXPLICIT: 'explicit',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  SLASH: 'слэш',
  FEMSLASH: 'фемслэш',
  HET: 'гет',
  GEN: 'джен',
  MULTI: 'multi',
  OTHER: 'другое',
};

export const POV_LABELS: Record<Pov, string> = {
  FIRST: 'от первого лица',
  CLOSE_THIRD: 'третье близкое',
  OMNISCIENT: 'всеведущее',
};

export const TENSE_LABELS: Record<Tense, string> = {
  PAST: 'прошедшее',
  PRESENT: 'настоящее',
};

export const TONE_LABELS: Record<Tone, string> = {
  SLOW_BURN: 'слоуберн',
  SPICY: 'спайси',
  FLUFF: 'флафф',
  ANGST: 'ангст',
  HURT_COMFORT: 'хёрт/комфорт',
  CRACK: 'крэк',
  DARK: 'дарк',
};

export const WARNING_KEYS = ['death', 'violence', 'non_con', 'cntw'] as const;
export type WarningKey = (typeof WARNING_KEYS)[number];
export const WARNING_LABELS: Record<WarningKey, string> = {
  death: 'смерть персонажа',
  violence: 'жестокость',
  non_con: 'non-con',
  cntw: 'без предупреждений',
};

export const TIMELINE_KEYS = ['canon', 'pre', 'post', 'au'] as const;
export type TimelineKey = (typeof TIMELINE_KEYS)[number];
export const TIMELINE_LABELS: Record<TimelineKey, string> = {
  canon: 'канон',
  pre: 'pre-canon',
  post: 'post-canon',
  au: 'AU без канона',
};
