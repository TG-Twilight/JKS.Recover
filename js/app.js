/**
 * JKS.Recover - Web Edition
 * Pure client-side Android JKS / Keystore password recovery.
 * Deployable on Cloudflare Pages with no build step.
 */

import { isLikelyJKS } from './keystore.js';
import { initI18n, setLang, onLanguageChange, t } from './i18n.js';

// ==================== State ====================
let keystoreBuffer = null;
let keystoreName = '';
let isRunning = false;
let workers = [];
let workerBusy = [];
let totalTested = 0;
let startTime = 0;
let foundPassword = null;
let feedTimer = null;
let generatorDone = false;
let activeGenerator = null;

const MAX_WORKERS = Math.min(navigator.hardwareConcurrency || 4, 8);
const BATCH_SIZE = 64;

// Worker URL relative to this module (robust for nested deploys)
const WORKER_URL = new URL('./worker.js', import.meta.url);

// ==================== DOM ====================
const $ = (sel) => document.querySelector(sel);
const fileInput = $('#keystore-file');
const fileInfo = $('#file-info');
const methodSelect = $('#method');
const dictSection = $('#dict-section');
const smartSection = $('#smart-section');
const bruteSection = $('#brute-section');
const wordlistText = $('#wordlist');
const piecesInput = $('#pieces');
const firstCharsInput = $('#firstchars');
const smartMinLenInput = $('#smart-min-len');
const smartMaxPiecesInput = $('#smart-max-pieces');
const smartOnlyLowerCheck = $('#smart-only-lower');
const bruteMinLenInput = $('#brute-min-len');
const bruteMaxLenInput = $('#brute-max-len');
const bruteOnlyLowerCheck = $('#brute-only-lower');
const startBtn = $('#start-btn');
const stopBtn = $('#stop-btn');
const statusText = $('#status');
const resultBox = $('#result');
const speedText = $('#speed');

// ==================== UI Helpers ====================
function setStatus(msg, type = 'info') {
  statusText.textContent = msg;
  statusText.className = `status ${type}`;
}

function displayNameFromFile(filename) {
  if (!filename) return 'keystore';
  return filename.replace(/\.(jks|keystore)$/i, '') || filename;
}

function showResult(password) {
  resultBox.innerHTML = `
    <div class="success-box">
      <h3>[OK] ${escapeHtml(t('resultTitle'))}</h3>
      <button type="button" class="password password-copy" id="copy-password-btn" title="${escapeHtml(t('clickToCopy'))}">
        <span class="password-value">${escapeHtml(password)}</span>
        <span class="password-copy-hint" id="copy-password-hint">${escapeHtml(t('clickToCopy'))}</span>
      </button>
      <button type="button" class="btn btn-export" id="export-key-btn">${escapeHtml(t('exportBtn'))}</button>
      <p class="hint">${escapeHtml(t('resultHint'))}</p>
    </div>
  `;
  resultBox.hidden = false;

  const copyBtn = $('#copy-password-btn');
  const exportBtn = $('#export-key-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyPassword(password));
  }
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportKeyInfo(password));
  }
}

async function copyPassword(password) {
  const hint = $('#copy-password-hint');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(password);
    } else {
      const ta = document.createElement('textarea');
      ta.value = password;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    if (hint) {
      hint.textContent = t('copied');
      hint.classList.add('copied');
      setTimeout(() => {
        if (hint) {
          hint.textContent = t('clickToCopy');
          hint.classList.remove('copied');
        }
      }, 1600);
    }
  } catch {
    if (hint) hint.textContent = t('copyFailed');
    setStatus(t('copyFailed'), 'error');
  }
}

function exportKeyInfo(password) {
  const fileName = keystoreName || 'unknown.jks';
  const name = displayNameFromFile(fileName);
  const now = new Date();
  const recoveredAt = now.toISOString().replace('T', ' ').slice(0, 19);

  const body = [
    'JKS.Recover - Key Info',
    '======================',
    `${t('exportFileLabel')}: ${fileName}`,
    `${t('exportNameLabel')}: ${name}`,
    `${t('exportPasswordLabel')}: ${password}`,
    `${t('exportRecoveredAt')}: ${recoveredAt}`,
    '',
    t('exportFooter1'),
    t('exportFooter2'),
    '',
  ].join('\n');

  const safeBase = name.replace(/[^\w.\-]+/g, '_').slice(0, 64) || 'keystore';
  const downloadName = t('exportFilename', { name: safeBase });
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateProgress(tested) {
  totalTested += tested;
  const elapsed = (Date.now() - startTime) / 1000;
  const speed = elapsed > 0 ? Math.round(totalTested / elapsed) : 0;
  speedText.textContent = t('progress', {
    count: totalTested.toLocaleString(),
    speed: speed.toLocaleString(),
  });
}

// ==================== Method UI toggle ====================
function updateMethodSections() {
  const m = methodSelect.value;
  dictSection.hidden = m !== 'dict';
  smartSection.hidden = m !== 'smart';
  bruteSection.hidden = m !== 'brute';
}

methodSelect.addEventListener('change', updateMethodSections);

// ==================== Language ====================
document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLang(btn.getAttribute('data-lang'));
  });
});

