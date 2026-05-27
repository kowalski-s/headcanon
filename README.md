# Headcanon

Инструмент для авторов фанфиков с AI-помощником + two-sided market: автор пишет сам (AI ассистирует — редактор, идеи, world-building, character bible), читатели читают и слушают, генерация по промпту — вторичный виральный канал. Видео — отложено, только для оригинальных миров автора.

**Формула:** NovelAI × Sudowrite × AO3, заточенные под фандомное комьюнити.

> **Пивот v2** ([Notion](https://www.notion.so/36b2a47b0ca181669ea3ce37d9893091)): writer-first вместо generator-first. Обоснование — [docs/vision.md](docs/vision.md).

## Документы

- [Vision](docs/vision.md) — что строим и для кого
- [Roadmap](docs/roadmap.md) — фазы и милестоуны (высокий уровень)
- [Tech stack](docs/tech-stack.md) — стек и обоснования
- [Architecture](docs/architecture.md) — пайплайн и data model
- [CLAUDE.md](CLAUDE.md) — инструкции для AI-агентов в этом репо

## Дизайн-handoff (`/handoff`)

Источник правды по дизайну: токены, типографика, спеки экранов, прототипы и канонический implementation backlog. Создан Claude Design.

- [handoff/README.md](handoff/README.md) — порядок чтения
- [handoff/DESIGN.md](handoff/DESIGN.md) — дизайн-система (направление: **Editorial Y2K**)
- [handoff/TASKS.md](handoff/TASKS.md) — implementation backlog v2 (legacy v1 + Phase 1 Writer MVP W-тикеты)
- [handoff/screens/](handoff/screens/) — спеки 6 экранов
- [handoff/prototypes/headcanon.html](handoff/prototypes/headcanon.html) — рабочий прототип в браузере

## Полная стратегия

Расширенные брейнстормы, экономика, конкуренты, killer features, дизайн-исследование (с альтернативами «Cozy Cinematic», «Y2K Tumblr revival», «Anime/Manga inflected» — финал в `/handoff`):
[Headcanon в Notion](https://www.notion.so/Headcanon-35b2a47b0ca180a38b17c1c83f4fb88d)

Принцип разделения: код-релевантные доки и канонические решения — здесь, в репо. Длинные стратегические тексты, экономика и эстетические исследования — в Notion.
