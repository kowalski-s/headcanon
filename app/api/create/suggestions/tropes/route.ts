import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as tropeSuggest from '@/lib/prompts/trope-suggest';

// sensei_tip TTL drives the whole row (7d < 30d trope TTL — conservative choice)
const TTL_7D = 7 * 24 * 3600;

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  const shipId = req.nextUrl.searchParams.get('shipId');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });
  if (!shipId) return NextResponse.json({ error: 'shipId required' }, { status: 400 });

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'trope_suggestions', fandomId, shipId };
  const cached = await getSuggestion<tropeSuggest.TropeSuggestOutput>(
    'trope_suggestions',
    cacheKey,
  );
  if (cached) {
    return NextResponse.json({ tropes: cached.tropes, sensei_tip: cached.sensei_tip, cached: true });
  }

  const prompt = tropeSuggest.build(fandom.name, shipId);
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
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-5o-mini',
    TTL_7D,
  );
  return NextResponse.json({ tropes: result.tropes, sensei_tip: result.sensei_tip, cached: false });
}
