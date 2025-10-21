# PoultryCo Marketing Website - Design Guidelines

**Version:** 1.0  
**Date:** October 20, 2025  
**Reference:** Based on `poultryco_brand_guidelines.md`

---

## 🎨 Visual Design System

### Brand Colors

#### Primary Palette
```css
/* PoultryCo Green - Primary Brand Color */
--primary: #2B7A4B;
--primary-dark: #1E5435;
--primary-light: #3A9B5F;

/* Warm Cream - Background & Accents */
--cream: #F8F6F0;
--cream-dark: #E8E6E0;

/* Deep Navy - Professional Text */
--navy: #1E3A5F;
--navy-light: #2E4A6F;

/* Sunrise Orange - Action & Highlights */
--orange: #E67E22;
--orange-dark: #D36913;
--orange-light: #F08C3C;

/* Earth Brown - Supporting Elements */
--brown: #8D6E3B;
--brown-light: #A5845B;
```

#### Utility Colors
```css
/* Success */
--success: #27AE60;
--success-light: #2ECC71;
--success-bg: #E8F8F0;

/* Warning */
--warning: #F39C12;
--warning-light: #F1C40F;
--warning-bg: #FEF5E7;

/* Error */
--error: #E74C3C;
--error-light: #EC7063;
--error-bg: #FADBD8;

/* Info */
--info: #3498DB;
--info-light: #5DADE2;
--info-bg: #EBF5FB;

/* Neutral Gray */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

#### Color Usage Guidelines

**Primary Green (#2B7A4B):**
- Hero section backgrounds (gradients)
- Primary CTA buttons
- Active navigation states
- Links and interactive elements
- Progress bars and loaders
- Success states

**Orange (#E67E22):**
- Secondary CTAs
- Urgency elements (countdown timers)
- Highlights and accents
- Hover states
- Notification badges

**Cream (#F8F6F0):**
- Alternate section backgrounds
- Card backgrounds
- Subtle highlights
- Form field backgrounds

**Navy (#1E3A5F):**
- Body text
- Headings
- Professional content areas
- Footer background

---

## 📝 Typography

### Font Families

```css
/* Primary: Inter - UI and Body */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary: Poppins - Headlines and Brand */
--font-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Typography Scale

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Hierarchy

```css
/* H1 - Hero Headlines */
.h1 {
  font-family: var(--font-secondary);
  font-size: var(--text-5xl);    /* 48px */
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--navy);
}

/* H2 - Section Titles */
.h2 {
  font-family: var(--font-primary);
  font-size: var(--text-4xl);    /* 36px */
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--navy);
}

/* H3 - Subsection Headers */
.h3 {
  font-family: var(--font-primary);
  font-size: var(--text-2xl);    /* 24px */
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--navy);
}

/* H4 - Card/Component Headers */
.h4 {
  font-family: var(--font-primary);
  font-size: var(--text-xl);     /* 20px */
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--navy);
}

/* Body Large - Lead Paragraphs */
.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);     /* 18px */
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
}

/* Body - Standard Content */
.body {
  font-family: var(--font-primary);
  font-size: var(--text-base);   /* 16px */
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
}

/* Body Small - Supporting Text */
.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);     /* 14px */
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

/* Caption - Meta Information */
.caption {
  font-family: var(--font-primary);
  font-size: var(--text-xs);     /* 12px */
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}
```

### Responsive Typography

```css
/* Mobile (320px - 768px) */
@media (max-width: 768px) {
  .h1 { font-size: var(--text-4xl); }  /* 36px */
  .h2 { font-size: var(--text-3xl); }  /* 30px */
  .h3 { font-size: var(--text-xl); }   /* 20px */
  .body-large { font-size: var(--text-base); }
}
```

---

## 📐 Spacing & Layout

### Spacing Scale

```css
/* Base unit: 4px */
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;

/* Content max-width for readability */
--content-width: 65ch;  /* ~65 characters */
```

### Grid System

```css
/* Desktop Grid (12 columns) */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;  /* 24px */
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: 0 2rem;
}

/* Mobile Grid (4 columns) */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;  /* 16px */
    padding: 0 1.25rem;  /* 20px */
  }
}
```

