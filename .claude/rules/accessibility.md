# Règles Accessibilité — CLIFFSIDE

## Standards
- **RGAA 4.1** — https://www.numerique.gouv.fr/publications/rgaa-accessibilite/
- **WCAG 2.1 AAA** — https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices** — https://www.w3.org/WAI/ARIA/apg/

## Contraste (niveau AAA obligatoire)
- Texte normal : ratio **7:1** minimum
- Grand texte (18px+ / 14px+ bold) : ratio **4.5:1** minimum
- Composants UI (bordures, icônes actives) : ratio **3:1** minimum
- Outil de vérification : https://webaim.org/resources/contrastchecker/

## Navigation clavier
- Tous les éléments interactifs accessibles au clavier (Tab, Shift+Tab)
- Ordre de focus logique (suit le flux visuel)
- Focus visible et contrasté (3px minimum, ratio 3:1)
- Aucun piège au clavier (modales : focus piégé intentionnellement + Escape)
- Skip link en début de page vers `#main-content`

## ARIA
- Préférer toujours HTML sémantique à l'ARIA
- `<button>` pour les actions, `<a>` pour la navigation
- Labels sur tous les inputs (`<label>` ou `aria-label`)
- `aria-live="polite"` pour les mises à jour dynamiques (toasts, erreurs)
- `aria-expanded`, `aria-selected`, `aria-checked` selon l'état
- `role="alert"` pour les erreurs critiques
- `aria-describedby` pour lier les messages d'erreur aux inputs

## Images
- `alt` descriptif sur les images informatives
- `alt=""` (vide) sur les images décoratives
- Pas d'information transmise uniquement via une image

## Formulaires
```tsx
// ✅ Bon
<div>
  <label htmlFor="email">Adresse email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" role="alert">
      Format invalide
    </p>
  )}
</div>
```

## Modales et dialogs
- Focus piégé dans la modale (cycle Tab à l'intérieur)
- Focus retourné à l'élément déclencheur à la fermeture
- Escape pour fermer
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

## Couleurs
- Jamais d'information transmise par couleur seule
- Toujours ajouter une icône ou un texte en complément

## Titres
- Un seul `<h1>` par page
- Hiérarchie respectée : h1 > h2 > h3 (pas de saut)
- Titres descriptifs du contenu (pas "Section 1")

## Tests accessibilité
- axe-core (extension navigateur Chrome/Firefox)
- NVDA + Firefox (Windows — test lecteur d'écran)
- Naviguer sans souris pendant 5 minutes
- `npx axe-core` en CI si configuré

## Sources
- https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/
- https://www.w3.org/WAI/WCAG21/quickref/
- https://www.w3.org/WAI/ARIA/apg/
- https://webaim.org/
- https://www.cnil.fr
