# Screen 05 — Watch mode (Mobile)

**Path:** `/watch/[storyId]/[chapterN]/[episodeN]`
**Prototype:** артборд `mix-watch`, функция `MixWatchMobile()`

---

## Интент

Glanceable альтернатива чтению: 4 эпизода × ~4 минуты, **только аудио + кинематографический still + субтитры-диалоги**. Это НЕ видеоплеер с лицами и не TikTok-вертикалка. Ближе к Apple TV+ trailer-mode или Spotify-podcast-with-art.

---

## Структура

1. **Status bar** — нативный.
2. **Top chrome** — `×` close (вернёт в reader), по центру: mono `WATCH MODE · EP 02 / 04` + Bodoni-italic название главы амбером, справа `⌄` (collapse mini-player).
3. **Hero frame 16:9** — кинематографичный still с обложки главы:
   - Градиент-фон + плёночное зерно + виньетка
   - **Свечной glow** (амбер radial + blur, mix-blend-mode screen) с 2-3 точками света — анимируется breath 6s
   - Timecode top-right, mono `03:42 / 04:21`
   - **Субтитр-карточка** снизу: backdrop-blur, mono имя персонажа амбером (`ДРАКО`), Bodoni-italic 16px реплика — диалог из текста главы, с амбер-курсивом на ключевом слове
4. **Scrubber** — амбер-fill полоса с glow-точкой ручки. Tap-to-seek, drag.
5. **Transport controls** — `« 10` rewind / `◂◂` prev sentence / **▶/❚❚** big amber button с glow / `▸▸` next sentence / `10 »` forward.
6. **Episode chips** — 4 карточки 140px, horizontal scroll. Done = checkmark mono, Now = амбер-border + амбер-soft-fill, Next = surface-fill outline.
7. **Footer** — Bodoni-italic ссылка «предпочитаешь буквы? **читать главу →**» — обратная конверсия в reader.

---

## TTS пайплайн

Озвучка через **ElevenLabs**:

- Один голос на нарратора (нейтральный)
- Отдельные голоса для главных персонажей (определяются по фандому: для ГП Драко — UK male young, Гермиона — UK female young, и т.д.)
- Бэк генерит .mp3 при первом запросе главы → cache в Supabase Storage
- Клиент стримит mp3 через `<audio>` с low-latency

```ts
POST /api/watch/generate
body: { storyId, chapterN }
→ { episodes: [{ n, audioUrl, subtitles: Subtitle[] }] }

type Subtitle = {
  startMs: number;
  endMs: number;
  speaker: string | 'narrator';
  text: string;
  emphasis?: { start: number, end: number }; // диапазон в text для italic-амбер
};
```

---

## Cinematic still

Это **не реальные кадры из фильма** (copyright). Это:
- Той же обложки градиент в 16:9 пропорции
- Плёночное зерно (`textures/grain.png`, opacity 0.18, blend overlay)
- Виньетка
- Анимированные свечные точки (1-3 шт., position рандомизирован под эпизод)
- Опционально через Replicate/fal.ai — мудабельный environment-shot («empty corridor at night, snow through window») с теми же цветами что и обложка

**Нет лиц.** Это намеренно — продукт = ваше воображение.

---

## Edge cases

- Аудио ещё не сгенерировано → mono-state «✦ озвучиваем эпизоды… ~40 сек», прогресс по эпизодам пакета (3/4).
- Юзер свайпает вверх → сворачивается в mini-player (как Spotify), play продолжается, в шапке других экранов появляется тонкая полоска «▶ ep 02 · 03:42».
- Девайс перешёл на bluetooth → не пересоздавать плеер.
- Auto-advance в конце эпизода 2 → fade-out 600ms + crossfade на 16:9 эпизода 3, новые субтитры приезжают.
- Сабтайтлы для глухих доступности — toggle в Aa-меню Reader (общая настройка).
- Lock-screen / control-center — корректные media metadata (cover art = постер, title = эпизод name, artist = author handle).

---

## Tracking

- `watch_started { story_id, chapter_n, source: 'story' | 'reader' | 'feed' }`
- `watch_episode_completed { ep_n }`
- `watch_paused { at_ms, ep_n }`
- `watch_seek { from_ms, to_ms }`
- `watch_minimized`
- `watch_back_to_reader` — конверсия из watch обратно в чтение
- `watch_session_total_listened_ms`

---

## Что отличается от прототипа

- В прототипе только Watch ep 02 один state. Нужно: collapsed mini-player, generating state, completion state с CTA «следующая глава →».
- Auto-advance между эпизодами — не показан в прототипе, обязателен.
- Lock-screen integration — нет в прототипе, обязателен (это часть «бесшовности»).
