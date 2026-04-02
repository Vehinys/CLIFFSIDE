# /doctor — Diagnostic complet CLIFFSIDE (Next.js)

Lance un diagnostic complet du projet Next.js CLIFFSIDE et affiche un rapport structuré.

## Étapes du diagnostic

### 1. Structure du projet
Vérifie l'existence des fichiers et dossiers clés :
- `app/` `components/` `lib/` `prisma/`
- `CLAUDE.md` `.claude/rules/` `docs/error-log.md`
- `.env.local` (et `.env.example` pour le template)
- `package.json` `tsconfig.json` `tailwind.config.ts` `next.config.js`

### 2. Dépendances
```bash
npm ls --depth=0
npm outdated
```

### 3. TypeScript
```bash
npx tsc --noEmit
```

### 4. Linter
```bash
npm run lint
```

### 5. Prisma
```bash
npx prisma validate
npx prisma generate
```

### 6. Tests
```bash
npm test -- --passWithNoTests 2>/dev/null || echo "Tests non configurés"
```

### 7. Build Next.js
```bash
npm run build
```

### 8. Journal d'erreurs
Lis `docs/error-log.md` et affiche le tableau des statistiques.

### 9. Git
```bash
git status
git log --oneline -5
```

## Format du rapport

```
╔══════════════════════════════════════╗
║    DIAGNOSTIC CLIFFSIDE              ║
╚══════════════════════════════════════╝

Structure        ✅ OK
TypeScript       ✅ 0 erreur
Linter           ⚠️  3 warnings
Prisma           ✅ Schema valide
Tests            ✅ X tests passés
Build            ✅ Succès
Journal erreurs  📋 0 erreur enregistrée
Git              ✅ Working tree clean

Recommandations :
→ ...
```

Termine par : "Tape /loop pour corriger automatiquement les erreurs détectées."
