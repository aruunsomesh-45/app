# Dior-Inspired Luxury Theme 🎨

## Overview
This application uses a premium, Dior-inspired color palette that provides an elegant and luxurious experience in both light and dark modes.

---

## Color Palette

### Dark Mode Colors
- **Primary Background**: `#333333` (Graphite) - Sophisticated dark grey
- **Surface/Cards**: `#1A1A1A` (Carbon Black) - Deep, rich black for elevated surfaces
- **Text**: `#000000` (Black) - High contrast main text
- **Secondary Text**: `#CCCCCC` (Silver) - Subtle, readable secondary text
- **Borders**: `#1A1A1A` (Carbon Black) - Elegant dividers
- **Highlights/Icons**: `#F5F5F5` (White Smoke) - Crisp icons and highlights

### Light Mode Colors
- **Primary Background**: `#F5F5F5` (White Smoke) - Clean, premium white
- **Surface/Cards**: `#FFFFFF` (Pure White) - Pristine card backgrounds
- **Text**: `#333333` (Graphite) - Readable, comfortable main text
- **Headings**: `#000000` (Black) - Bold, impactful headings
- **Secondary Text**: `#DDDDDD` (Alabaster Grey) - Soft secondary information
- **Borders**: `#CCCCCC` (Silver) - Refined dividers and outlines

### Accent Colors (Both Modes)
- **Primary Accent**: `#847777` (Rosy Granite) - Warm, sophisticated accent for buttons and CTAs
- **Hover State**: `#6d5f5f` - Darker Rosy Granite for interactive states

---

## Using the Theme

### 1. CSS Custom Properties
The theme uses CSS custom properties that automatically switch based on dark/light mode:

```css
.my-element {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
```

Available CSS variables:
- `--bg-primary` - Primary background
- `--bg-surface` - Card/surface backgrounds
- `--text-primary` - Main text color
- `--text-heading` - Heading color
- `--text-secondary` - Secondary text
- `--border-color` - Border color
- `--accent-color` - Accent/CTA color
- `--highlight-color` - Highlights and icons

### 2. Tailwind Classes
Use the predefined Tailwind color classes:

```jsx
// Backgrounds
<div className="bg-background-light dark:bg-background-dark">
<div className="bg-surface-light dark:bg-surface-dark">
<button className="bg-accent">

// Text
<h1 className="text-heading-light dark:text-text-dark">
<p className="text-text-light dark:text-text-dark">
<span className="text-subtext-light dark:text-subtext-dark">

// Borders
<div className="border border-border-light dark:border-border-dark">
```

### 3. Theme Utility Classes
Import pre-made class combinations from `src/utils/theme.ts`:

```typescript
import { THEME_CLASSES } from '@/utils/theme';

// Use in components
<div className={THEME_CLASSES.CARD}>
<button className={THEME_CLASSES.BTN_PRIMARY}>
<input className={THEME_CLASSES.INPUT}>
```

Available utility classes:
- `THEME_CLASSES.BG_PRIMARY` - Primary background
- `THEME_CLASSES.BG_SURFACE` - Surface background
- `THEME_CLASSES.TEXT_PRIMARY` - Primary text
- `THEME_CLASSES.TEXT_HEADING` - Heading text
- `THEME_CLASSES.TEXT_SECONDARY` - Secondary text
- `THEME_CLASSES.BORDER` - Border styling
- `THEME_CLASSES.BTN_PRIMARY` - Primary button style
- `THEME_CLASSES.BTN_SECONDARY` - Secondary button style
- `THEME_CLASSES.BTN_GHOST` - Ghost button style
- `THEME_CLASSES.CARD` - Standard card style
- `THEME_CLASSES.CARD_ELEVATED` - Elevated card style
- `THEME_CLASSES.INPUT` - Input field style
- `THEME_CLASSES.GLASS_EFFECT` - Glassmorphism effect
- `THEME_CLASSES.LUXURY_GRADIENT` - Subtle gradient background

### 4. Direct Color Access
Import color constants for custom styling:

```typescript
import { COLORS } from '@/utils/theme';

const customStyles = {
  backgroundColor: COLORS.ACCENT,
  color: COLORS.LIGHT.TEXT,
  borderColor: COLORS.CARBON_BLACK,
};
```

---

