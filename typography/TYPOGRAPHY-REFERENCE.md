# Onyx Report - Typography Quick Reference

## Font Stack

### Primary UI Font (Inter)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
**Usage:** Body text, headings, UI elements, form fields

### Display Font (Plus Jakarta Sans)
```css
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
```
**Usage:** Marketing headlines, hero sections, landing pages

### Monospace Font (JetBrains Mono)
```css
font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
```
**Usage:** Code, data values, FCI percentages, tabular data

---

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
```

---

## Type Scale (1.250 Major Third)

| Token      | Size  | Rem      | Px   |
|------------|-------|----------|------|
| text-xs    | 0.75  | 0.75rem  | 12px |
| text-sm    | 0.875 | 0.875rem | 14px |
| text-base  | 1     | 1rem     | 16px |
| text-lg    | 1.125 | 1.125rem | 18px |
| text-xl    | 1.25  | 1.25rem  | 20px |
| text-2xl   | 1.5   | 1.5rem   | 24px |
| text-3xl   | 1.875 | 1.875rem | 30px |
| text-4xl   | 2.25  | 2.25rem  | 36px |
| text-5xl   | 3     | 3rem     | 48px |
| text-6xl   | 3.75  | 3.75rem  | 60px |
| text-7xl   | 4.5   | 4.5rem   | 72px |

---

## Font Weights

| Weight    | Value | Usage                    |
|-----------|-------|--------------------------|
| Normal    | 400   | Body text                |
| Medium    | 500   | Labels, emphasis         |
| Semibold  | 600   | Headings, buttons        |
| Bold      | 700   | Strong emphasis          |
| Extrabold | 800   | Display headlines        |

---

## Display Typography (Plus Jakarta Sans)

| Class       | Size | Weight   | Line Height | Letter Spacing |
|-------------|------|----------|-------------|----------------|
| display-2xl | 72px | Extrabold| 1.0         | -0.03em        |
| display-xl  | 60px | Extrabold| 1.1         | -0.02em        |
| display-lg  | 48px | Bold     | 1.15        | -0.02em        |
| display-md  | 36px | Bold     | 1.2         | -0.015em       |
| display-sm  | 30px | Bold     | 1.25        | -0.01em        |

---

## Heading Typography (Inter)

| Element | Size | Weight   | Line Height | Letter Spacing |
|---------|------|----------|-------------|----------------|
| h1      | 30px | Semibold | 1.25        | -0.01em        |
| h2      | 24px | Semibold | 1.25        | -0.01em        |
| h3      | 20px | Semibold | 1.25        | 0              |
| h4      | 18px | Semibold | 1.5         | 0              |
| h5      | 16px | Semibold | 1.5         | 0              |
| h6      | 14px | Semibold | 1.5         | 0.025em + CAPS |

---

## Body Typography

| Class   | Size | Weight | Line Height |
|---------|------|--------|-------------|
| body-xl | 20px | Normal | 1.625       |
| body-lg | 18px | Normal | 1.625       |
| body-md | 16px | Normal | 1.5         |
| body-sm | 14px | Normal | 1.5         |
| body-xs | 12px | Normal | 1.5         |

---

## Special Styles

### Lead Paragraph
```css
.lead {
  font-size: 1.25rem;      /* 20px */
  font-weight: 400;
  line-height: 1.625;
  color: var(--slate-600);
}
```

### Overline / Category
```css
.overline {
  font-size: 0.75rem;      /* 12px */
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--slate-500);
}
```

### Caption
```css
.caption {
  font-size: 0.75rem;      /* 12px */
  font-weight: 500;
  line-height: 1.5;
  color: var(--slate-500);
}
```

### Label
```css
.label {
  font-size: 0.875rem;     /* 14px */
  font-weight: 500;
  line-height: 1.5;
  color: var(--slate-700);
}
```

---

## Data & FCI Display (JetBrains Mono)

### Data Values
```css
.data-value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.data-value-lg { font-size: 48px; font-weight: 700; }
.data-value-md { font-size: 36px; font-weight: 600; }
.data-value-sm { font-size: 24px; font-weight: 600; }
```

### FCI Percentage
```css
.fci-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

### FCI Colors

| Condition | Range   | Color   | Hex     |
|-----------|---------|---------|---------|
| Good      | 0-5%    | Emerald | #10B981 |
| Fair      | 5-10%   | Amber   | #F59E0B |
| Poor      | 10-30%  | Orange  | #F97316 |
| Critical  | 30%+    | Red     | #EF4444 |

---

## Code Typography

### Inline Code
```css
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875em;
  background: var(--slate-100);
  padding: 0.125em 0.375em;
  border-radius: 0.25rem;
}
```

### Code Block
```css
pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.625;
  background: var(--slate-900);
  color: var(--slate-100);
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
}
```

---

## Line Heights

| Token          | Value  | Usage                      |
|----------------|--------|----------------------------|
| leading-none   | 1      | Display headlines          |
| leading-tight  | 1.15   | Large display              |
| leading-snug   | 1.25   | Headings                   |
| leading-normal | 1.5    | Body text (default)        |
| leading-relaxed| 1.625  | Lead paragraphs, body-lg   |
| leading-loose  | 2      | Spacious paragraphs        |

---

## Letter Spacing

| Token             | Value    | Usage              |
|-------------------|----------|--------------------|
| tracking-tightest | -0.03em  | Display 2XL        |
| tracking-tighter  | -0.02em  | Display headlines  |
| tracking-tight    | -0.01em  | h1, h2             |
| tracking-normal   | 0        | Body text          |
| tracking-wide     | 0.025em  | h6, badges         |
| tracking-wider    | 0.05em   | Overlines          |
| tracking-widest   | 0.1em    | Special labels     |

---

## Text Colors

| Class          | Light Mode | Dark Mode  |
|----------------|------------|------------|
| text-primary   | slate-900  | slate-50   |
| text-secondary | slate-700  | slate-300  |
| text-muted     | slate-500  | slate-400  |
| text-subtle    | slate-400  | slate-500  |
| text-brand     | blue-600   | blue-400   |
| text-success   | emerald-500| emerald-500|
| text-warning   | amber-500  | amber-500  |
| text-error     | red-500    | red-500    |

---

## Responsive Adjustments

### Mobile (< 640px)
- display-2xl → 36px
- display-xl → 30px
- display-lg → 24px
- h1 → 24px
- h2 → 20px
- data-value-lg → 30px

### Tablet (641px - 1024px)
- display-2xl → 48px
- display-xl → 36px

---

## Files Included

| File                        | Purpose                          |
|-----------------------------|----------------------------------|
| `onyx-typography.css`       | Complete CSS system              |
| `OnyxTypography.jsx`        | React component library          |
| `OnyxTypographySpecimen.jsx`| Interactive preview component    |
| `TYPOGRAPHY-REFERENCE.md`   | This quick reference             |

---

## Usage Examples

### React Components
```jsx
import { Display, Heading, Text, FCIValue } from './OnyxTypography';

<Display size="xl">Portfolio Overview</Display>
<Heading level={2}>Branch Summary</Heading>
<Text size="md" color="secondary">Building details...</Text>
<FCIValue value={7.8} size="lg" />
```

### CSS Classes
```html
<h1 class="display-xl">Hero Headline</h1>
<h2 class="h2">Section Title</h2>
<p class="body-md text-secondary">Paragraph text</p>
<span class="data-value fci-good">3.2%</span>
```
