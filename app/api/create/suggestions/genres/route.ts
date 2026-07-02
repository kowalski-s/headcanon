import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as genreSuggest from '@/lib/prompts/genre-suggest';
import { canonicalFandom } from '@/lib/fandom/canonical';

const TTL_30D = 30 * 24 * 3600;
const FocusEnum = z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']);

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const focusRaw = req.nextUrl.searchParams.get('focus');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!focusRaw) return NextResponse.json({ error: 'focus required' }, { status: 400 });
  const focusParsed = FocusEnum.safeParse(focusRaw);
  if (!focusParsed.success) return NextResponse.json({ error: 'invalid focus' }, { status: 400 });
  const focus = focusParsed.data;

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'genre_suggestions', fandomId, focus };
  const cached = await getSuggestion<genreSuggest.GenreSuggestOutput>(
    'genre_suggestions',
    cacheKey,
  );
  if (cached) return NextResponse.json({ genres: cached.genres, cached: true });

  const prompt = genreSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'genre_suggest',
    templateId: genreSuggest.TEMPLATE_ID,
    templateVersion: genreSuggest.TEMPLATE_VERSION,
    schema: genreSuggest.GenreSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'genre_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_30D,
  );
  return NextResponse.json({ genres: result.genres, cached: false });
}
