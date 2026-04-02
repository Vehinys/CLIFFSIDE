# Règles CSS / Tailwind — CLIFFSIDE

## Version cible
- Tailwind CSS 3.x
- PostCSS

## Conventions

### Mobile-first obligatoire
```typescript
// ✅ Bon — mobile-first
<div className="flex flex-col sm:flex-row md:gap-6">

// ❌ Mauvais — desktop-first
<div className="hidden md:block sm:flex">
```

### Helper cn() pour classes conditionnelles
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<Button className={cn('base', isActive && 'ring-2', isDisabled && 'opacity-50')} />
```

### Design tokens dans tailwind.config.ts
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50: '#...',
        500: '#...',
        900: '#...',
      }
    }
  }
}
```

## Contraste (RGAA AAA)
- Ratio minimum : **7:1** pour le texte normal
- Ratio minimum : **4.5:1** pour le grand texte (18px+ ou 14px+ bold)
- Ratio minimum : **3:1** pour les composants UI (bordures, icônes)
- Outil : https://webaim.org/resources/contrastchecker/

## Focus visible (obligatoire)
```css
/* globals.css */
*:focus-visible {
  outline: 3px solid theme('colors.brand.500');
  outline-offset: 2px;
}
```

Ne JAMAIS `outline-none` sans alternative `:focus-visible` visible.

## Composants avec variantes (cva)
```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      intent: {
        primary: 'bg-brand-500 text-white hover:bg-brand-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
  }
)
```

## Anti-patterns à éviter
- Pas d'inline style `style={{ color: '#fff' }}` si faisable en Tailwind
- Pas de classes Tailwind arbitraires `[color:#custom]` pour les couleurs de marque — utiliser les tokens
- Ne jamais `outline-0` ou `outline-none` sans `:focus-visible` visible
- Pas d'info transmise par couleur seule (ajouter icône ou texte)

## Sources
- https://tailwindcss.com/docs
- https://cva.style/docs
- https://github.com/lukeed/clsx
- https://github.com/dcastil/tailwind-merge
