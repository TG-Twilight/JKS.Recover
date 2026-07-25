/**
 * Web Worker for password testing (JKS.Recover).
 * Receives batches of candidates and reports results / progress.
 * Functions are inlined for classic worker compatibility (no ES modules).
 */

const stringToUtf16BE = (str) => {
  const buf = new Uint8Array(str.length * 2);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    buf[i * 2] = (code >>> 8) & 0xff;
    buf[i * 2 + 1] = code & 0xff;
  }
  return buf;
};

const concatBuffers = (...arrays) => {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
};

async function verifyPassword(keystoreBytes, password) {
  const body = keystoreBytes.subarray(0, keystoreBytes.length - 20);
  const expectedSig = keystoreBytes.subarray(keystoreBytes.length - 20);

  const passBytes = stringToUtf16BE(password);
  const mighty = new TextEncoder().encode('Mighty Aphrodite');
  const toHash = concatBuffers(passBytes, mighty, body);

  const hashBuffer = await crypto.subtle.digest('SHA-1', toHash);
  const hash = new Uint8Array(hashBuffer);

  return arraysEqual(hash, expectedSig);
}

let keystoreBytes = null;
let stopped = false;

self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === 'init') {
    keystoreBytes = new Uint8Array(data.keystore);
    stopped = false;
    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'test-batch') {
    if (stopped || !keystoreBytes) {
      self.postMessage({ type: 'progress', tested: 0 });
      return;
    }

    const candidates = data.candidates;
    let tested = 0;

    for (const pwd of candidates) {
      if (stopped) break;
      tested++;
      try {
        const ok = await verifyPassword(keystoreBytes, pwd);
        if (ok) {
          stopped = true;
          self.postMessage({
            type: 'found',
            password: pwd,
            tested,
          });
          return;
        }
      } catch {
        // ignore invalid candidates
      }
    }

    self.postMessage({
      type: 'progress',
      tested,
    });
  }

  if (type === 'stop') {
    stopped = true;
  }
};
