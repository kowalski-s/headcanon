export function requiresAgeGate(input: { rating?: string | null; tropes: string[] }): boolean {
  return input.rating === 'E' || input.rating === 'M';
}

export function isAgeConfirmed(user: { ageConfirmedAt: Date | null }): boolean {
  return user.ageConfirmedAt !== null;
}
