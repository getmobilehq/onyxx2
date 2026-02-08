# Onyx Report - Brand Integration Summary

## 🎨 Brand Overview

**Onyx Report** uses a professional, modern design system centered around **blue tones** with strategic use of semantic colors for data visualization and FCI condition indicators.

---

## Color Palette

### Primary Color - Onyx Blue
A vibrant blue palette for brand identity and primary actions.

| Shade | Hex       | Use Case                           |
|-------|-----------|-------------------------------------|
| 50    | `#EFF6FF` | Lightest background, hover states  |
| 100   | `#DBEAFE` | Light backgrounds                  |
| 200   | `#BFDBFE` | Border, dividers                   |
| 300   | `#93C5FD` | Disabled states                    |
| 400   | `#60A5FA` | Hover, focus                       |
| **500**| **`#3B82F6`** | **Primary brand color**      |
| **600**| **`#2563EB`** | **Primary buttons, links**   |
| 700   | `#1D4ED8` | Active states, pressed             |
| 800   | `#1E40AF` | Dark backgrounds                   |
| 900   | `#1E3A8A` | Darkest, high contrast             |

### Neutral - Slate
For text, backgrounds, and UI elements.

| Shade | Hex       | Use Case                    |
|-------|-----------|------------------------------|
| 50    | `#F8FAFC` | Page background (light mode) |
| 100   | `#F1F5F9` | Card background              |
| 200   | `#E2E8F0` | Borders                      |
| 300   | `#CBD5E1` | Subtle borders               |
| 400   | `#94A3B8` | Placeholder text             |
| 500   | `#64748B` | Muted text                   |
| 600   | `#475569` | Secondary text               |
| 700   | `#334155` | Primary text (dark mode)     |
| 800   | `#1E293B` | Dark backgrounds             |
| 900   | `#0F172A` | Darkest, primary text        |

### Semantic Colors

| Type    | Shade | Hex       | Use Case                       |
|---------|-------|-----------|--------------------------------|
| Success | 500   | `#22C55E` | Success messages, FCI Good     |
| Warning | 500   | `#F59E0B` | Warnings, FCI Fair             |
| Error   | 500   | `#EF4444` | Errors, FCI Critical           |
| Info    | 500   | `#06B6D4` | Info messages                  |

### FCI Condition Scale (Special!)

**This is unique to Onyx Report** for displaying building condition:

| Condition | Range   | Color     | Hex       | Background |
|-----------|---------|-----------|-----------|------------|
| **Good**      | 0-5%    | Emerald   | `#10B981` | `#ECFDF5`  |
| **Fair**      | 5-10%   | Amber     | `#F59E0B` | `#FFFBEB`  |
| **Poor**      | 10-30%  | Orange    | `#F97316` | `#FFF7ED`  |
| **Critical**  | 30%+    | Red       | `#EF4444` | `#FEF2F2`  |

### Chart Colors (Data Visualization)

| Chart | Hex       | Usage                    |
|-------|-----------|--------------------------|
| 1     | `#3B82F6` | Primary data series      |
| 2     | `#10B981` | Secondary, success       |
| 3     | `#8B5CF6` | Purple accent            |
| 4     | `#F59E0B` | Warning, highlights      |
| 5     | `#F43F5E` | Critical, alerts         |
| 6     | `#06B6D4` | Cyan, info               |

---

## Typography

### Font Stack

**Primary UI Font: Inter**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
- Use for: Body text, headings, UI elements, forms
- Weights: 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)

**Display Font: Plus Jakarta Sans**
```css
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
```
- Use for: Marketing headlines, hero sections, landing pages
- Weights: 500, 600, 700, 800

**Monospace: JetBrains Mono**
```css
font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
```
- Use for: Code, FCI percentages, data values, tabular numbers
- Weights: 400, 500, 600

### Type Scale

| Size    | Rem      | Pixels | Usage                           |
|---------|----------|--------|---------------------------------|
| text-xs | 0.75rem  | 12px   | Captions, labels                |
| text-sm | 0.875rem | 14px   | Small text, form help           |
| text-base | 1rem   | 16px   | Body text (default)             |
| text-lg | 1.125rem | 18px   | Large body, lead                |
| text-xl | 1.25rem  | 20px   | Subheadings                     |
| text-2xl | 1.5rem  | 24px   | H3                              |
| text-3xl | 1.875rem | 30px  | H2, H1                          |
| text-4xl | 2.25rem | 36px  | Page titles                     |
| text-5xl | 3rem    | 48px   | Display MD                      |
| text-6xl | 3.75rem | 60px  | Display LG                      |

