// AI-assisted: see docs/AI_LOG.md #13
// Firestore keeps writes pending while offline; this rejects if there is no answer in time
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}