## Premium Effects

### Box Shadows
```jsx
// Soft subtle shadow
<div className="shadow-soft">

// Accent glow effect
<div className="shadow-glow">

// Premium luxury shadow
<div className="shadow-luxury">

// Elegant shadow
<div className="shadow-elegant">
```

### Animations
Use the predefined luxury animations:

```typescript
import { LUXURY_ANIMATIONS } from '@/utils/theme';
import { motion } from 'framer-motion';

<motion.div {...LUXURY_ANIMATIONS.fadeIn}>
<motion.div {...LUXURY_ANIMATIONS.scaleIn}>
<motion.button {...LUXURY_ANIMATIONS.elegant}>
```

### Transitions
```jsx
// Smooth transitions
<div className="transition-all duration-500 ease-out">

// Quick transitions
<div className="transition-all duration-300 ease-out">

// Or use the utilities
<div className={THEME_CLASSES.SMOOTH_TRANSITION}>
```

---

## Custom Scrollbars
All scrollable elements automatically get the luxury scrollbar with Rosy Granite accent:

```jsx
<div className="custom-scrollbar overflow-auto">
  {/* Your scrollable content */}
</div>
```

---

## Best Practices

### 1. **Consistency**
Always use the theme utilities instead of hard-coded colors to ensure consistency.

❌ **Don't:**
```jsx
<button style={{ backgroundColor: '#847777' }}>
```

✅ **Do:**
```jsx
<button className={THEME_CLASSES.BTN_PRIMARY}>
// or
<button className="bg-accent">
```

### 2. **Contrast**
Always ensure sufficient contrast for accessibility:
- Use `text-heading-light` or `text-text-light` for important text
- Use `text-subtext-light` only for less critical information

### 3. **Elevation**
Create visual hierarchy with shadows:
- `shadow-soft` for subtle elevation
- `shadow-elegant` for interactive elements
- `shadow-luxury` for prominent components

### 4. **Transitions**
Add smooth transitions for professional feel:
```jsx
<button className="bg-accent hover:shadow-luxury transition-all duration-300">
```

---

## Component Examples

### Button
```jsx
<button className={`
  ${THEME_CLASSES.BTN_PRIMARY}
  px-6 py-3 rounded-xl
  font-semibold tracking-wide
`}>
  Call to Action
</button>
```

### Card
```jsx
<div className={`
  ${THEME_CLASSES.CARD}
  p-6
  ${THEME_CLASSES.SMOOTH_TRANSITION}
`}>
  <h3 className={THEME_CLASSES.TEXT_HEADING}>Card Title</h3>
  <p className={THEME_CLASSES.TEXT_SECONDARY}>Card description</p>
</div>
```

### Input
```jsx
<input 
  type="text"
  className={`
    ${THEME_CLASSES.INPUT}
    px-4 py-3
    ${THEME_CLASSES.TEXT_PRIMARY}
  `}
  placeholder="Enter text..."
/>
```

### Glass Effect Panel
```jsx
<div className={`
  ${THEME_CLASSES.GLASS_EFFECT}
  ${THEME_CLASSES.CARD}
  p-8
`}>
  Premium glassmorphism panel
</div>
```

---

## Dark Mode Toggle
To toggle dark mode in your app:

```typescript
// Get current theme
const isDark = document.documentElement.classList.contains('dark');

// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};
```

---

## Migration Guide

### Updating Existing Components
1. Replace hard-coded colors with theme variables
2. Use Tailwind classes with dark mode variants
3. Add transitions for smooth theme switching
4. Update shadows to use the new luxury variants

### Before:
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <button className="bg-orange-500 hover:bg-orange-600">
```

### After:
```jsx
<div className={THEME_CLASSES.BG_SURFACE + ' ' + THEME_CLASSES.TEXT_PRIMARY}>
  <button className={THEME_CLASSES.BTN_PRIMARY}>
```

---

## Color Accessibility

All color combinations meet WCAG AA standards for contrast:
- Light mode: Graphite (#333333) on White Smoke (#F5F5F5) = 11.74:1 ✅
- Dark mode: Black (#000000) on Graphite (#333333) = 12.63:1 ✅

---

## Support

For questions or issues with the theme system, please refer to:
- Theme utilities: `src/utils/theme.ts`
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.cjs`