### Heading Styles (Inter)

| Element | Size | Weight   | Letter Spacing |
|---------|------|----------|----------------|
| H1      | 30px | Semibold | -0.01em        |
| H2      | 24px | Semibold | -0.01em        |
| H3      | 20px | Semibold | 0              |
| H4      | 18px | Semibold | 0              |
| H5      | 16px | Semibold | 0              |
| H6      | 14px | Semibold | 0.025em + CAPS |

---

## Logo Assets

All logos available in `/brand` directory:

| File                      | Usage                                    |
|---------------------------|------------------------------------------|
| `logo-full-color.svg`     | Primary logo (light backgrounds)        |
| `logo-full-dark.svg`      | Logo on light backgrounds (dark text)   |
| `logo-full-white.svg`     | Logo on dark backgrounds                |
| `logo-mark-color.svg`     | App icon, favicon                       |
| `logo-stacked-color.svg`  | Stacked layout version                  |
| `wordmark-color.svg`      | "ONYX REPORT" text only                 |
| `app-icon-512.svg`        | 512x512 app icon                        |
| `favicon.svg`             | Website favicon                         |

### Logo Usage Guidelines

✅ **DO:**
- Use logo-full-color.svg on white/light backgrounds
- Use logo-full-white.svg on dark backgrounds (slate-900, onyx-700+)
- Maintain aspect ratio
- Give adequate white space around logo (minimum 24px padding)

❌ **DON'T:**
- Stretch or distort
- Change colors
- Add effects (shadows, gradients)
- Place on busy backgrounds

---

## Icons & Illustrations

### Role Icons
Visual indicators for user roles:
- `role-org-admin.svg` - Organization Administrator
- `role-branch-manager.svg` - Branch Manager
- `role-assessor.svg` - Assessor
- `role-viewer.svg` - Viewer

### FCI Condition Icons
Visual indicators for building conditions:
- `fci-good.svg` - Green checkmark circle (0-5%)
- `fci-fair.svg` - Yellow alert circle (5-10%)
- `fci-poor.svg` - Orange warning circle (10-30%)
- `fci-critical.svg` - Red error circle (30%+)

### UI Elements
- `spinner.svg` - Loading spinner
- `icon-diamond-color.svg` - Brand diamond mark

---

## Spacing System

Following 8px grid system:

| Token | Rem     | Pixels | Usage                    |
|-------|---------|--------|--------------------------|
| 1     | 0.25rem | 4px    | Tight spacing            |
| 2     | 0.5rem  | 8px    | Small gaps               |
| 3     | 0.75rem | 12px   | Form field spacing       |
| 4     | 1rem    | 16px   | Standard spacing         |
| 5     | 1.25rem | 20px   | Medium gaps              |
| 6     | 1.5rem  | 24px   | Section spacing          |
| 8     | 2rem    | 32px   | Large gaps               |
| 10    | 2.5rem  | 40px   | XL spacing               |
| 12    | 3rem    | 48px   | XXL spacing              |
| 16    | 4rem    | 64px   | Page sections            |

---

## Border Radius

Rounded corners for modern UI:

| Token | Size    | Usage                          |
|-------|---------|--------------------------------|
| sm    | 4px     | Badges, small buttons          |
| md    | 6px     | Default (buttons, inputs)      |
| lg    | 8px     | Cards, containers              |
| xl    | 12px    | Modals, large cards            |
| 2xl   | 16px    | Feature cards                  |
| 3xl   | 24px    | Hero sections                  |
| full  | 9999px  | Pills, avatars                 |

**Default:** Use `md` (6px) for most UI elements

---

## Shadows

Subtle elevation system:

| Token   | Usage                           |
|---------|---------------------------------|
| sm      | Hover states, subtle elevation  |
| md      | Cards, dropdown menus           |
| lg      | Modals, popovers                |
| xl      | Sheets, drawers                 |
| 2xl     | Hero sections                   |

**Special Colored Shadows:**
- `shadow-primary` - Blue glow for primary actions
- `shadow-success` - Green glow for success states
- `shadow-error` - Red glow for error states

---

## Animations & Transitions

### Transition Durations
- **Fast**: 150ms - Hover, focus
- **Base**: 200ms - Default (recommended)
- **Slow**: 300ms - Modal open/close
- **Slower**: 500ms - Page transitions

