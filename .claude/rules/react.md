# Règles React / Next.js 14 — CLIFFSIDE

## Version cible
- Next.js 14.x (App Router)
- React 18.x
- TypeScript 5.x

## Structure App Router
```
app/
  layout.tsx              — layout racine
  page.tsx                — home
  (auth)/login/page.tsx
  (auth)/register/page.tsx
  (protected)/layout.tsx  — protection session
  (protected)/dashboard/
  (protected)/admin/      — ROLE_ADMIN uniquement
  api/auth/[...nextauth]/route.ts
components/ui/            — Button, Input, Card...
components/forms/
lib/prisma.ts             — singleton client
lib/auth.ts               — config Auth.js
lib/permissions.ts        — logique multi-rôles
lib/utils.ts              — cn() helper
prisma/schema.prisma
```

## Conventions de nommage
- Composants : `PascalCase.tsx`
- Hooks : `useCamelCase.ts`
- Utils / lib : `camelCase.ts`
- Server Actions : `actions.ts` dans le dossier feature
- Types : colocalisés dans le fichier ou `types/index.ts`

## Patterns recommandés

### Server Components (défaut)
```typescript
// Pas de 'use client' → Server Component
// Accès DB direct, async/await, pas de hooks React
import { prisma } from '@/lib/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany()
  return <UserList users={users} />
}
```

### Client Components (interactivité uniquement)
```typescript
'use client'
import { useState, useTransition } from 'react'

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  // ...
}
```

### Server Actions
```typescript
'use server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createItem(data: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  await prisma.item.create({ data: { /* ... */ } })
  revalidatePath('/dashboard')
}
```

### Loading & Error boundaries
- `loading.tsx` — skeleton/spinner automatique (Suspense)
- `error.tsx` — composant `'use client'` avec reset()
- `not-found.tsx` — page 404 customisée

## Anti-patterns à éviter
- Ne pas `'use client'` les layouts (perd les Server Components)
- Ne pas fetcher dans les Client Components (passer via props ou Context)
- Ne pas importer `prisma` dans les fichiers `'use client'`
- Éviter `useEffect` pour fetch initial (utiliser Server Components)
- Ne pas créer un nouveau `PrismaClient` à chaque import (`lib/prisma.ts` singleton)

## Sources
- https://nextjs.org/docs/app/building-your-application/rendering
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- https://react.dev/reference/rsc/server-components