### Section Spacing

```css
/* Vertical section spacing */
--section-padding-mobile: 4rem;    /* 64px */
--section-padding-tablet: 6rem;    /* 96px */
--section-padding-desktop: 8rem;   /* 128px */
```

---

## 🎯 Component Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.875rem 1.75rem;  /* 14px 28px */
  border-radius: 0.5rem;       /* 8px */
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--orange);
  color: white;
  /* Same sizing as primary */
}

.btn-secondary:hover {
  background: var(--orange-dark);
}
```

#### Outline Button
```css
.btn-outline {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  /* Same sizing as primary */
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--primary);
  /* Same sizing as primary */
}

.btn-ghost:hover {
  background: rgba(43, 122, 75, 0.1);
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 0.75rem;      /* 12px */
  padding: 1.5rem;             /* 24px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-feature {
  /* Feature card variant */
  border-top: 4px solid var(--primary);
}

.card-testimonial {
  /* Testimonial card variant */
  border-left: 4px solid var(--orange);
  font-style: italic;
}
```

### Forms

```css
/* Input Fields */
.input {
  width: 100%;
  padding: 0.875rem 1rem;      /* 14px 16px */
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;        /* 8px */
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(43, 122, 75, 0.1);
}

.input:error {
  border-color: var(--error);
}

/* Labels */
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Helper Text */
.helper-text {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-top: 0.25rem;
}

/* Error Text */
.error-text {
  font-size: var(--text-sm);
  color: var(--error);
  margin-top: 0.25rem;
}

/* Select Dropdown */
.select {
  /* Same as input with dropdown icon */
  appearance: none;
  background-image: url('data:image/svg+xml,...');
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  padding-right: 2.5rem;
}

/* Checkbox & Radio */
.checkbox,
.radio {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--primary);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;    /* 4px 12px */
  border-radius: 9999px;        /* Full rounded */
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-primary {
  background: var(--primary);
  color: white;
}

.badge-success {
  background: var(--success-bg);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
}
```

### Icons

```css
/* Icon sizing */
--icon-xs: 1rem;      /* 16px */
--icon-sm: 1.25rem;   /* 20px */
--icon-base: 1.5rem;  /* 24px */
--icon-lg: 2rem;      /* 32px */
--icon-xl: 3rem;      /* 48px */

.icon {
  width: var(--icon-base);
  height: var(--icon-base);
  stroke-width: 2px;
  color: currentColor;
}
```

---

## 🎨 Layout Patterns

### Hero Section

```
[Desktop Layout]
┌────────────────────────────────────────┐
│  60% Content        │  40% Image       │
│  ├─ Headline        │                  │
│  ├─ Subheadline     │  [Hero Image]    │
│  ├─ CTA Buttons     │                  │
│  └─ Trust Badges    │                  │
└────────────────────────────────────────┘

[Mobile Layout]
┌──────────────────┐
│    Content       │
│  ├─ Headline     │
│  ├─ Subheadline  │
│  └─ CTA Buttons  │
├──────────────────┤
│  [Hero Image]    │
└──────────────────┘

Spacing:
- Padding: 80px (desktop), 64px (mobile)
- Min-height: 600px (desktop), 500px (mobile)
```

### Feature Section (Alternating)

```
Section 1: Image Left
┌────────────────────────────────────────┐
│  [Image]  │  Content                   │
│           │  ├─ Icon + Title           │
│           │  ├─ Description            │
│           │  ├─ Bullet Points          │
│           │  └─ CTA                    │
└────────────────────────────────────────┘

Section 2: Content Left
┌────────────────────────────────────────┐
│  Content  │  [Image]                   │
└────────────────────────────────────────┘

Mobile: Always Content → Image stacked
```

### Grid Sections

```
3-Column Grid (Desktop)
┌───────┬───────┬───────┐
│ Card  │ Card  │ Card  │
└───────┴───────┴───────┘

2-Column Grid (Tablet)
┌───────┬───────┐
│ Card  │ Card  │
└───────┴───────┘

