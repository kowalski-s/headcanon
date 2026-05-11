/**
 * Client-side fandom list for the Create flow (Plan A).
 *
 * UUIDs are the Tag.id values from the seeded DB (prisma/seeds/fandom-tags.json).
 * Approach: hard-coded here rather than a new GET /api/fandoms endpoint — saves a
 * round-trip on mount. These IDs are stable because the seed uses upsert by slug.
 *
 * TODO(M3+): replace with a real GET /api/fandoms endpoint if the fandom list
 * grows or becomes user-editable.
 */
export interface FandomOption {
  id: string;
  slug: string;
  name: string;
  /** Short label shown in the UI (can differ from the full name). */
  label: string;
}

export const FANDOMS: FandomOption[] = [
  {
    id: '4a6ca391-80ba-47f7-9ea5-81633bb71a98',
    slug: 'all-for-the-game',
    name: 'Всё ради игры',
    label: 'AftG',
  },
  {
    id: '69e01402-b437-492e-b3b3-261170ac2ec7',
    slug: 'harry-potter',
    name: 'Harry Potter',
    label: 'HP',
  },
  {
    id: 'aa467bcb-25e2-4dcc-a0e1-1b2b43d4fe16',
    slug: 'naruto',
    name: 'Наруто',
    label: 'Naruto',
  },
  {
    id: '4c45f704-95b3-4ad5-926a-ce5c444617bc',
    slug: 'jjk',
    name: 'Магическая битва',
    label: 'JJK',
  },
];
