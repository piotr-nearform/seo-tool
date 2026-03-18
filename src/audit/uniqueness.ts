import { createHash } from 'node:crypto';

export interface UniquenessResult {
  page: string;
  score: number;
  nearestSibling: string;
}

/**
 * Tokenize text into word n-grams (shingles).
 */
export function shingleize(text: string, n: number = 3): Set<string> {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    shingles.add(words.slice(i, i + n).join(' '));
  }
  return shingles;
}

/**
 * Generate a MinHash signature for a set of shingles.
 * Uses N different hash functions (hash(shingle) + i * largePrime) mod modulo.
 */
export function minHashSignature(shingles: Set<string>, numHashes: number = 128): Uint32Array {
  const signature = new Uint32Array(numHashes).fill(0xffffffff);
  const LARGE_PRIME = 0x7fffffff; // 2^31 - 1 (Mersenne prime)
  const MOD = 0xffffffff;

  // Pre-compute base hashes for all shingles
  const baseHashes: number[] = [];
  for (const shingle of shingles) {
    const h = createHash('md5').update(shingle).digest();
    baseHashes.push(h.readUInt32LE(0));
  }

  for (let i = 0; i < numHashes; i++) {
    const a = (i + 1) * 0x5bd1e995;
    const b = (i + 1) * 0x1b873593;
    for (const baseHash of baseHashes) {
      const hv = ((Math.imul(a, baseHash) + b) & MOD) >>> 0;
      if (hv < signature[i]) {
        signature[i] = hv;
      }
    }
  }

  return signature;
}

/**
 * Estimate Jaccard similarity between two MinHash signatures.
 */
export function jaccardFromSignatures(sig1: Uint32Array, sig2: Uint32Array): number {
  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) matches++;
  }
  return matches / sig1.length;
}

/**
 * Check content uniqueness across pages using MinHash/Jaccard estimation.
 * Returns results for pages whose nearest sibling similarity exceeds the threshold.
 */
export function checkUniqueness(
  pages: { url: string; content: string }[],
  threshold: number = 0.3,
): UniquenessResult[] {
  if (pages.length < 2) return [];

  // Build MinHash signatures
  const signatures = pages.map((p) => {
    const shingles = shingleize(p.content);
    return minHashSignature(shingles);
  });

  const results: UniquenessResult[] = [];

  for (let i = 0; i < pages.length; i++) {
    let maxSim = 0;
    let nearestIdx = -1;

    for (let j = 0; j < pages.length; j++) {
      if (i === j) continue;
      const sim = jaccardFromSignatures(signatures[i], signatures[j]);
      if (sim > maxSim) {
        maxSim = sim;
        nearestIdx = j;
      }
    }

    if (maxSim > threshold && nearestIdx >= 0) {
      results.push({
        page: pages[i].url,
        score: maxSim,
        nearestSibling: pages[nearestIdx].url,
      });
    }
  }

  return results;
}
