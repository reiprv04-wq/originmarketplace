# ORIGIN — Brand Guidelines
**"START HERE" — AI Asset Marketplace**

---

## 01. Brand Concept

| | |
|---|---|
| **Name** | ORIGIN |
| **Tagline** | START HERE |
| **Concept** | Zero = the starting point. ORIGIN is where builders, creators, and AI-native professionals begin — a marketplace born from nothing, building everything. |
| **Personality** | Sophisticated · Trustworthy · Precise · Forward-thinking · Editorial |
| **Tone** | Confident but not loud. Elegant but accessible. Technical but human. |

---

## 02. Logo

### Logo Elements
The ORIGIN logo consists of **3 components**:

```
[ Orbital Sphere Icon ]  |  ORIGIN
                            START HERE
```

1. **The Sphere Icon** — An interlocking orbital globe with curved band paths and small node dots at intersections. Represents: global connections, neural networks, orbits, "zero point" — the origin of everything.
2. **Vertical Divider** — A thin rule separating the icon from the wordmark. Represents precision and structure.
3. **ORIGIN Wordmark** — High-contrast display serif (Didot-style), commanding and editorial.
4. **"START HERE" Tagline** — Lightweight spaced-tracking sans-serif, understated and directional.

### Logo Clearspace
Always maintain a minimum clearspace equal to the height of the **"O"** in ORIGIN on all sides.

```
    ↕ [O height]
←→ [O height]  [  LOGO  ]  [O height] ←→
    ↕ [O height]
```

### Minimum Size
- **Digital**: 120px width minimum
- **Print**: 30mm width minimum

### Logo Versions

| Version | Background | Logo Color | Usage |
|---------|-----------|------------|-------|
| Primary | White / Light | Brand Charcoal `#3D3D3D` | Default — most contexts |
| Reversed | Dark / Black | Pure White `#FFFFFF` | Dark backgrounds, dark mode UI |
| Stamp | Any solid dark color | White | Product badges, icons |

### ❌ Logo Don'ts
- Do **NOT** recolor the logo in any color other than brand charcoal or white
- Do **NOT** stretch or distort the proportions
- Do **NOT** place on busy photographic backgrounds without an overlay
- Do **NOT** add drop shadows or effects to the logo
- Do **NOT** separate the icon from the wordmark (icon-only use requires special approval)
- Do **NOT** use the logo smaller than the minimum size

---

## 03. Color System

### Primary Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-charcoal` | **Brand Charcoal** | `#3D3D3D` | Logo color, primary text, primary UI elements |
| `--color-black` | **Origin Black** | `#1A1A1A` | Dark backgrounds, dark mode surfaces |
| `--color-white` | **Pure White** | `#FFFFFF` | Light backgrounds, reversed logo, text on dark |

### Accent Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-atlas` | **Atlas Blue** | `#1E3A5F` | Primary CTAs, links, interactive elements |
| `--color-meridian` | **Meridian Gold** | `#C9A84C` | Premium badges, highlights, creator tier indicators |
| `--color-steel` | **Pale Steel** | `#E8EAF0` | Secondary surfaces, card backgrounds, dividers |

### Functional Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-success` | Success Green | `#2D6A4F` | Verified, published, confirmed states |
| `--color-warning` | Amber | `#B45309` | Pending review, draft states |
| `--color-error` | Deep Red | `#991B1B` | Errors, destructive actions |
| `--color-info` | Steel Blue | `#1D4ED8` | Informational notices |

### Color Ratios (Light Mode)
```
Page background:    Pure White    #FFFFFF
Card surface:       Pale Steel    #E8EAF0
Text primary:       Brand Charcoal #3D3D3D
Text secondary:     #6B7280
Borders:            #D1D5DB
CTA / Links:        Atlas Blue    #1E3A5F
Hover state:        #2d4e78 (Atlas Blue +10% lightness)
Active/pressed:     #162c47 (Atlas Blue -10%)
Premium highlight:  Meridian Gold #C9A84C
```

### Color Ratios (Dark Mode)
```
Page background:    Origin Black  #1A1A1A
Card surface:       #242424
Text primary:       Pure White    #FFFFFF
Text secondary:     #9CA3AF
Borders:            #374151
CTA / Links:        #4A90D9 (Atlas Blue lighter for dark)
Premium highlight:  Meridian Gold #C9A84C
```

---

## 04. Typography

### Font Stack

#### Display / Wordmark
**Cormorant Garamond** — High-contrast editorial serif. Used for the logo wordmark, hero headlines, and large display text.
- Google Fonts: `Cormorant Garamond` (weights: 300, 400, 600, 700)
- Fallback: `Georgia, "Times New Roman", serif`

```css
font-family: 'Cormorant Garamond', Georgia, serif;
```

#### UI / Body
**Inter** — Clean, legible neo-grotesque. Used for all UI text, navigation, body copy, captions.
- Google Fonts: `Inter` (weights: 400, 500, 600, 700)
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale

