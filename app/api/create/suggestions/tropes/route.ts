import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as tropeSuggest from '@/lib/prompts/trope-suggest';
import { canonicalFandom } from '@/lib/fandom/canonical';

const TTL_7D = 7 * 24 * 3600;
const FocusEnum = z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']);

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const focusRaw = req.nextUrl.searchParams.get('focus');
  const charactersRaw = req.nextUrl.searchParams.get('characters');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!focusRaw) return NextResponse.json({ error: 'focus required' }, { status: 400 });
  const focusParsed = FocusEnum.safeParse(focusRaw);
  if (!focusParsed.success) return NextResponse.json({ error: 'invalid focus' }, { status: 400 });
  const focus = focusParsed.data;
  const characters = (charactersRaw ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'trope_suggestions', fandomId, focus, characters };
  const cached = await getSuggestion<tropeSuggest.TropeSuggestOutput>(
    'trope_suggestions',
    cacheKey,
  );
  if (cached) {
    return NextResponse.json({ tropes: cached.tropes, sensei_tip: cached.sensei_tip, cached: true });
  }

  const prompt = tropeSuggest.build({
    fandomName: canonicalFandom(fandom.slug, fandom.name),
    focus,
    characters,
  });
  const result = await openaiLlm.completeStructured({
    callType: 'trope_suggest',
    templateId: tropeSuggest.TEMPLATE_ID,
    templateVersion: tropeSuggest.TEMPLATE_VERSION,
    schema: tropeSuggest.TropeSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'trope_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_7D,
  );
  return NextResponse.json({ tropes: result.tropes, sensei_tip: result.sensei_tip, cached: false });
}