1-Column (Mobile)
┌───────┐
│ Card  │
├───────┤
│ Card  │
└───────┘
```

---

## 🎭 Animation & Transitions

### Timing Functions

```css
--ease-linear: cubic-bezier(0, 0, 1, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transition Durations

```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Common Animations

```css
/* Fade In On Scroll */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (for CTAs) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Scale on Hover */
.hover-scale:hover {
  transform: scale(1.02);
  transition: transform var(--duration-base) var(--ease-out);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small Mobile */
@media (min-width: 320px) { }

/* Mobile */
@media (min-width: 480px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1280px) { }

/* Extra Large */
@media (min-width: 1440px) { }
```

### Touch Targets (Mobile)

```css
/* Minimum touch target size */
--touch-target-min: 44px;

.btn-mobile {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}

/* Spacing between touch targets */
--touch-spacing-min: 8px;
```

---

## ♿ Accessibility

### Color Contrast

```
Minimum Contrast Ratios (WCAG AA):
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

All brand colors meet or exceed these requirements.
```

### Focus States

```css
/* Visible focus indicator */
*:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🖼️ Images

### Image Formats
- **Photos:** WebP with JPEG fallback
- **Logos:** SVG (preferred) or PNG
- **Icons:** SVG only

### Image Sizes
```
Hero Images:      1920x1080 (16:9)
Feature Images:   800x600 (4:3)
Thumbnails:       400x300 (4:3)
Profile Photos:   400x400 (1:1)
Logo:            400x100 (4:1)
```

### Optimization
- Compress images (80% quality)
- Use srcset for responsive images
- Lazy load below-the-fold images
- Alt text required for all images

---

## 🎯 Performance Guidelines

### Core Web Vitals Targets

```
LCP (Largest Contentful Paint):   < 2.5s
FID (First Input Delay):           < 100ms
CLS (Cumulative Layout Shift):     < 0.1
```

### Optimization Checklist
- [ ] Minify CSS/JS
- [ ] Enable compression (gzip/brotli)
- [ ] Use CDN for assets
- [ ] Implement caching strategy
- [ ] Optimize images
- [ ] Lazy load below-the-fold content
- [ ] Preload critical resources
- [ ] Remove unused CSS/JS

---

## 📚 Design Tokens (CSS Variables)

### Complete Token System

```css
:root {
  /* Colors */
  --primary: #2B7A4B;
  --primary-dark: #1E5435;
  --primary-light: #3A9B5F;
  
  /* ... (all colors from above) */
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-secondary: 'Poppins', sans-serif;
  
  /* ... (all typography from above) */
  
  /* Spacing */
  --space-0: 0;
  --space-1: 0.25rem;
  /* ... (all spacing from above) */
  
  /* Layout */
  --container-sm: 640px;
  /* ... (all containers from above) */
  
  /* Effects */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-base: 0.5rem;  /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;      /* 16px */
  --radius-xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

---

## 🎨 Dark Mode (Future)

```css
/* Dark mode tokens (for future implementation) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
    /* ... additional dark mode tokens */
  }
}
```

---

## 📝 Usage Examples

### Hero Section Example

```html
<section class="hero">
  <div class="container">
    <div class="grid grid-cols-12">
      <div class="col-span-7">
        <h1 class="h1">The Professional Network Built BY Poultry People</h1>
        <p class="body-large">Join 10,000+ professionals...</p>
        <div class="button-group">
          <button class="btn-primary">Get Early Access</button>
          <button class="btn-outline">Watch Demo</button>
        </div>
      </div>
      <div class="col-span-5">
        <img src="hero.jpg" alt="..." />
      </div>
    </div>
  </div>
</section>
```

---

## 📚 Related Documents

- `../brand/poultryco_brand_guidelines.md` - Complete brand bible
- `WEBSITE_STRUCTURE.md` - Site architecture
- `CONTENT_STRATEGY.md` - Content guidelines

---

**Status:** Ready for Implementation  
**Next Step:** Create Figma designs using these guidelines  
**Team:** PoultryCo Design Team

