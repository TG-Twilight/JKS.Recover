# JKS.Recover

纯浏览器端的 Android **JKS / Keystore** 密码恢复工具，可直接部署到 **Cloudflare Pages**（或任何静态托管）。

项目名称：**JKS.Recover**  
页面标题：中文 **JKS密码找回** / 英文 **JKS Recover**（支持一键切换，默认中文）

纯前端实现 JKS 完整性校验（SHA-1 + UTF-16BE），**无构建步骤、无后端依赖**。在线站点：[jks.awads.cc](https://jks.awads.cc)

## 特性

- **完全本地运行**：Keystore 文件不会上传到任何服务器
- **中英文界面**：右上角切换语言，默认中文
- **三种恢复方式**（默认优先智能词表）：
  - 智能词表恢复（排列组合 + 首字母大写 + 数字后缀）
  - 字典恢复
  - 暴力恢复（仅推荐 4～6 位）
- **找到密码后**：点击复制 + 一键导出密钥信息（txt）
- **多线程**：Web Workers + `navigator.hardwareConcurrency`
- **一键部署**：纯静态站点，适配 Cloudflare Pages / GitHub Pages / Netlify 等

> **注意**：浏览器算力有限。本工具适合快速验证、部分记忆的密码、以及部署后随时可用的轻量场景。

## 项目结构

```
.
├── index.html          # 主页面
├── css/
│   └── style.css       # 绿色终端极客风样式
├── js/
│   ├── app.js          # UI、i18n 调度、恢复编排
│   ├── i18n.js         # 中英文文案
│   ├── keystore.js     # JKS 密码验证核心（SHA-1 + UTF-16BE）
│   └── worker.js       # Web Worker（并行验证候选密码）
├── .gitignore
└── README.md
```

纯静态前端，**无需** `npm install`、**无需** 构建命令。

## 本地预览

任意静态 HTTP 服务器即可（`file://` 下 Web Worker 可能受限，请用本地服务器）：

```bash
# Python
python -m http.server 8080

# Node（若已安装）
npx serve .

# PHP
php -S localhost:8080
```

浏览器打开 `http://localhost:8080` 即可。

## 部署到 Cloudflare Pages

### 方法一：连接 GitHub（推荐）

1. 将本仓库推送到 GitHub：`https://github.com/TG-Twilight/JKS.Recover`
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库 **JKS.Recover**，构建设置：
   - **Framework preset**：None
   - **Build command**：*留空*
   - **Build output directory**：`/`（或 `.`）
4. 点击 **Save and Deploy**

几分钟后获得 `https://xxx.pages.dev` 域名，也可绑定自定义域名。

### 方法二：Wrangler 直接上传

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=jks-recover
```

### 方法三：Dashboard 直接上传

将本仓库根目录（含 `index.html`）打成 zip，在 Cloudflare Pages 选择 **Upload assets** 上传即可。

本项目是纯静态，**不需要** Cloudflare Worker / Functions。

## 算法说明

JKS 的密码完整性检查为：

```
SHA-1( UTF-16BE(password) + "Mighty Aphrodite" + keystore_body )
```

与文件末尾 20 字节签名比对即可判断密码是否正确。此方法高效，适合在浏览器中批量尝试。

## License

UI 与调度代码可自由使用。

---

[JKS.Recover](https://github.com/TG-Twilight/JKS.Recover) · [秋风塬上](https://awads.cc) · [秋风のとおり道](https://t.me/AWAvenue)
