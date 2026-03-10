# ☕ Brewnal

> Your personal specialty coffee brewing journal.

**Brewnal** adalah app journaling kopi specialty yang membantu home brewer mendokumentasikan beans dan sesi brewing mereka secara detail — dengan bantuan AI untuk scan kemasan otomatis.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Fastify + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Storage | Supabase Storage |
| Deploy FE | Vercel |
| Deploy BE | Railway |
| AI | Anthropic Claude API (Vision) |
| i18n | i18next (ID & EN) |

---

## Struktur Project

```
brewnal/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Fastify backend
├── packages/
│   └── types/        # Shared TypeScript types
└── .github/
    └── workflows/    # CI/CD
```

---

## Setup

### Prerequisites
- Node.js v20+
- pnpm v9+

### Install
```bash
pnpm install
```

### Environment Variables
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit kedua file dengan credentials yang sesuai
```

### Database
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### Development
```bash
# Dari root — jalankan semua sekaligus
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

---

## Roadmap

- **Phase 1 (MVP):** Beans database + AI scan kemasan + Brew journal
- **Phase 2:** World flavor map + Indonesia heatmap
- **Phase 3:** Social feed + komunitas
