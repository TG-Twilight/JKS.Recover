# JKS.Recover

**English** | [中文](#jkrecover-中文)

Browser-side Android **JKS / Keystore** password recovery. Deploy anywhere static hosting works — especially **Cloudflare Pages**.

| | |
|------|------|
| Project | **JKS.Recover** |
| Page title | Chinese **JKS密码找回** / English **JKS Recover** (switchable; site UI defaults to Chinese) |
| Live site | [jks.awads.cc](https://jks.awads.cc) |
| License | [GPL-3.0](./LICENSE) |

Pure static frontend: JKS integrity checks (SHA-1 + UTF-16BE) run entirely in the browser. **Nothing is uploaded.** **No backend.**

## Features

- **Local only** — the keystore never leaves your browser
- **zh / en UI** — language toggle in the header (UI default: Chinese)
- **Three recovery modes** (smart wordlist first):
  - Smart wordlist (permutations + capitalization + numeric suffixes)
  - Dictionary recovery
  - Brute-force recovery (short passwords only, ~4–6 chars)
- **When found** — click to copy password + one-click export key info (`.txt`)
- **Multi-threaded** — Web Workers + `navigator.hardwareConcurrency`
- **Easy deploy** — Cloudflare Pages / GitHub Pages / Netlify, etc.

> **Note:** Browser CPU is limited. Best for quick checks, partially remembered passwords, and a lightweight always-on tool.

## Project structure

```
.
├── index.html          # Main page
├── favicon.ico         # Favicon
├── css/
│   └── style.css       # Green terminal / geek theme
├── js/
│   ├── app.js          # UI, i18n, recovery orchestration
│   ├── i18n.js         # English / Chinese strings
│   ├── keystore.js     # JKS password verification core
│   └── worker.js       # Web Worker (parallel candidate checks)
├── package.json        # No-op build script for Cloudflare Pages
├── LICENSE             # GPL-3.0
└── README.md
```

App code does **not** need `node_modules`. `package.json` only provides a no-op `build` so Cloudflare Pages has a build command to run.

## Local preview

Serve over HTTP (`file://` often breaks Web Workers / ES modules):

```bash
# Recommended (Node.js)
npx --yes serve . -l 8080

# Or project script
npm run preview

# If you have Python
python -m http.server 8080
```

Open: `http://localhost:8080`

## Deploy to Cloudflare Pages

### Option 1: Connect Git (recommended)

1. Push this repo to GitHub: `https://github.com/TG-Twilight/JKS.Recover`
2. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) (UI language can be Chinese or English)
3. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
4. Select **JKS.Recover** and use:

| Setting | Value |
|--------|----------|
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `/` |
| Root directory | `/` (repo root; leave default) |

5. **Save and Deploy**

You will get a `*.pages.dev` URL; bind a custom domain (e.g. `jks.awads.cc`) in project settings if needed.

> This repo is fully static. `npm run build` does not compile assets — it only satisfies Pages’ required build command and prints a log line. You may also use `echo ok` as the build command.

### Option 2: Wrangler upload

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=jks-recover
```

### Option 3: Direct upload

Zip the repo root (must include `index.html`) and use **Direct Upload** / **Upload assets** in Cloudflare Pages.

No Cloudflare Workers or Pages Functions required.

## Algorithm

JKS outer integrity check:

```
SHA-1( UTF-16BE(password) + "Mighty Aphrodite" + keystore_body )
```

Compare the digest with the last 20 bytes of the file. Cheap enough for bulk tries in the browser.

## License

Released under the **GNU General Public License v3.0 (GPL-3.0)**. Full text: [LICENSE](./LICENSE).

Redistribution and modification must follow GPL-3.0.

---

[JKS.Recover](https://github.com/TG-Twilight/JKS.Recover) · [秋风塬上](https://awads.cc) · [秋风のとおり道](https://t.me/AWAvenue)

*Built with Grok Build and Grok 4.5 — ridiculously fast 😏*

---

# JKS.Recover · 中文

[English](#jkrecover) | **中文**

纯浏览器端的 Android **JKS / Keystore** 密码恢复工具，可直接部署到 **Cloudflare Pages**（或任意静态托管）。

| 项目 | 说明 |
|------|------|
| 项目名称 | **JKS.Recover** |
| 页面标题 | 中文 **JKS密码找回** / 英文 **JKS Recover**（可切换，站点界面默认中文） |
| 在线站点 | [jks.awads.cc](https://jks.awads.cc) |
| 许可证 | [GPL-3.0](./LICENSE) |

本项目为纯静态前端：在浏览器内完成 JKS 完整性校验（SHA-1 + UTF-16BE），**文件不会上传到服务器**，也**没有后端依赖**。

## 特性

- **完全本地运行**：Keystore 始终留在你的浏览器里
- **中英文界面**：右上角切换语言，界面默认中文
- **三种恢复方式**（默认优先智能词表）：
  - 智能词表恢复（排列组合 + 首字母大写 + 数字后缀）
  - 字典恢复
  - 暴力恢复（仅推荐 4～6 位）
- **找到密码后**：点击复制密码 + 一键导出密钥信息（txt）
- **多线程**：Web Workers + `navigator.hardwareConcurrency`
- **易部署**：适配 Cloudflare Pages / GitHub Pages / Netlify 等

> **说明**：浏览器算力有限。本工具更适合快速验证、部分记得密码、以及部署后随时可用的轻量场景。

## 项目结构

```
.
├── index.html          # 主页面
├── favicon.ico         # 网站图标
├── css/
│   └── style.css       # 绿色终端极客风样式
├── js/
│   ├── app.js          # UI、语言切换、恢复调度
│   ├── i18n.js         # 中英文文案
│   ├── keystore.js     # JKS 密码验证核心
│   └── worker.js       # Web Worker（并行验证候选密码）
├── package.json        # 供 Cloudflare Pages 使用的占位构建脚本
├── LICENSE             # GPL-3.0
└── README.md
```

业务代码本身不依赖 `node_modules`。`package.json` 仅提供一个空操作的 `build` 脚本，方便在 Cloudflare Pages 里填写「构建命令」。

## 本地预览

请使用本地 HTTP 服务打开（直接用 `file://` 打开时，Web Worker / ES Module 可能无法正常工作）：

```bash
# 推荐（需已安装 Node.js）
npx --yes serve . -l 8080

# 或使用项目脚本
npm run preview

# 若本机有 Python
python -m http.server 8080
```

浏览器访问：`http://localhost:8080`

## 部署到 Cloudflare Pages

### 方法一：连接 Git（推荐）

1. 确保代码已推送到 GitHub：`https://github.com/TG-Twilight/JKS.Recover`
2. 登录 [Cloudflare 仪表板](https://dash.cloudflare.com/)（界面可选中文）
3. 进入 **Workers 和 Pages** → **创建** → **Pages** → **连接到 Git**
4. 选择仓库 **JKS.Recover**，构建配置建议如下：

| 配置项 | 填写内容 |
|--------|----------|
| 框架预设 | **无**（None） |
| 构建命令 | `npm run build` |
| 构建输出目录 | `/` |
| 根目录 | `/`（仓库根目录，保持默认即可） |

5. 点击 **保存并部署**

几分钟后会得到 `*.pages.dev` 域名，也可在项目设置中绑定自定义域名（例如 `jks.awads.cc`）。

> 说明：本仓库是纯静态站点，`npm run build` 不会编译任何资源，只是满足 Cloudflare Pages「必须填写构建命令」的要求并打印一行日志。若你更习惯简写，构建命令也可写成：`echo ok`。

### 方法二：使用 Wrangler 直接上传

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=jks-recover
```

### 方法三：在仪表板直接上传

将本仓库根目录（至少包含 `index.html`）打成 zip，在 Cloudflare Pages 选择 **直接上传** / **Upload assets** 上传即可。

本项目**不需要** Cloudflare Workers 或 Pages Functions。

## 算法说明

JKS 外层密码完整性校验可概括为：

```
SHA-1( UTF-16BE(password) + "Mighty Aphrodite" + keystore_body )
```

将计算结果与文件末尾 20 字节签名比对，即可判断密码是否正确。该方法计算开销小，适合在浏览器中批量尝试。

## 许可证

本项目采用 **GNU General Public License v3.0（GPL-3.0）** 发布，完整文本见 [LICENSE](./LICENSE)。

在分发、修改或再发布时，请遵守 GPL-3.0 的相应要求。

---

[JKS.Recover](https://github.com/TG-Twilight/JKS.Recover) · [秋风塬上](https://awads.cc) · [秋风のとおり道](https://t.me/AWAvenue)

*本项目由 Grok Build 与 Grok 4.5 协作完成，这玩意真快啊😏*
