/**
 * JKS (Java KeyStore) password verification for browser.
 * Based on the reverse-engineered format from Casey Marshall / MaxCamillo's tool.
 * All processing stays client-side. Keystore never leaves the browser.
 */

/**
 * Convert string to UTF-16BE byte array (as required by JKS password hashing)
 */
function stringToUtf16BE(str) {
  const buf = new Uint8Array(str.length * 2);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    buf[i * 2] = (code >>> 8) & 0xff;
    buf[i * 2 + 1] = code & 0xff;
  }
  return buf;
}

/**
 * Concatenate multiple Uint8Arrays
 */
function concatBuffers(...arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Constant-time comparison of two Uint8Arrays
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Verify if a password is correct for a JKS keystore.
 * Uses the outer integrity signature:
 *   SHA-1( UTF-16BE(password) + "Mighty Aphrodite" + body )
 * This is the official JKS integrity check and is very fast.
 *
 * @param {ArrayBuffer|Uint8Array} keystoreData - The full .jks / .keystore file
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(keystoreData, password) {
  const bytes = keystoreData instanceof Uint8Array
    ? keystoreData
    : new Uint8Array(keystoreData);

  if (bytes.length < 24) {
    throw new Error('File too small to be a valid JKS');
  }

  // Magic number check (0xFEEDFEED)
  const magic = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  if (magic !== 0xFEEDFEED) {
    throw new Error('Not a valid JKS keystore (bad magic number)');
  }

  const body = bytes.subarray(0, bytes.length - 20);
  const expectedSig = bytes.subarray(bytes.length - 20);

  const passBytes = stringToUtf16BE(password);
  const mighty = new TextEncoder().encode('Mighty Aphrodite');
  const toHash = concatBuffers(passBytes, mighty, body);

  const hashBuffer = await crypto.subtle.digest('SHA-1', toHash);
  const hash = new Uint8Array(hashBuffer);

  return arraysEqual(hash, expectedSig);
}

/**
 * Quick structural validation (does not check password)
 */
export function isLikelyJKS(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length < 24) return false;
  const magic = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return magic === 0xFEEDFEED;
}
