function normalize(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[?.,!;:¡¿"'()]/g, '') // quitar puntuación
    .replace(/\s+/g, ' ');
}

export function normalizeQuery(text) {
  return normalize(text);
}

export function normalizeProductName(text) {
  return normalize(text);
}

export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function spellMatch(queryWord, targetWord, maxDistance = null) {
  if (queryWord === targetWord) return true;
  if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) return true;
  const maxLen = Math.max(queryWord.length, targetWord.length);
  const threshold = maxDistance || Math.floor(maxLen / 3);
  if (threshold < 1) return false;
  return levenshtein(queryWord, targetWord) <= threshold;
}

export function fuzzyMatch(query, target) {
  const q = normalize(query);
  const t = normalize(target);

  if (!q || !t) return false;

  // Match exacto
  if (t === q) return true;

  // Match por inclusión (query contenido en target o viceversa)
  if (t.includes(q) || q.includes(t)) return true;

  // Match por palabras: todas las palabras de query deben estar en target
  const queryWords = q.split(' ').filter((w) => w.length > 2);
  const targetWords = t.split(' ').filter((w) => w.length > 2);

  if (queryWords.length === 0) return false;

  const allMatch = queryWords.every((qw) =>
    targetWords.some((tw) => tw.includes(qw) || qw.includes(tw) || spellMatch(qw, tw))
  );

  return allMatch;
}
