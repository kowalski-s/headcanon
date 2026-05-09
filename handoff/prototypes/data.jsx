// Shared mock data for headcanon design directions

const FANDOMS = [
  { id: 'hp',     name: 'Hogwarts',    sub: 'Гарри Поттер',     hue: 'хогвартс · слизерин · хедканон',  count: '128.4k', emoji: '⚡', color1: '#5B2A4F', color2: '#0E1A36' },
  { id: 'bg3',    name: 'Baldur\u2019s Gate 3',sub: 'BG3 · Faerûn',     hue: 'origin · companions · авадой',    count: '64.1k',  emoji: '🜲', color1: '#7C2A2A', color2: '#1B0F1B' },
  { id: 'atla',   name: 'Avatar',      sub: 'Последний маг воздуха',  hue: 'zukka · taang · enemies-to-lovers', count: '41.8k', emoji: '☄', color1: '#A04A1F', color2: '#1F1A0E' },
  { id: 'jjk',    name: 'Jujutsu',     sub: 'Магическая битва',      hue: 'gojo · geto · stsg',          count: '95.7k',  emoji: '✶', color1: '#1E2A4D', color2: '#0A0E1A' },
  { id: 'genshin',name: 'Genshin',     sub: 'Тейват',                 hue: 'kaeya · diluc · zhongchi',    count: '212.3k', emoji: '✦', color1: '#3A6E8F', color2: '#0E1830' },
];

const TROPES = [
  { id: 'enemies', name: 'enemies-to-lovers', heat: 'high',   note: 'Самый шерящийся троп · 58% всех публикаций' },
  { id: 'slowburn',name: 'slow burn',          heat: 'high',   note: '12+ глав, медленное напряжение' },
  { id: 'ts',     name: 'time travel',         heat: 'medium', note: 'AU с возвратом в прошлое' },
  { id: 'cs',     name: 'coffee shop AU',      heat: 'cozy',   note: 'Уютный modern AU без магии' },
  { id: 'soulmate',name:'soulmate marks',      heat: 'medium', note: 'Метки на коже, общие сны, запахи' },
  { id: 'fwb',    name: 'fake dating',         heat: 'high',   note: 'Притворные отношения → real feelings' },
  { id: 'hc',     name: 'hurt/comfort',        heat: 'cozy',   note: 'Травма → забота. Late-night бинж-троп' },
  { id: 'au',     name: 'modern AU',           heat: 'medium', note: 'Перенос вселенной в наши дни' },
];

// Story cards (one slot of mock content used across all 3 visual directions)
const STORIES = [
  {
    id: 's1',
    fandom: 'hp',
    title: 'Зимний свет в подземельях',
    subtitle: 'Глава 7 · Письмо, которое нельзя было писать',
    author: 'lunaxhalf',
    pair: 'Драко × Гермиона',
    trope: 'enemies-to-lovers · slow burn',
    chapters: 14,
    likes: '24.8k',
    minutes: 9,
    tagline: 'Год седьмой, Хогвартс под комендантским часом, и единственный, кто заметил её отсутствие в библиотеке — последний человек, которого она хотела бы видеть.',
    wm: 'WATCH · 4 эп.',
  },
  {
    id: 's2',
    fandom: 'bg3',
    title: 'И тогда он сказал — да',
    subtitle: 'Глава 2 · Между лагерем и Underdark',
    author: 'tav.exe',
    pair: 'Astarion × Tav',
    trope: 'soulmate marks · hurt/comfort',
    chapters: 6,
    likes: '11.2k',
    minutes: 7,
    tagline: 'Метка проявилась после Морнинг-Парка. Он смеётся. Ты не смеёшься.',
    wm: 'WATCH · 2 эп.',
  },
  {
    id: 's3',
    fandom: 'atla',
    title: 'Огонь, который помнит',
    subtitle: 'Глава 3 · После коронации',
    author: 'firelily',
    pair: 'Zuko × Katara',
    trope: 'slow burn · post-canon',
    chapters: 9,
    likes: '8.4k',
    minutes: 11,
    tagline: 'Прошло три года. Она приехала на коронацию. Он не ожидал, что забудет, как дышать.',
    wm: 'WATCH · 3 эп.',
  },
  {
    id: 's4',
    fandom: 'jjk',
    title: 'Шесть глаз, две души',
    subtitle: 'Глава 12 · До Сибуя',
    author: 'cursedwomb',
    pair: 'Gojo × Geto',
    trope: 'pre-canon · slow burn',
    chapters: 22,
    likes: '54.1k',
    minutes: 14,
    tagline: 'Им по семнадцать. Они ещё не знают, чем кончится. Они и так уже знают.',
    wm: 'WATCH · 6 эп.',
  },
  {
    id: 's5',
    fandom: 'genshin',
    title: 'Виноград и пепел',
    subtitle: 'Глава 5 · Дом семьи Рагнвиндр',
    author: 'monddrunk',
    pair: 'Kaeya × Diluc',
    trope: 'estranged brothers · slow burn',
    chapters: 18,
    likes: '32.6k',
    minutes: 10,
    tagline: 'Дилюк не пьёт. Кэйя приносит вино. Это не примирение — это начало.',
    wm: 'WATCH · 4 эп.',
  },
  {
    id: 's6',
    fandom: 'hp',
    title: 'Маховик в кармане мантии',
    subtitle: 'Глава 1 · Январь 1976',
    author: 'wolfstar.lib',
    pair: 'Ремус × Сириус',
    trope: 'time travel · canon divergence',
    chapters: 4,
    likes: '6.9k',
    minutes: 12,
    tagline: 'Гермиона потеряла маховик. Сириус его нашёл. Никто из них не должен был встретиться в 1976.',
    wm: 'WATCH · 1 эп.',
  },
];

