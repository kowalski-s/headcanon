'use client';

import { useCreateStory } from '@/lib/write/use-create-story';

/**
 * Primary-действие шапки: амбер-пилюля «+ новая история» (канва 05, PvDeskDesktop).
 * Тот же экшен создания, что на полке и пустом столе — через общий useCreateStory
 * (guard двойного клика внутри хука).
 */
export function NewStoryButton() {
  const { create, pending } = useCreateStory();
  return (
    <button
      type="button"
      onClick={create}
      disabled={pending}
      className="rounded-full bg-amber px-[13px] py-[5px] font-display text-[12.5px] font-medium italic text-bg-deep transition-[filter] hover:brightness-110 disabled:opacity-70"
    >
      + новая история
    </button>
  );
}
