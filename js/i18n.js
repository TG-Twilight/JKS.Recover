/**
 * Simple zh/en i18n for JKS.Recover.
 * Default language: Chinese (zh).
 */

export const translations = {
  zh: {
    title: 'JKS密码找回',
    documentTitle: 'JKS密码找回',
    subtitle: '纯前端 · 本地运行 · 可一键部署到 Cloudflare Pages',
    starHint: '如果帮助到了你，记得为本项目点个 Star',
    step1: '1. 选择 Keystore 文件',
    fileLabel: '.jks / .keystore 文件',
    fileNote: '文件不会上传到任何服务器，所有计算都在你的浏览器本地完成。',
    step2: '2. 选择恢复方式',
    methodLabel: '方法',
    methodSmart: '智能词表恢复',
    methodDict: '字典恢复',
    methodBrute: '暴力恢复（仅短密码）',
    wordlistLabel: '词典（每行一个候选密码）',
    wordlistPlaceholder: 'password\n123456\nandroid\nkeystore\nmyapp2020\n...',
    wordlistNote: '可粘贴常用密码列表，或自己准备的可能密码。',
    piecesLabel: '密码片段（空格或逗号分隔）',
    piecesPlaceholder: '例如: got love ya 或 my app 2020',
    firstcharsLabel: '已知前缀（可选）',
    firstcharsPlaceholder: '例如: My',
    minLen: '最小长度',
    maxLen: '最大长度',
    maxPieces: '最大片段数',
    onlyLower: '仅使用小写字母',
    smartNote: '工具会自动排列组合片段、首字母大写、并追加 0-99 数字。',
    bruteWarn: '提示：浏览器暴力恢复速度有限，建议仅用于 4-6 位短密码。',
    bruteOnlyLower: '仅小写 + 数字',
    step3: '3. 开始恢复',
    startBtn: '开始恢复',
    stopBtn: '停止',
    statusInit: '请选择你的 Android keystore 文件开始。所有处理都在本地浏览器完成，文件不会上传。',

    invalidJks: '文件看起来不是有效的 JKS keystore（魔数不匹配）。请确认是 .jks 或 .keystore 文件。',
    fileLoaded: '已加载: {name} ({size} KB)',
    keystoreReady: 'Keystore 已加载，可以开始恢复。',
    fileReadError: '读取文件失败: {msg}',
    needKeystore: '请先选择 keystore 文件。',
    initWorkers: '正在初始化 Worker...',
    needDict: '请提供至少一个词典单词',
    startDict: '开始字典恢复...',
    needPieces: '请输入密码片段（用空格或逗号分隔）',
    startSmart: '开始智能词表恢复（生成排列组合）...',
    bruteLimitWarn: '浏览器暴力恢复仅建议 ≤6 位，否则会非常慢。已限制为 6。',
    startBrute: '开始暴力恢复 ({min}-{max} 位)... 这可能很慢！',
    recoverDone: '恢复完成，未找到密码。共测试 {count} 个候选。',
    foundSuccess: '成功！密码是: {password}',
    stopped: '已停止。',
    progress: '{count} 已测试 · {speed} / 秒',
    resultTitle: '密码已找到！',
    resultHint: '请立即备份并妥善保管密码。',
    clickToCopy: '点击复制密码',
    copied: '已复制到剪贴板',
    copyFailed: '复制失败，请手动选择密码',
    exportBtn: '一键导出密钥信息',
    exportFilename: 'jks-recover-{name}.txt',
    exportFileLabel: '文件名',
    exportNameLabel: '名称',
    exportPasswordLabel: '密码',
    exportRecoveredAt: '恢复时间',
    exportFooter1: 'Recovered with JKS.Recover',
    exportFooter2: 'https://jks.awads.cc',
    metaDescription: '纯浏览器端 Android JKS Keystore 密码恢复工具。支持智能词表、字典、暴力恢复。可直接部署到 Cloudflare Pages。',
  },
  en: {
    title: 'JKS Recover',
    documentTitle: 'JKS Recover',
    subtitle: 'Pure client-side · Local only · Ready for Cloudflare Pages',
    starHint: 'If this helped you, please Star the project',
    step1: '1. Select Keystore File',
    fileLabel: '.jks / .keystore file',
    fileNote: 'The file is never uploaded. All computation runs locally in your browser.',
    step2: '2. Choose Recovery Method',
    methodLabel: 'Method',
    methodSmart: 'Smart wordlist recovery',
    methodDict: 'Dictionary recovery',
    methodBrute: 'Brute-force recovery (short passwords only)',
    wordlistLabel: 'Wordlist (one candidate per line)',
    wordlistPlaceholder: 'password\n123456\nandroid\nkeystore\nmyapp2020\n...',
    wordlistNote: 'Paste a common password list or your own candidates.',
    piecesLabel: 'Password pieces (space or comma separated)',
    piecesPlaceholder: 'e.g. got love ya or my app 2020',
    firstcharsLabel: 'Known prefix (optional)',
    firstcharsPlaceholder: 'e.g. My',
    minLen: 'Min length',
    maxLen: 'Max length',
    maxPieces: 'Max pieces',
    onlyLower: 'Lowercase only',
    smartNote: 'Combines pieces, capitalizes first letters, and appends numbers 0–99.',
    bruteWarn: 'Note: browser brute-force recovery is limited. Use only for 4–6 character passwords.',
    bruteOnlyLower: 'Lowercase + digits only',
    step3: '3. Start Recovery',
    startBtn: 'Start recovery',
    stopBtn: 'Stop',
    statusInit: 'Select your Android keystore file to begin. Everything runs locally in the browser; nothing is uploaded.',

    invalidJks: 'This does not look like a valid JKS keystore (magic mismatch). Please use a .jks or .keystore file.',
    fileLoaded: 'Loaded: {name} ({size} KB)',
    keystoreReady: 'Keystore loaded. Ready to recover.',
    fileReadError: 'Failed to read file: {msg}',
    needKeystore: 'Please select a keystore file first.',
    initWorkers: 'Initializing workers...',
    needDict: 'Please provide at least one dictionary word',
    startDict: 'Starting dictionary recovery...',
    needPieces: 'Please enter password pieces (space or comma separated)',
    startSmart: 'Starting smart wordlist recovery (permutations)...',
    bruteLimitWarn: 'Browser brute-force recovery is recommended for ≤6 chars only. Capped at 6.',
    startBrute: 'Starting brute-force recovery ({min}-{max} chars)... This may be slow!',
    recoverDone: 'Recovery finished. Password not found. Tested {count} candidates.',
    foundSuccess: 'Success! Password: {password}',
    stopped: 'Stopped.',
    progress: '{count} tested · {speed} / sec',
    resultTitle: 'Password found!',
    resultHint: 'Back up the password immediately and keep it safe.',
    clickToCopy: 'Click to copy password',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed. Please select the password manually.',
    exportBtn: 'Export key info',
    exportFilename: 'jks-recover-{name}.txt',
    exportFileLabel: 'Filename',
    exportNameLabel: 'Name',
    exportPasswordLabel: 'Password',
    exportRecoveredAt: 'Recovered at',
    exportFooter1: 'Recovered with JKS.Recover',
    exportFooter2: 'https://jks.awads.cc',
    metaDescription: 'Browser-based Android JKS Keystore password recovery. Smart wordlist, dictionary, and brute-force. Deploy to Cloudflare Pages.',
  },
};

const STORAGE_KEY = 'jks-recover-lang';

let currentLang = 'zh';
let onLangChange = null;

export function getLang() {
  return currentLang;
}

export function onLanguageChange(fn) {
  onLangChange = typeof fn === 'function' ? fn : null;
}

export function t(key, vars = {}) {
  const table = translations[currentLang] || translations.zh;
  let text = table[key] ?? translations.zh[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

export function setLang(lang) {
  if (!translations[lang]) lang = 'zh';
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  applyI18n();
  if (onLangChange) onLangChange(currentLang);
  return currentLang;
}

export function initI18n() {
  let lang = 'zh';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) lang = saved;
  } catch {
    /* ignore */
  }
  currentLang = lang;
  applyI18n();
  return currentLang;
}

function applyI18n() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('documentTitle');

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('metaDescription'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
  });
}
