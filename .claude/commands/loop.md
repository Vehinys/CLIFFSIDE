# /loop — Boucle tests → fix → 0 erreur (CLIFFSIDE Next.js)

Lance une boucle de correction automatique jusqu'à 0 erreur. Maximum 5 itérations.

## Cycle par itération

### Étape 1 — TypeScript
```bash
npx tsc --noEmit
```

### Étape 2 — Linter ESLint
```bash
npm run lint
```

### Étape 3 — Tests
```bash
npm test -- --passWithNoTests
```

## Logique de contrôle

```
POUR i DE 1 À 5 :
  Lance TypeScript → ESLint → Tests
  SI 0 erreur :
    AFFICHE "✅ 0 erreur — boucle terminée en {i} itération(s)"
    STOP
  SINON :
    Analyse chaque erreur
    Consulte la doc officielle si besoin
    Applique le fix minimal
    Enregistre dans docs/error-log.md si erreur non triviale
    Continue à l'itération suivante

SI 5 itérations sans succès :
  AFFICHE les erreurs restantes
  DEMANDE instruction à l'utilisateur
```

## Règles à respecter
- Consulter la doc officielle AVANT chaque fix (nextjs.org, react.dev, prisma.io)
- Jamais de `any` ou `@ts-ignore` pour masquer une erreur TypeScript
- Enregistrer dans `docs/error-log.md` les erreurs non triviales
- Ne jamais ignorer silencieusement une erreur
- Si un fix en crée une autre, compter comme une nouvelle itération
