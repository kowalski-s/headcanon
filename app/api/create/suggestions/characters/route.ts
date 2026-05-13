import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as characterSuggest from '@/lib/prompts/character-suggest';
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

  const cacheKey = { scope: 'character_suggestions', fandomId, focus };
  const cached = await getSuggestion<characterSuggest.CharacterSuggestOutput>(
    'character_suggestions',
    cacheKey,
  );
  if (cached) return NextResponse.json({ suggestions: cached.suggestions, cached: true });

  const prompt = characterSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'character_suggest',
    templateId: characterSuggest.TEMPLATE_ID,
    templateVersion: characterSuggest.TEMPLATE_VERSION,
    schema: characterSuggest.CharacterSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'character_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_30D,
  );
  return NextResponse.json({ suggestions: result.suggestions, cached: false });
}
