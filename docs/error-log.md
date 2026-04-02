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
| A11Y       | 0     |
| CONFIG     | 2     |
| **TOTAL**  | **2** |

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
