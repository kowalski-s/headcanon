import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openaiLlm } from '@/lib/llm-openai';
import { getSuggestion, setSuggestion } from '@/lib/cache/ai-suggestion';
import * as shipSuggest from '@/lib/prompts/ship-suggest';

const TTL_30D = 30 * 24 * 3600;

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId');
  if (!fandomId) return NextResponse.json({ error: 'fandomId required' }, { status: 400 });

  const fandom = await prisma.tag.findUnique({ where: { id: fandomId } });
  if (!fandom) return NextResponse.json({ error: 'fandom not found' }, { status: 404 });

  const cacheKey = { scope: 'ship_suggestions', fandomId };
  const cached = await getSuggestion<shipSuggest.ShipSuggestOutput>('ship_suggestions', cacheKey);
  if (cached) return NextResponse.json({ ships: cached.ships, cached: true });

  const prompt = shipSuggest.build(fandom.name);
  const result = await openaiLlm.completeStructured({
    callType: 'ship_suggest',
    templateId: shipSuggest.TEMPLATE_ID,
    templateVersion: shipSuggest.TEMPLATE_VERSION,
    schema: shipSuggest.ShipSuggestSchema,
    ...prompt,
  });
  await setSuggestion(
    'ship_suggestions',
    cacheKey,
    result,
    process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini',
    TTL_30D,
  );
  return NextResponse.json({ ships: result.ships, cached: false });
}
