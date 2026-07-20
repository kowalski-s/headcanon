'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api/client';

// Тихое сообщение при исчерпании дневного лимита (тон DESIGN-writer — без канцелярита).
const QUOTA_NOTE =
  'На сегодня свободные обращения к соавтору закончились — он вернётся к твоей рукописи завтра.';

export type ChatMessage =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'ai'; text: string; streaming: boolean }
  | {
      id: string;
      kind: 'suggestion';
      teaser: string;
      passage: string;
      status: 'thinking' | 'ready' | 'accepted' | 'error';
    };

type Options = {
  storyId: string;
  chapterId: string;
  /** Вставка готового фрагмента «в текст» — через тот же путь сохранения, что и обычный ввод. */
  onInsert: (passage: string) => void;
};

let seq = 0;
const nextId = () => `m${Date.now()}-${seq++}`;

export function useAssist({ storyId, chapterId, onInsert }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  // Зеркало messages для чтения актуального состояния вне setState-апдейтера (accept).
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const endpoint = `/api/write/story/${storyId}/assist`;

  const patch = useCallback((id: string, next: Partial<ChatMessage>) => {
    setMessages((ms) => ms.map((m) => (m.id === id ? ({ ...m, ...next } as ChatMessage) : m)));
  }, []);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? draft).trim();
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setDraft('');

      // История для контекста — только завершённые реплики (без текущего плейсхолдера).
      const history = messages
        .filter(
          (m): m is Extract<ChatMessage, { kind: 'user' | 'ai' }> =>
            m.kind === 'user' || m.kind === 'ai',
        )
        .map((m) => ({
          role: m.kind === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const aiId = nextId();
      setMessages((ms) => [
        ...ms,
        { id: nextId(), kind: 'user', text },
        { id: aiId, kind: 'ai', text: '', streaming: true },
      ]);

      try {
        const res = await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ action: 'chat', chapterId, message: text, history }),
        });
        if (res.status === 429) {
          patch(aiId, { text: QUOTA_NOTE, streaming: false });
          return;
        }
        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? `HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          patch(aiId, { text: buf });
        }
        patch(aiId, { text: buf || '…', streaming: false });
      } catch {
        patch(aiId, {
          text: 'Соавтор задумался и не ответил. Попробуй ещё раз.',
          streaming: false,
        });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [draft, messages, endpoint, chapterId, patch],
  );

  const runSuggestion = useCallback(
    async (id: string, action: 'expand' | 'retry', instruction?: string) => {
      patch(id, { status: 'thinking' });
      try {
        const res = await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ action, chapterId, message: instruction }),
        });
        if (res.status === 429) {
          // Убираем карточку-«думает» и оставляем тихую заметку в чате.
          setMessages((ms) => [
            ...ms.filter((m) => m.id !== id),
            { id: nextId(), kind: 'ai', text: QUOTA_NOTE, streaming: false },
          ]);
          return;
        }
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { teaser: string; passage: string };
        patch(id, { teaser: data.teaser, passage: data.passage, status: 'ready' });
      } catch {
        patch(id, { status: 'error' });
      }
    },
    [endpoint, chapterId, patch],
  );

  /** Попросить соавтора развернуть продолжение в готовый фрагмент. */
  const expand = useCallback(
    (instruction?: string) => {
      if (busyRef.current) return;
      const id = nextId();
      setMessages((ms) => [
        ...ms,
        { id, kind: 'suggestion', teaser: '', passage: '', status: 'thinking' },
      ]);
      void runSuggestion(id, 'expand', instruction);
    },
    [runSuggestion],
  );

  /** «иначе» — перегенерировать вариант (новый вызов с тем же контекстом). */
  const retry = useCallback((id: string) => void runSuggestion(id, 'retry'), [runSuggestion]);

  /** «в текст» — вставить фрагмент в конец главы. */
  const accept = useCallback(
    (id: string) => {
      // Side effect держим ВНЕ setState-апдейтера: апдейтер обязан быть чистым
      // (React/StrictMode вправе вызвать его повторно → иначе двойная вставка).
      const msg = messagesRef.current.find((m) => m.id === id);
      if (!msg || msg.kind !== 'suggestion' || msg.status !== 'ready') return;
      onInsert(msg.passage);
      setMessages((ms) =>
        ms.map((m) => (m.id === id && m.kind === 'suggestion' ? { ...m, status: 'accepted' } : m)),
      );
    },
    [onInsert],
  );

  /** «мимо» — отклонить предложение. */
  const dismiss = useCallback((id: string) => {
    setMessages((ms) => ms.filter((m) => m.id !== id));
  }, []);

  return { messages, draft, setDraft, busy, send, expand, retry, accept, dismiss };
}
