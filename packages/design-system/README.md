# @poultryco/design-system

PoultryCo's centralized design system containing colors, typography, spacing, and reusable components.

## Installation

This package is part of the PoultryCo monorepo and is automatically available to all apps.

## Usage

```typescript
import { colors, typography, spacing } from '@poultryco/design-system';

// Use colors
const primaryColor = colors.primary; // #2B7A4B

// Use typography
const headingSize = typography.fontSize.h1; // 24

// Use spacing
const padding = spacing.md; // 15
```

## Design Tokens

### Colors

- **Primary**: `#2B7A4B` (PoultryCo Green)
- **Secondary**: `#1E3A5F` (Deep Navy)
- **Accent**: `#E67E22` (Sunrise Orange)
- **Success**: `#27AE60`
- **Warning**: `#F39C12`
- **Error**: `#E74C3C`
- **Info**: `#3498DB`

### Typography

- **Font Sizes**: h1 (24), h2 (20), h3 (18), h4 (16), body (14), caption (13), small (12), tiny (11)
- **Font Weights**: regular (400), medium (500), semibold (600), bold (700)

### Spacing

- **Scale**: xs (5), sm (10), md (15), lg (20), xl (30), xxl (40), xxxl (60)
- **Border Radius**: sm (5), md (8), lg (10), xl (15), xxl (20), full (9999)
- **Icon Sizes**: small (20), medium (24), large (32), xlarge (40)
- **Avatar Sizes**: small (32), medium (50), large (80), xlarge (120)

## Components

Coming soon: Reusable UI components for the PoultryCo platform.

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint
```

