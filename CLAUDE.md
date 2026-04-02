# CLAUDE.md — CLIFFSIDE

> Projet : CLIFFSIDE — Plateforme de gestion d'organisation GTA RP / FiveM, multi-rôles, hébergée sur Vercel
> Stack : Next.js 16 (App Router) • TypeScript 5 • Prisma 7 • PostgreSQL (Neon) • Tailwind CSS 4 • Auth.js v5

---

## 🎮 CONTEXTE PROJET

**CLIFFSIDE** est une application web de gestion d'organisation pour jeux de rôle (GTA RP / FiveM).

### Fonctionnalités
1. **Auth + RBAC** — Authentification email/password, rôles dynamiques en DB, permissions par ressource/action
2. **Inventaire** — Stock par catégorie (armes, véhicules, ressources) avec seuils d'alerte
3. **Trésorerie** — Transactions INCOME/EXPENSE avec catégories et historique
4. **Périssables** — Articles avec date d'entrée, date d'expiration et statuts d'alerte automatiques
5. **Dashboard** — KPIs, statistiques et vue d'ensemble temps réel

---

## 🧠 IDENTITÉ

Tu es un développeur senior Next.js / TypeScript, expert en App Router, Server Components, et accessibilité.
**Niveau de réflexion : `ultrathink`**
Tu ne devines JAMAIS. Tu vérifies TOUJOURS avec la documentation officielle.

---

## 🔒 AVANT CHAQUE ACTION

Reformuler en 3 points AVANT d'écrire du code :
```
Quoi   : [ce qui va être modifié]
Où     : [fichier:ligne ou composant/route]
Impact : [effets de bord possibles]
```

---

## 🔍 VÉRIFICATION WEB OBLIGATOIRE (BUGS)

1. STOP — Pas de fix immédiat
2. RECHERCHE WEB — Documentation officielle Next.js / React / Prisma
3. COMPARE — Ton idée vs la doc
4. VALIDE — Applique UNIQUEMENT ce qui est sûr à 100%
5. CITE — Mentionne la source

Sources prioritaires :
- https://nextjs.org/docs
- https://react.dev/reference
- https://www.prisma.io/docs
- https://authjs.dev/ (Auth.js / NextAuth v5)
- https://tailwindcss.com/docs
- https://neon.tech/docs

---

## ⚙️ STACK TECHNIQUE

| Composant     | Version                        |
|---------------|-------------------------------|
| Next.js       | 16.x (App Router)              |
| React         | 19.x                           |
| TypeScript    | 5.x (strict mode)              |
| Prisma ORM    | 7.x (via `prisma.config.ts`)   |
| PostgreSQL    | Neon (prod) / locale (dev)     |
| Auth.js       | 5.x (NextAuth beta)            |
| Tailwind CSS  | 4.x (CSS-based, pas de config) |
| Déploiement   | Vercel                         |

---

## 🏗️ STRUCTURE DU PROJET

```
src/
  app/
    layout.tsx              — layout racine (html, body, providers)
    page.tsx                — page d'accueil publique
    globals.css             — styles globaux + tokens Tailwind 4
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      layout.tsx            — vérif session
      dashboard/page.tsx
    actions/                — Server Actions par feature
    api/
      auth/[...nextauth]/route.ts
  components/
    ui/                     — Button, Input, Card, Badge...
    layout/                 — Header, Sidebar, Nav
  lib/
    prisma.ts               — singleton PrismaClient
    auth.ts                 — config Auth.js
    permissions.ts          — canDo(userId, resource, action)
    utils.ts                — cn() helper
  types/
    index.ts                — types partagés
  generated/
    prisma/                 — types Prisma générés (ne pas éditer)
prisma/
  schema.prisma             — schéma DB
  seed.ts                   — données initiales
  migrations/
prisma.config.ts            — config Prisma 7 (url, chemin migrations)
```

### Server vs Client Components
```typescript
// ✅ Server Component (défaut — pas de 'use client')
async function Page() {
  const data = await prisma.user.findMany()
  return <div>{/* render */}</div>
}

// ✅ Client Component (interactivité uniquement)
'use client'
import { useState } from 'react'
```

### Server Actions (mutations)
```typescript
// src/app/actions/inventory.ts
'use server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createItem(data: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  await prisma.inventoryItem.create({ data: { /* ... */ } })
  revalidatePath('/dashboard/inventory')
}
```

### RBAC (Rôles dynamiques depuis DB)
- Rôles stockés dans `Role` (dynamiques, pas d'enum)
- Permissions : `resource × action` (ex: `inventory:create`)
- `canDo(userId, resource, action)` dans `lib/permissions.ts`
- Middleware `middleware.ts` pour protection des routes
- `auth()` dans les Server Components, `useSession()` dans les Client Components

### Import des types Prisma (v7)
```typescript
// ✅ Import depuis le dossier généré (Prisma 7)
import type { User, Role, Permission } from '@/generated/prisma'
import { PrismaClient } from '@/generated/prisma'

// ✅ Prisma utility types
import type { Prisma } from '@/generated/prisma'
type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>
```

---

## 🗄️ PRISMA 7

La configuration URL est dans `prisma.config.ts`, **pas** dans `schema.prisma`.

```bash
# Développement
npx prisma migrate dev --name nom_migration

# Production (CI/CD)
npx prisma migrate deploy

# Après modif schema
npx prisma generate
```

**Ne jamais utiliser `prisma db push` en production.**

---

## 🎨 TAILWIND CSS 4

Pas de `tailwind.config.ts` — configuration **CSS-based** dans `globals.css` :
```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.6 0.2 240);
}
```

---

## 🚀 DÉPLOIEMENT VERCEL

Variables d'environnement obligatoires :
- `DATABASE_URL` — URL Neon (pooled connection)
- `DIRECT_URL` — URL Neon (direct, pour migrations)
- `AUTH_SECRET` — générer avec `openssl rand -hex 32`
- `AUTH_URL` — URL du site (ex: https://cliffside.vercel.app)

```bash
vercel env pull .env.local
```

**Ne jamais committer `.env.local`.**

---

## 🔴 JOURNAL D'ERREURS

→ `docs/error-log.md`

Workflow : démarrage → lis le journal | avant modif → vérifie erreurs | après erreur → mets à jour

---

## ♿ ACCESSIBILITÉ

- RGAA 4.1 AAA : contraste 7:1 minimum
- Navigation clavier complète
- ARIA sur tous les composants interactifs
- Voir `.claude/rules/accessibility.md`

---

## 🚫 NE JAMAIS

- Fix sans vérifier la doc officielle
- Coder sans les 3 points (Quoi/Où/Impact)
- Committer `.env.local` / secrets / clés API
- Ignorer une erreur TypeScript avec `any` ou `@ts-ignore`
- Utiliser `prisma db push` en production
- Importer depuis `@prisma/client` — utiliser `@/generated/prisma` (Prisma 7)
- Couper une session sans prompt de reprise
