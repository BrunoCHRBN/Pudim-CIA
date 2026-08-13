export function getSafeAuthRedirectPath(
  candidate: string | null,
  fallback = '/admin'
): string {
  const containsControlCharacter = candidate ? /[\u0000-\u001f\u007f]/.test(candidate) : false;

  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    containsControlCharacter
  ) {
    return fallback;
  }

  return candidate;
}