// Reading sample for the Story Reader screen — used by all 3 directions
const CHAPTER_TEXT = [
  'Снег шёл четвёртый час, и в подземельях, как всегда зимой, пахло железом, кипячёной водой и старым пергаментом. Гермиона ненавидела это слово — «всегда». Особенно теперь, когда оно перестало значить хоть что-то определённое.',
  'Она пришла за книгой. Так она сказала бы себе, если бы кто-нибудь спросил. Книга действительно существовала: «Хроники нумерологии Северной Шотландии», том второй, о котором мадам Пинс говорила с таким благоговением, будто речь шла не о пыльном фолианте, а о ребёнке.',
  'Но книги не было. Была свеча, которая горела не там, где должна была. Был стул, отодвинутый от стола под углом, какой бывает, когда человек встал быстро и не вернулся. И был запах — тот самый, который она научилась узнавать в коридорах семь лет подряд: цитрус, можжевельник, дорогой одеколон, плохо скрывающий бессонницу.',
  'Драко стоял у окна. Спиной к ней. Рукав мантии задран — она увидела это в одну секунду и тут же отвела глаза, как отводят взгляд от чужого лица в чужой постели.',
  '— Грейнджер, — сказал он, не оборачиваясь. — Если ты пришла ругаться, я очень устал.',
];

// Story page — chapter list for a single story
const CHAPTER_LIST = [
  { n: 1,  t: 'Сова, которую никто не отправлял',         m: 8,  state: 'read' },
  { n: 2,  t: 'Профессор Слизнорт делает вид',             m: 7,  state: 'read' },
  { n: 3,  t: 'Дверь в Выручай-комнату не открывалась',    m: 9,  state: 'read' },
  { n: 4,  t: 'Письма, которые она не сожгла',             m: 11, state: 'read' },
  { n: 5,  t: 'Когда Малфой говорит — никто не слушает',   m: 8,  state: 'read' },
  { n: 6,  t: 'Снег, четвёртый час подряд',                m: 6,  state: 'read' },
  { n: 7,  t: 'Письмо, которое нельзя было писать',        m: 9,  state: 'reading' },
  { n: 8,  t: 'Зеркало, которое лгало бы — но не лжёт',    m: 10, state: 'next' },
  { n: 9,  t: 'Орден молчит, и это страшнее всего',        m: 8,  state: 'lock' },
  { n: 10, t: 'Малфой-мэнор зимой пуст',                   m: 12, state: 'lock' },
];

window.HC_DATA = { FANDOMS, TROPES, STORIES, CHAPTER_TEXT, CHAPTER_LIST };
