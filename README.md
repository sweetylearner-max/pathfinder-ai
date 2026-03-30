# 🃏 NeoCard Studio

> Your Offline Digital Identity Platform — No internet. No server. Just you.

Developed by **Akanksha**

---

## ✨ What is NeoCard Studio?

NeoCard Studio is a fully offline, PWA-ready digital profile and QR code platform. Create your digital identity, organize your links, generate beautiful QR codes, and share your profile — all without touching a server or database. Everything lives in your browser.

---

## 🚀 Features

- **100% Offline** — Powered by IndexedDB via Dexie.js. No backend required.
- **Category-Based CRUD** — Organize your links, bios, files, videos, and music into categories.
- **Drag & Drop** — Reorder items and categories with smooth DnD.
- **QR Code Engine** — Generate stylish QR codes with custom colors and a center logo.
- **Snapshot Algorithm** — Every QR page is a frozen snapshot saved with a unique UUID.
- **Public Profile Viewer** — Share `/p/[uuid]` links — mobile-first, read-only, beautiful.
- **Offline Analytics** — Track scan counts per QR page with Recharts graphs.
- **NFC Support** — Write your profile URL to NFC tags (Web NFC API on Android Chrome).
- **PWA Installable** — Install on mobile or desktop like a native app.
- **Glassmorphism UI** — Dark/light mode with a sleek MUI theme.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| UI | Material UI (MUI) v5 |
| Database | Dexie.js (IndexedDB) |
| QR Engine | qrcode.react |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| PWA | vite-plugin-pwa + Workbox |
| Routing | React Router v6 |

---

## 📦 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/akanksha/neocard-studio.git
cd neocard-studio

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to **Netlify**, **Vercel**, or **GitHub Pages** — no server config needed.

---

## 📁 Project Structure

```
neocard-studio/
├── src/
│   ├── db/
│   │   └── db.ts              # Dexie schema (users, categories, items, publicPages, analytics)
│   ├── hooks/
│   │   └── useConnectDB.ts    # All CRUD hooks + Snapshot algorithm
│   ├── components/
│   │   └── QRStyler.tsx       # QR color, logo, download
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── MyQRsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── PublicView.tsx     # /p/[uuid] — read-only viewer
│   ├── theme/
│   │   └── theme.ts           # MUI glassmorphism dark/light theme
│   └── App.tsx                # Sidebar layout + routing
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🔐 Privacy & Security

- All data is stored **locally** in your browser's IndexedDB.
- **Nothing is sent to any server.**
- The public profile viewer (`/p/[uuid]`) is **read-only** — no edit controls, no private data exposed.
- Duplicate item detection prevents accidental data clutter.

---

## 📱 PWA Installation

1. Open the app in Chrome or Edge
2. Click the **Install** button in the address bar
3. Use it like a native app — works fully offline

---

## 🎨 Screenshots

> Dashboard · Categories · QR Generator · Public Profile · Analytics

*(Coming soon)*

---

## 📄 License

MIT © Akanksha
