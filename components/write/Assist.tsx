'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from './useAssist';

type Chat = {
  messages: ChatMessage[];
  draft: string;
  setDraft: (v: string) => void;
  busy: boolean;
  send: (raw?: string) => void;
  expand: (instruction?: string) => void;
  retry: (id: string) => void;
  accept: (id: string) => void;
  dismiss: (id: string) => void;
};

const QUICK = ['что дальше?', 'вычитай сцену', 'проверь мир', 'найди повторы'];

// Прогресс-повествование вместо спиннера (DESIGN-writer.md §3).
const NARRATION = [
  'перечитываю твою сцену…',
  'держу в уме, что ещё не раскрыто…',
  'предлагаю ход — ты решаешь.',
];

function SuggestionCard({
  msg,
  chat,
}: {
  msg: Extract<ChatMessage, { kind: 'suggestion' }>;
  chat: Chat;
}) {
  if (msg.status === 'thinking') {
    return (
      <div className="rounded-xl border border-dashed border-amber/50 bg-bg-deep/40 px-4 py-3.5">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-candle-breath rounded-full bg-amber" aria-hidden />
          <span className="font-mono text-mono-s tracking-caps uppercase text-amber">
            соавтор думает
          </span>
        </div>
        {NARRATION.map((line) => (
          <p
            key={line}
            className="my-0.5 font-display text-[14px] italic leading-snug text-ink-dim"
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (msg.status === 'accepted') {
    return (
      <div className="flex items-center gap-2 px-1">
        <span className="font-mono text-mono-s tracking-caps uppercase text-amber">
          ✓ вставлено · продолжай своей рукой
        </span>
      </div>
    );
  }

  if (msg.status === 'error') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-DEFAULT bg-surface px-4 py-3">
        <span className="font-body text-[13px] italic text-ink-dim">
          Фрагмент застрял в подземельях.
        </span>
        <button
          type="button"
          onClick={() => chat.retry(msg.id)}
          className="font-ui text-[11px] text-amber hover:underline"
        >
          ещё раз ↻
        </button>
      </div>
    );
  }

  // ready — амбер-pending карточка (accept / retry / reject)
  return (
    <div className="overflow-hidden rounded-xl border border-amber/40 bg-gradient-to-b from-amber-soft to-transparent">
      <div className="border-l-2 border-amber px-4 py-3.5">
        <span className="mb-1.5 block font-mono text-mono-s tracking-caps uppercase text-amber">
          ◐ предложение · ещё не в тексте
        </span>
        {msg.teaser && (
          <p className="mb-1.5 font-mono text-mono-s tracking-caps uppercase text-ink-faint">
            {msg.teaser}
          </p>
        )}
        <p className="whitespace-pre-line font-body text-[14.5px] italic leading-relaxed text-ink">
          {msg.passage}
        </p>
      </div>
      <div className="flex items-center gap-2 border-t border-amber/20 bg-black/15 px-3 py-2.5">
        <button
          type="button"
          onClick={() => chat.accept(msg.id)}
          className="rounded-full bg-amber px-3 py-1 font-display text-[12px] font-medium italic text-bg"
        >
          в текст ✓
        </button>
        <button
          type="button"
          onClick={() => chat.retry(msg.id)}
          className="rounded-full border border-amber/50 px-2.5 py-1 font-ui text-[11px] text-amber"
        >
          иначе ↻
        </button>
        <button
          type="button"
          onClick={() => chat.dismiss(msg.id)}
          className="rounded-full border border-DEFAULT px-2.5 py-1 font-ui text-[11px] text-ink-faint hover:text-ink-dim"
        >
          мимо
        </button>
        <span className="flex-1" />
        <span className="font-mono text-[8px] tracking-caps uppercase text-ink-faint">
          человек · AI-ассистировано
        </span>
      </div>
    </div>
  );
}

function Thread({ chat }: { chat: Chat }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const parent = endRef.current?.parentElement;
    if (parent) parent.scrollTop = parent.scrollHeight;
  }, [chat.messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3.5">
      {chat.messages.length === 0 && (
        <p className="mt-2 font-body text-[13px] italic leading-relaxed text-ink-faint">
          Я перечитала твою главу. Спроси что угодно о своём тексте — или попроси развернуть
          продолжение сцены.
        </p>
      )}
      {chat.messages.map((m) => {
        if (m.kind === 'user') {
          return (
            <div
              key={m.id}
              className="max-w-[85%] self-end rounded-[12px_12px_4px_12px] border border-amber/25 bg-amber-soft px-3 py-2"
            >
              <p className="font-body text-[13px] leading-relaxed text-ink">{m.text}</p>
            </div>
          );
        }
        if (m.kind === 'ai') {
          if (m.streaming && !m.text) {
            return (
              <div key={m.id} className="flex items-center gap-2 px-1 py-1">
                <span
                  className="h-1.5 w-1.5 animate-candle-breath rounded-full bg-amber"
                  aria-hidden
                />
                <span className="font-display text-[14px] italic text-ink-dim">
                  перечитываю твою сцену…
                </span>
              </div>
            );
          }
          return (
            <div
              key={m.id}
              className="max-w-[92%] self-start rounded-[12px_12px_12px_4px] border border-DEFAULT bg-surface px-3 py-2.5"
            >
              <p
                className={`whitespace-pre-line font-body text-[13px] leading-relaxed text-ink ${
                  m.streaming ? 'hc-assist-stream' : ''
                }`}
              >
                {m.text}
              </p>
            </div>
          );
        }
        return (
          <div key={m.id} className="self-stretch">
            <SuggestionCard msg={m} chat={chat} />
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

function Composer({ chat }: { chat: Chat }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={chat.busy}
            onClick={() => chat.send(q)}
            className="rounded-full border border-DEFAULT px-2.5 py-1 font-ui text-[10.5px] text-ink-dim transition-colors hover:text-ink disabled:opacity-40"
          >
            {q}
          </button>
        ))}
        <button
          type="button"
          disabled={chat.busy}
          onClick={() => chat.expand()}
          className="rounded-full border border-amber/50 px-2.5 py-1 font-ui text-[10.5px] text-amber transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          развернуть в текст →
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-strong bg-panel px-3 py-2">
        <input
          value={chat.draft}
          onChange={(e) => chat.setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) chat.send();
          }}
          placeholder="спроси что угодно о своём тексте…"
          aria-label="Сообщение соавтору"
          className="min-w-0 flex-1 bg-transparent font-body text-[13px] italic text-ink caret-amber outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={() => chat.send()}
          disabled={chat.busy || !chat.draft.trim()}
          aria-label="Отправить"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber text-[13px] text-bg disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

/** Desktop — выдвижная справа панель-чат. */
export function AssistPanel({
  open,
  onClose,
  chat,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  subtitle: string;
}) {
  return (
    <aside
      aria-label="Соавтор"
      aria-hidden={!open}
      inert={!open}
      className="pointer-events-none absolute inset-y-0 right-0 z-[12] hidden w-[340px] max-w-[86vw] translate-x-full flex-col border-l border-DEFAULT bg-bg-deep/95 backdrop-blur transition-transform duration-300 ease-out data-[open=true]:pointer-events-auto data-[open=true]:translate-x-0 motion-reduce:transition-none sm:flex"
      data-open={open}
    >
      <div className="flex items-center justify-between border-b border-DEFAULT px-4 py-3">
        <span className="font-display text-[15px] font-semibold italic text-ink">✦ соавтор</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-mono-s tracking-caps uppercase text-ink-faint">
            {subtitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Свернуть соавтора"
            className="font-mono text-mono-s text-ink-dim hover:text-ink"
          >
            ×
          </button>
        </div>
      </div>
      <Thread chat={chat} />
      <div className="border-t border-DEFAULT px-3 pb-3.5 pt-2.5">
        <Composer chat={chat} />
      </div>
    </aside>
  );
}

/** Mobile — bottom sheet с тем же чатом. */
export function AssistSheet({
  open,
  onClose,
  chat,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  subtitle: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-30 flex flex-col justify-end sm:hidden"
      role="dialog"
      aria-label="Соавтор"
    >
      <div
        className="absolute inset-0 bg-bg-deep/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[80vh] flex-col rounded-t-[18px] border border-strong border-b-0 bg-bg-deep px-4 pb-4 pt-2.5 shadow-poster motion-safe:animate-[hcSheetIn_.3s_cubic-bezier(0.2,0.8,0.2,1)]">
        <div
          className="mx-auto mb-2.5 h-1 w-9 shrink-0 rounded-full bg-border-strong"
          aria-hidden
        />
        <div className="mb-1 flex shrink-0 items-center justify-between">
          <span className="font-display text-[15px] font-semibold italic text-ink">✦ соавтор</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-mono-s tracking-caps uppercase text-ink-faint">
              {subtitle}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть соавтора"
              className="font-mono text-mono-s text-ink-dim hover:text-ink"
            >
              ×
            </button>
          </div>
        </div>
        <Thread chat={chat} />
        <div className="shrink-0 pt-2">
          <Composer chat={chat} />
        </div>
      </div>
      <style>{`@keyframes hcSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