### Built-in Animations
- `fade-in` - 300ms fade in
- `fade-in-up` - 400ms fade in with upward movement
- `slide-in-right` - 300ms slide from left
- `scale-in` - 200ms scale from 95% to 100%
- `pulse-slow` - 3s infinite pulse

---

## React Components Available

From `OnyxIcons.jsx`:

```jsx
import {
  OnyxLogo,      // Full logo with variants
  OnyxMark,      // Logo mark only
  OnyxWordmark,  // "ONYX REPORT" text
  FCIGood,       // Good condition icon
  FCIFair,       // Fair condition icon
  FCIPoor,       // Poor condition icon
  FCICritical,   // Critical condition icon
  RoleOrgAdmin,  // Org admin icon
  RoleBranchManager,  // Branch manager icon
  RoleAssessor,  // Assessor icon
  RoleViewer,    // Viewer icon
} from './OnyxIcons';
```

**Usage Example:**
```jsx
<OnyxLogo variant="color" width={200} />
<OnyxMark size={48} variant="white" />
<FCIGood size={24} />
```

---

## Tailwind Configuration

The brand includes a complete `tailwind.config.js` with:

✅ All brand colors configured
✅ Typography scale and fonts
✅ Custom FCI utility classes
✅ Spacing, shadows, animations
✅ Dark mode support
✅ Chart color palette

**Just copy to your project and you're ready!**

---

## CSS Custom Properties

All tokens available as CSS variables in `onyx-tokens.css`:

```css
var(--onyx-primary-600)      /* Primary blue */
var(--onyx-fci-good)         /* FCI good color */
var(--onyx-font-sans)        /* Inter font */
var(--onyx-space-4)          /* 16px spacing */
var(--onyx-radius-md)        /* 6px border radius */
var(--onyx-shadow-md)        /* Medium shadow */
```

---

## Design Tokens Summary

| Category    | Count | Key Items                                 |
|-------------|-------|-------------------------------------------|
| Colors      | 50+   | Onyx Blue, Slate, Semantic, FCI, Charts   |
| Typography  | 3     | Inter, Plus Jakarta Sans, JetBrains Mono  |
| Type Sizes  | 12    | xs to 7xl                                 |
| Spacing     | 13    | 0 to 24 (4px to 96px)                     |
| Shadows     | 8     | sm to 2xl + colored variants              |
| Radii       | 7     | sm to full                                |
| Animations  | 5     | Fade, slide, scale, pulse                 |
| Icons       | 10+   | Logos, FCI, roles, UI                     |

---

## Quick Start Checklist

Frontend integration steps:

- [ ] Copy `/brand` assets to `apps/web/public/brand/`
- [ ] Copy `tailwind.config.js` to `apps/web/`
- [ ] Copy `onyx-tokens.css` to `apps/web/src/styles/`
- [ ] Copy `onyx-typography.css` to `apps/web/src/styles/`
- [ ] Copy `OnyxIcons.jsx` to `apps/web/src/components/brand/`
- [ ] Add Google Fonts link to `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  ```
- [ ] Import tokens in main CSS:
  ```css
  @import './styles/onyx-tokens.css';
  @import './styles/onyx-typography.css';
  ```

---

## Brand Personality

**Professional** • **Modern** • **Data-Driven** • **Trustworthy**

The Onyx Report brand conveys:
- **Professionalism**: Clean, structured layouts
- **Clarity**: Easy-to-read typography, clear hierarchy
- **Precision**: Monospace for data, exact measurements
- **Reliability**: Consistent color coding (FCI scale)
- **Sophistication**: Subtle animations, refined shadows

---

## Files Reference

| File                           | Size  | Purpose                       |
|--------------------------------|-------|-------------------------------|
| `onyx-tokens.css`              | 7.5KB | All CSS custom properties     |
| `onyx-typography.css`          | 19KB  | Complete typography system    |
| `tailwind.config.js`           | 5.8KB | Tailwind configuration        |
| `OnyxIcons.jsx`                | 11KB  | React icon components         |
| `OnyxTypography.jsx`           | 16KB  | React typography components   |
| `OnyxTypographySpecimen.jsx`   | 31KB  | Interactive preview           |
| `TYPOGRAPHY-REFERENCE.md`      | 7.8KB | Quick reference guide         |

**Total**: All assets and documentation ready for immediate use!

---

✨ **Your brand system is production-ready!**
