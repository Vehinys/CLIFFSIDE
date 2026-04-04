# Journal d'Erreurs — CLIFFSIDE

> Stack : Next.js 16 • TypeScript 5 • Prisma 7 • PostgreSQL (Neon) • Tailwind CSS 4
>
> Workflow : **démarrage** → lis ce journal | **avant modif** → vérifie les erreurs passées | **après erreur** → mets à jour

---

## Statistiques

| Catégorie  | Count |
|------------|-------|
| SYNTAX     | 0     |
| IMPORT     | 0     |
| LOGIC      | 0     |
| PATTERN    | 0     |
| TYPE       | 0     |
| SECURITY   | 0     |
| PERF       | 0     |
| A11Y       | 1     |
| CONFIG     | 3     |
| **TOTAL**  | **4** |

---

## Quick Reference — Erreurs fréquentes

_Aucune erreur enregistrée pour l'instant._

---

## Erreurs

### ERR-001 — Build local échoue sur drive F: (EISDIR / readlink)
- **Date** : 2026-04-02
- **Catégorie** : CONFIG
- **Fichier** : `next.config.ts` / OS Windows drive F:
- **❌ Mauvais** : `npm run build` → `EISDIR: illegal operation on a directory, readlink '...'`
- **✅ Bon** : Build fonctionne sur Vercel (Linux). Localement : tester avec `npm run dev` uniquement.
- **Cause racine** : Le drive F: (exFAT ou NTFS avec restrictions) ne supporte pas `readlink` sur fichiers réguliers. Turbopack crée des junction points qui échouent aussi. Webpack appelle `readlink` pendant la résolution de modules.
- **Règle** : Ne pas valider le build localement sur F:. Vérifier TypeScript (`npx tsc --noEmit`) + lint à la place. Faire confiance au CI/CD Vercel pour le build.
- **Source** : https://github.com/vercel/next.js/discussions/87770

### ERR-003 — Middleware Next.js ignoré si le fichier est mal nommé
- **Date** : 2026-04-04
- **Catégorie** : CONFIG
- **Fichier** : `src/proxy.ts` → renommé en `src/middleware.ts`
- **❌ Mauvais** : `src/proxy.ts` — Next.js n'exécute jamais ce fichier comme middleware
- **✅ Bon** : `src/middleware.ts` — seul ce chemin est reconnu par Next.js
- **Cause racine** : Next.js ne lit que `middleware.ts` (ou `src/middleware.ts` si `src/` est utilisé). Tout autre nom de fichier est silencieusement ignoré.
- **Règle** : Le middleware Next.js DOIT s'appeler exactement `middleware.ts` dans `/` ou `src/`.
- **Source** : https://nextjs.org/docs/app/building-your-application/routing/middleware

### ERR-004 — `directUrl` Neon non supporté dans Prisma 7 config
- **Date** : 2026-04-04
- **Catégorie** : CONFIG
- **Fichier** : `prisma.config.ts`, `prisma/schema.prisma`
- **❌ Mauvais** : `directUrl` dans `defineConfig({ datasource: { ... } })` → TS error ; `directUrl` dans `schema.prisma` → Prisma CLI error P1012
- **✅ Bon** : Prisma 7.6.0 ne supporte pas encore `directUrl` dans les fichiers de config. Les migrations Neon (production) doivent utiliser `DIRECT_URL` manuellement via la CLI ou attendre une mise à jour Prisma.
- **Cause racine** : Prisma 7 a supprimé `directUrl` de `schema.prisma` mais ne l'a pas encore ajouté à `defineConfig`.
- **Règle** : Surveiller https://github.com/prisma/prisma/releases pour l'ajout de `directUrl` dans `defineConfig`. En attendant, utiliser `DATABASE_URL` avec connexion directe (non-pooled) pour les migrations CI.
- **Source** : https://pris.ly/d/config-datasource

### ERR-005 — Focus outline 2px insuffisant pour RGAA AAA
- **Date** : 2026-04-04
- **Catégorie** : A11Y
- **Fichier** : `src/app/globals.css`
- **❌ Mauvais** : `outline: 2px solid #dc2626`
- **✅ Bon** : `outline: 3px solid #dc2626`
- **Cause racine** : RGAA AAA et les règles `.claude/rules/accessibility.md` exigent 3px minimum pour les indicateurs de focus.
- **Règle** : Toujours utiliser `outline: 3px` minimum pour `:focus-visible` (RGAA AAA).
- **Source** : https://www.w3.org/WAI/WCAG21/Understanding/focus-appearance-enhanced

### ERR-002 — exactOptionalPropertyTypes brise les champs Prisma optionnels
- **Date** : 2026-04-02
- **Catégorie** : CONFIG
- **Fichier** : `src/app/(dashboard)/inventory/_actions.ts`, `treasury/_actions.ts`, `register/_actions.ts`
- **❌ Mauvais** : `description?: string | undefined` passé à Prisma qui attend `string | null`
- **✅ Bon** : `z.string().optional().transform((v) => v ?? null)` → type `string | null`
- **Cause racine** : `exactOptionalPropertyTypes: true` dans tsconfig distingue `undefined` de `null`. Les champs `String?` Prisma génèrent `string | null` mais Zod `optional()` génère `string | undefined`.
- **Règle** : Pour tout champ nullable Prisma dans un schéma Zod : toujours `.transform((v) => v ?? null)` après `.optional()`.
- **Source** : https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes

---

## Template

```markdown
### ERR-[NNN] — [Titre]
- **Date** : YYYY-MM-DD
- **Catégorie** : SYNTAX | IMPORT | LOGIC | PATTERN | TYPE | SECURITY | PERF | A11Y | CONFIG
- **Fichier** : chemin/du/fichier
- **❌ Mauvais** : `code incorrect`
- **✅ Bon** : `code correct`
- **Cause racine** : pourquoi l'erreur s'est produite
- **Règle** : règle à suivre désormais pour éviter cette erreur
- **Source** : URL de la documentation consultée
```