| Role | Font | Size | Weight | Line Height | Tracking |
|------|------|------|--------|-------------|---------|
| Hero Display | Cormorant Garamond | 72–96px | 600 | 1.1 | -0.02em |
| H1 | Cormorant Garamond | 48px | 600 | 1.15 | -0.01em |
| H2 | Cormorant Garamond | 36px | 600 | 1.2 | -0.01em |
| H3 | Inter | 24px | 600 | 1.3 | 0 |
| H4 | Inter | 20px | 600 | 1.4 | 0 |
| Body Large | Inter | 18px | 400 | 1.6 | 0 |
| Body | Inter | 16px | 400 | 1.65 | 0 |
| Body Small | Inter | 14px | 400 | 1.5 | 0 |
| Label / Tag | Inter | 12px | 500 | 1.4 | +0.08em |
| Tagline (START HERE) | Inter | 12–14px | 300–400 | 1.4 | +0.25em |
| All-caps UI | Inter | 11–12px | 500 | 1.4 | +0.15em |

---

## 05. Spacing & Grid

```
Base unit: 8px

Spacing scale:
  xs:  4px   (0.5 × base)
  sm:  8px   (1 × base)
  md:  16px  (2 × base)
  lg:  24px  (3 × base)
  xl:  32px  (4 × base)
  2xl: 48px  (6 × base)
  3xl: 64px  (8 × base)
  4xl: 96px  (12 × base)

Grid:
  Desktop: 12-column, 1280px max-width, 24px gutters
  Tablet:  8-column, 768px, 16px gutters
  Mobile:  4-column, full-width, 16px gutters
```

---

## 06. Iconography & Illustration Style

- **Icon library**: Phosphor Icons or Lucide (stroke, not filled — matches the logo's line-work aesthetic)
- **Icon stroke width**: 1.5px — consistent with the logo sphere's line weight
- **Icon style**: Outline/stroke, never solid filled (except small status indicators)
- **Illustration**: Geometric, line-based — inspired by the orbital sphere's interlocking bands. No bubbly/cartoon style.

---

## 07. Motion & Animation

- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` — smooth material ease
- **Durations**:
  - Micro (hover, focus): 150ms
  - Transitions (page elements): 250ms
  - Entrances (modals, cards): 350ms
  - Loading states: 600ms
- **Logo animation** (if animated): The orbital sphere rings rotate at different speeds in opposing directions — like a gyroscope. Subtle, never distracting.

---

## 08. UI Component Style

### Cards
```
Background: #FFFFFF (light) / #242424 (dark)
Border: 1px solid #E5E7EB (light) / 1px solid #374151 (dark)
Border radius: 12px
Shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)
Hover: shadow becomes 0 4px 16px rgba(0,0,0,0.12), translateY(-2px)
```

### Buttons
```
Primary CTA:
  Background: #1E3A5F (Atlas Blue)
  Text: #FFFFFF, Inter 14px, weight 600
  Padding: 12px 24px
  Border radius: 8px
  Hover: #2d4e78

Secondary / Outlined:
  Border: 1px solid #3D3D3D
  Text: #3D3D3D, Inter 14px, weight 500
  Background: transparent
  Hover: background #F9FAFB

Premium CTA:
  Background: linear-gradient(135deg, #1E3A5F, #3D3D3D)
  Accent: #C9A84C (gold border or icon accent)
```

### Badges
```
NEW:     background #1E3A5F, text white
HOT/人気: background #3D3D3D, text white
FREE:    background #2D6A4F, text white
PREMIUM: background linear-gradient(#C9A84C, #a8862e), text white
SALE:    background #991B1B, text white
```

---

## 09. Photography & Visual Style

- **Preferred imagery tone**: Clean, minimal, professional. Tool screenshots, clean workspaces, abstract geometric forms.
- **Avoid**: Stock-photo clichés, handshake photos, generic laptop shots.
- **Color treatment**: Slightly desaturated, cool-toned. Can overlay a very light charcoal tint (`rgba(61,61,61,0.05)`) for cohesion.

---

## 10. Voice & Tone

| Situation | Tone | Example |
|-----------|------|---------|
| Hero copy | Bold, direct, declarative | "Build from zero. Start here." |
| CTA labels | Action-oriented, short | "Explore Assets" / "Start Selling" |
| Product descriptions | Precise, benefit-first | "Eliminate 20+ hours of repetitive setup" |
| Error messages | Calm, helpful | "Something went wrong — let's fix it." |
| Success moments | Warm, brief | "You're in. Let's build something." |
| Email subject lines | Intriguing, specific | "New: 14 Notion templates for your sales team" |

---

## 11. Naming Conventions

| Context | Format | Example |
|---------|--------|---------|
| Product/asset | Title Case | "Sales CRM Notion Template" |
| Categories | Title Case | "Workflow Automation" |
| Feature labels | Sentence case | "Add to cart" |
| Status badges | ALL CAPS | "PUBLISHED" / "DRAFT" |
| Creator tiers | Title Case | "Certified Creator" / "Top Creator" |

---

## 12. Brand Application: Website

| Section | Typography | Color Notes |
|---------|-----------|-------------|
| Header/Nav | Inter 14px, weight 500 | White BG, Charcoal text, Atlas Blue CTA |
| Hero Headline | Cormorant Garamond 72px, weight 600 | Charcoal on white |
| Category Tabs | Inter 13px, weight 500, tracked | Pill-style, Charcoal active state |
| Asset Cards | Inter 14px body, Cormorant for price | White card, Charcoal text, Gold premium badge |
| CTA Sections | Cormorant Garamond headline + Inter body | Atlas Blue background with white text |
| Footer | Inter 13px | Dark Charcoal / Origin Black background |
