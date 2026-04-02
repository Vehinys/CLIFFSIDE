# Règles TypeScript — CLIFFSIDE

## Version cible
- TypeScript 5.x
- Mode strict activé dans `tsconfig.json`

## Config tsconfig.json (obligatoire)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Conventions de nommage
- Types/Interfaces : `PascalCase`
- Enums : `PascalCase` avec valeurs `UPPER_CASE`
- Fichiers de types : `*.types.ts` ou `types/index.ts`

## Patterns recommandés

### Types Prisma (réutiliser, ne pas redéfinir)
```typescript
// ✅ Prisma 7 — import depuis le dossier généré (output = "src/generated/prisma")
import type { User, Role, Permission } from '@/generated/prisma'
import type { Prisma } from '@/generated/prisma'

// Extension avec Prisma utility types
type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true }
}>
```

### Types Next.js App Router
```typescript
// Props de page
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Layout props
interface LayoutProps {
  children: React.ReactNode
  params: { locale: string }
}
```

### Enum pour les rôles
```typescript
// Défini dans prisma/schema.prisma, importé depuis @prisma/client
import { Role } from '@prisma/client'
// Role.ADMIN | Role.MODERATOR | Role.USER
```

### Zod pour la validation (formulaires / API)
```typescript
import { z } from 'zod'

const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
})

type CreateItemInput = z.infer<typeof createItemSchema>
```

### Satisfies operator
```typescript
const config = {
  db: process.env.DATABASE_URL,
  auth: process.env.AUTH_SECRET,
} satisfies Record<string, string | undefined>
```

## Anti-patterns à éviter
- Pas de `any` — utiliser `unknown` si le type est vraiment inconnu
- Pas de `as any` pour contourner une erreur TypeScript
- Pas de `// @ts-ignore` — utiliser `// @ts-expect-error` avec un commentaire explicatif
- Pas de `object` ou `{}` comme type générique
- Ne pas redéfinir des types déjà générés par Prisma

## Sources
- https://www.typescriptlang.org/tsconfig
- https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety
- https://zod.dev/