onLanguageChange(() => {
  if (!isRunning && foundPassword) {
    setStatus(t('foundSuccess', { password: foundPassword }), 'success');
    showResult(foundPassword);
  } else if (!isRunning && !foundPassword && !keystoreBuffer) {
    setStatus(t('statusInit'), 'info');
  } else if (!isRunning && keystoreBuffer && !foundPassword) {
    setStatus(t('keystoreReady'), 'success');
  }
  if (keystoreBuffer) {
    fileInfo.textContent = t('fileLoaded', {
      name: keystoreName,
      size: (keystoreBuffer.byteLength / 1024).toFixed(1),
    });
  }
  if (totalTested > 0 && (isRunning || foundPassword)) {
    updateProgress(0);
  }
});

// ==================== File handling ====================
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    if (!isLikelyJKS(buffer)) {
      setStatus(t('invalidJks'), 'error');
      keystoreBuffer = null;
      keystoreName = '';
      fileInfo.textContent = '';
      return;
    }
    keystoreBuffer = buffer;
    keystoreName = file.name;
    fileInfo.textContent = t('fileLoaded', {
      name: file.name,
      size: (file.size / 1024).toFixed(1),
    });
    setStatus(t('keystoreReady'), 'success');
  } catch (err) {
    setStatus(t('fileReadError', { msg: err.message }), 'error');
  }
});

// ==================== Generators ====================
function* dictionaryGenerator(words) {
  for (const w of words) {
    const trimmed = w.trim();
    if (trimmed) yield trimmed;
  }
}

/**
 * Smart wordlist: stream candidates (permutations + case variants + 0-99).
 * Avoids building a giant Set up-front (previous version could freeze the UI).
 */
function* smartGenerator(pieces, options) {
  const {
    minPieces = 1,
    maxPieces = 4,
    firstChars = '',
    onlyLower = false,
    minLen = 0,
  } = options;

  const base = pieces.map((p) => p.trim()).filter(Boolean);
  if (base.length === 0) return;

  const seen = new Set();
  const pieceCount = base.length;
  const maxP = Math.min(maxPieces, pieceCount);

  function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function pieceVariants(p) {
    if (onlyLower) return [p.toLowerCase()];
    const set = new Set([p, p.toLowerCase(), capitalize(p)]);
    return [...set];
  }

  function* emit(parts) {
    let pwd = firstChars + parts.join('');
    if (onlyLower) pwd = pwd.toLowerCase();
    if (pwd.length < minLen) return;
    if (seen.has(pwd)) return;
    seen.add(pwd);
    yield pwd;
    for (let n = 0; n < 100; n++) {
      const withNum = pwd + n;
      if (!seen.has(withNum)) {
        seen.add(withNum);
        yield withNum;
      }
    }
  }

  function* permute(usedMask, depth, current) {
    if (depth >= minPieces && depth <= maxP) {
      yield* emit(current);
    }
    if (depth >= maxP) return;

    for (let i = 0; i < pieceCount; i++) {
      if (usedMask & (1 << i)) continue;
      for (const v of pieceVariants(base[i])) {
        current.push(v);
        yield* permute(usedMask | (1 << i), depth + 1, current);
        current.pop();
      }
    }
  }

  yield* permute(0, 0, []);
}

function* bruteGenerator(minLen = 4, maxLen = 6, onlyLower = true) {
  const chars = onlyLower
    ? 'abcdefghijklmnopqrstuvwxyz0123456789'
    : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  function* gen(len, prefix = '') {
    if (prefix.length === len) {
      yield prefix;
      return;
    }
    for (const c of chars) {
      yield* gen(len, prefix + c);
    }
  }

  for (let len = minLen; len <= maxLen; len++) {
    yield* gen(len);
  }
}

// ==================== Recovery orchestration ====================
function takeBatch(generator) {
  const batch = [];
  for (let i = 0; i < BATCH_SIZE; i++) {
    const { value, done } = generator.next();
    if (done) {
      generatorDone = true;
      break;
    }
    batch.push(value);
  }
  return batch;
}

function terminateWorkers() {
  if (feedTimer != null) {
    clearTimeout(feedTimer);
    feedTimer = null;
  }
  workers.forEach((w) => {
    try {
      w.postMessage({ type: 'stop' });
      w.terminate();
    } catch {
      /* ignore */
    }
  });
  workers = [];
  workerBusy = [];
}

function scheduleFeed() {
  if (feedTimer != null) return;
  feedTimer = setTimeout(() => {
    feedTimer = null;
    feedIdleWorkers();
  }, 0);
}

