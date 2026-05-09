import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface FandomTag {
  name: string;
  slug: string;
}

interface AftgCharacter {
  name: string;
  bible: Prisma.InputJsonValue;
}

interface AftgCanon {
  fandomSlug: string;
  characters: AftgCharacter[];
}

const fandomTags: FandomTag[] = JSON.parse(
  readFileSync(resolve(__dirname, 'seeds/fandom-tags.json'), 'utf-8'),
);

const aftgCanon: AftgCanon = JSON.parse(
  readFileSync(resolve(__dirname, 'seeds/aftg-canon.json'), 'utf-8'),
);

async function main() {
  console.log('Seeding fandom tags...');
  for (const t of fandomTags) {
    await prisma.tag.upsert({
      where: { type_slug: { type: 'FANDOM', slug: t.slug } },
      update: { name: t.name },
      create: { type: 'FANDOM', name: t.name, slug: t.slug },
    });
  }

  console.log('Seeding AftG canon bible...');
  const aftgFandom = await prisma.tag.findUnique({
    where: { type_slug: { type: 'FANDOM', slug: aftgCanon.fandomSlug } },
  });
  if (!aftgFandom) {
    throw new Error('AftG fandom tag not found — should be seeded first');
  }

  for (const char of aftgCanon.characters) {
    await prisma.fandomCanonSeed.upsert({
      where: {
        fandomTagId_characterName: {
          fandomTagId: aftgFandom.id,
          characterName: char.name,
        },
      },
      update: { bibleJson: char.bible },
      create: {
        fandomTagId: aftgFandom.id,
        characterName: char.name,
        bibleJson: char.bible,
      },
    });
  }

  console.log('Seed complete: 4 fandom tags + 6 AftG character bibles');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
