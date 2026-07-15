import Link from 'next/link';
import type { Route } from 'next';
import { GrainCover } from '@/components/ui/GrainCover';
import { MonoBadge } from '@/components/ui/MonoBadge';

export type DeskStory = {
  id: string;
  title: string;
  ordinalCount: number;
  words: number;
  isPublished: boolean;
  gradientClass?: string;
};

// ru-RU в Node/ICU отдаёт narrow no-break space (U+202F) как разделитель групп —
// нормализуем к обычному no-break space (U+00A0), тест ассертит именно его.
const ruNum = (n: number) => n.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');

export function DeskCover({ story }: { story: DeskStory }) {
  // По канве 05: лейбл состояния — отдельно сверху, внизу только короткая
  // строка «ГЛ. N · X СЛ» — иначе статус переносится на узких обложках.
  const label = story.isPublished ? 'ОПУБЛИКОВАНО' : 'ЧЕРНОВИК';
  const stats = `ГЛ. ${story.ordinalCount} · ${ruNum(story.words)} СЛ`;

  return (
    <Link href={`/write/${story.id}` as Route} className="group block aspect-[2/3] w-full">
      {story.gradientClass ? (
        // GrainCover красит фон сам через from/to — gradientClass кладём на обёртку,
        // а GrainCover поверх с прозрачным градиентом даёт зерно/виньетку/glow.
        <div className={`relative h-full overflow-hidden rounded-lg ${story.gradientClass}`}>
          <GrainCover from="transparent" to="transparent" className="absolute inset-0">
            <div className="flex h-full flex-col justify-end p-3">
              <MonoBadge>{label}</MonoBadge>
              <span className="font-display text-display-s text-ink">{story.title}</span>
              <MonoBadge className="mt-1">{stats}</MonoBadge>
            </div>
          </GrainCover>
        </div>
      ) : (
        /* Типографская обложка черновика: Bodoni-титул на surface-solid + амбер-хэйрлайн */
        <div className="flex h-full flex-col rounded-lg border border-border bg-surface-solid p-4 transition-colors group-hover:border-border-strong">
          <MonoBadge>{label}</MonoBadge>
          <span className="my-auto py-3 font-display text-display-m italic leading-tight text-ink">
            {story.title}
          </span>
          <div>
            <div className="mb-2 h-px w-8 bg-amber" aria-hidden />
            <MonoBadge>{stats}</MonoBadge>
          </div>
        </div>
      )}
    </Link>
  );
}
