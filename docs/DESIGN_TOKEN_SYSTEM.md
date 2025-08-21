## Design System Tokens

We introduced a lightweight design token layer to standardize colors, typography, radii, and shadows across the web app while keeping Tailwind as the utility layer.

Table of Contents
- Location of tokens
- Tailwind mappings
- Base styles
- How to use
- Migration tips

### Location of tokens
- `src/css/tokens.css` defines CSS variables under `:root`.

### Tailwind mappings
- `tailwind.config.js` maps token variables to Tailwind theme keys:
  - Colors: `primary`, `primary-foreground`, `accent`, `info`, `success`, `warning`, `danger`, `surface`, `surface-variant`, `outline`
  - Fonts: `heading`, `body`
  - Radius: `sm|md|lg`
  - Shadows: `sm|md`

### Base styles
- `src/index.css` imports `tokens.css` and applies:
  - Typography families via `@layer base`
  - Link and button colors using token variables
  - Utility classes `.btn` and `.btn-primary`

### How to use
```jsx
<button className="btn btn-primary">Continue</button>
<div className="bg-primary text-primary-foreground rounded-md shadow-md">...</div>
```

### Migration tips
- Replace hardcoded hex colors with Tailwind token classes where feasible.
- For inline styles required by third-party libs (Leaflet, Chart.js), read from variables:
```js
const styles = getComputedStyle(document.documentElement);
const navy = styles.getPropertyValue('--color-navy-800').trim();
```

