# JKS.Recover

[English](./README.md) | [中文](./README_zh-CN.md)

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
├── README.md           # English
└── README_zh-CN.md     # Chinese
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