function feedIdleWorkers() {
  if (!isRunning || !activeGenerator) return;

  for (let i = 0; i < workers.length; i++) {
    if (workerBusy[i]) continue;
    if (generatorDone) continue;

    const batch = takeBatch(activeGenerator);
    if (batch.length === 0) continue;

    workerBusy[i] = true;
    workers[i].postMessage({ type: 'test-batch', data: { candidates: batch } });
  }

  const anyBusy = workerBusy.some(Boolean);
  if (generatorDone && !anyBusy) {
    if (!foundPassword) {
      setStatus(t('recoverDone', { count: totalTested.toLocaleString() }), 'warn');
      stopRecovery(false);
    }
  }
}

function handleWorkerMessage(workerIndex, e) {
  const { type, password, tested } = e.data;

  if (type === 'ready') {
    workerBusy[workerIndex] = false;
    return;
  }

  if (type === 'found') {
    if (foundPassword) return;
    foundPassword = password;
    isRunning = false;
    updateProgress(tested || 0);
    showResult(password);
    setStatus(t('foundSuccess', { password }), 'success');
    stopRecovery(false);
    return;
  }

  if (type === 'progress') {
    workerBusy[workerIndex] = false;
    updateProgress(tested || 0);
    if (isRunning) scheduleFeed();
  }
}

async function startRecovery() {
  if (!keystoreBuffer) {
    setStatus(t('needKeystore'), 'error');
    return;
  }
  if (isRunning) return;

  isRunning = true;
  foundPassword = null;
  totalTested = 0;
  startTime = Date.now();
  generatorDone = false;
  activeGenerator = null;
  resultBox.hidden = true;
  resultBox.innerHTML = '';
  speedText.textContent = '';
  startBtn.disabled = true;
  stopBtn.disabled = false;
  setStatus(t('initWorkers'), 'info');

  terminateWorkers();

  // Create workers and wait for ready
  const readyPromises = [];
  for (let i = 0; i < MAX_WORKERS; i++) {
    const w = new Worker(WORKER_URL);
    const idx = i;
    workerBusy[idx] = true;
    readyPromises.push(
      new Promise((resolve) => {
        const onReady = (ev) => {
          if (ev.data && ev.data.type === 'ready') {
            w.removeEventListener('message', onReady);
            workerBusy[idx] = false;
            resolve();
          }
        };
        w.addEventListener('message', onReady);
      })
    );
    w.onmessage = (e) => handleWorkerMessage(idx, e);
    w.onerror = () => {
      workerBusy[idx] = false;
    };
    workers.push(w);
    // Clone buffer per worker (ArrayBuffer not multi-transferable after first use)
    w.postMessage({
      type: 'init',
      data: { keystore: keystoreBuffer.slice(0) },
    });
  }

  await Promise.race([
    Promise.all(readyPromises),
    new Promise((r) => setTimeout(r, 2000)),
  ]);

  if (!isRunning) return;

  const method = methodSelect.value;
  let generator;

  try {
    if (method === 'smart') {
      const pieces = piecesInput.value.split(/[\s,，]+/).filter(Boolean);
      if (pieces.length === 0) {
        throw new Error(t('needPieces'));
      }
      const maxPieces = parseInt(smartMaxPiecesInput.value, 10) || Math.min(pieces.length, 5);
      generator = smartGenerator(pieces, {
        firstChars: firstCharsInput.value || '',
        onlyLower: smartOnlyLowerCheck.checked,
        minLen: parseInt(smartMinLenInput.value, 10) || 0,
        minPieces: 1,
        maxPieces: Math.min(maxPieces, pieces.length, 6),
      });
      setStatus(t('startSmart'), 'info');
    } else if (method === 'dict') {
      const words = wordlistText.value.split(/\r?\n/);
      if (words.filter((w) => w.trim()).length === 0) {
        throw new Error(t('needDict'));
      }
      generator = dictionaryGenerator(words);
      setStatus(t('startDict'), 'info');
    } else if (method === 'brute') {
      const minL = parseInt(bruteMinLenInput.value, 10) || 4;
      let maxL = parseInt(bruteMaxLenInput.value, 10) || 5;
      if (maxL > 6) {
        setStatus(t('bruteLimitWarn'), 'warn');
        maxL = 6;
      }
      if (minL > maxL) {
        throw new Error(`${t('minLen')} > ${t('maxLen')}`);
      }
      generator = bruteGenerator(minL, maxL, bruteOnlyLowerCheck.checked);
      setStatus(t('startBrute', { min: minL, max: maxL }), 'warn');
    } else {
      throw new Error('Unknown method');
    }

    activeGenerator = generator;
    feedIdleWorkers();
  } catch (err) {
    setStatus(err.message, 'error');
    stopRecovery(false);
  }
}

function stopRecovery(updateUI = true) {
  isRunning = false;
  activeGenerator = null;
  terminateWorkers();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  if (updateUI && !foundPassword) {
    setStatus(t('stopped'), 'info');
  }
}

// ==================== Event listeners ====================
startBtn.addEventListener('click', startRecovery);
stopBtn.addEventListener('click', () => stopRecovery(true));

// ==================== Boot ====================
initI18n();
updateMethodSections();
setStatus(t('statusInit'), 'info');
