# CSS Highlighted Text Effect with Gradient

**Source:** [CodePen - vii120](https://codepen.io/vii120/pen/KwMBaaY)  
**Inspiration:** [Artur Bien on X/Twitter](https://x.com/artur_bien/status/2017600547650408843)  
**Tech Stack:** Pure CSS (SCSS), Google Fonts

---

## Description

A realistic hand-drawn marker/highlighter text effect achieved purely with CSS gradients. The effect creates organic-looking highlighted text that mimics real marker strokes with imperfect edges, varying opacity, and slight rotation/skew.

### Visual Result
Three text lines with different colored highlights:
- **Yellow**: Large, rotated highlight with skew
- **Green**: Smaller, skewed highlight
- **Pink/Red**: Medium-sized highlight with slight rotation

---

## Key Technical Features

### 1. Conic Gradient for Corner Detail

The secret sauce is combining conic gradients with linear gradients to create the marker tip effect:

```scss
.text:before {
  background: 
    // Left corner marker tip effect
    conic-gradient(
      at 0 100%, 
      rgb(var(--mark-color) / 100%) 1%, 
      #fff0 3%
    ) no-repeat 0 0 / auto 120%,
    
    // Right corner marker tip effect
    conic-gradient(
      from 180deg at 100% 0, 
      #fff0, 
      rgb(var(--mark-color) / 100%) 1%, 
      #fff0 4%
    ) no-repeat 100% 100% / auto 120%,
    
    // Main body gradient with varying opacity
    linear-gradient(
      var(--mark-bg-angle), 
      rgb(var(--mark-color) / 60%), 
      rgb(var(--mark-color) / 20%) 75%, 
      rgb(var(--mark-color) / 55%)
    ) no-repeat center / auto;
}
```

**Why it works:**
- Conic gradients at corners create the fading marker stroke effect
- The sharp cutoff (1% to 3% or 4%) simulates a marker running out of ink
- Layered approach: corners first, then main body

### 2. RGB Color Variables with Alpha

Using RGB format in CSS variables enables flexible opacity:

```scss
--mark-color: 255 232 62;  // Yellow as R G B
// Usage with different opacities:
rgb(var(--mark-color) / 60%)  // 60% opacity
rgb(var(--mark-color) / 20%)  // 20% opacity
rgb(var(--mark-color) / 100%) // 100% opacity
```

**Benefits:**
- Single variable controls all opacity variants
- Easy to adjust overall color
- Clean, modern CSS syntax

### 3. Organic Transformations

Each highlight variant has unique transforms to look hand-drawn:

```scss
// Yellow - Big and bold
.yellow-mark:before {
  rotate: 1deg;           // Slight rotation
  scale: 1.1;             // Larger than text
  transform: skew(-5deg); // Organic imperfection
  --mark-color: 255 232 62;
  --mark-bg-angle: 50deg; // Gradient angle
}

// Green - Compact and tight
.green-mark:before {
  scale: 0.92;            // Smaller than text
  transform: skew(7deg);  // Opposite skew
  --mark-color: 91 233 92;
  --mark-bg-angle: 30deg;
}

// Pink - Subtle
.red-mark:before {
  rotate: 0.5deg;         // Very slight rotation
  transform: skew(5deg);
  --mark-color: 255 100 185;
  --mark-bg-angle: 150deg;
}
```

**Hand-drawn effect principles:**
- Slight rotations (0.5deg - 1deg) prevent perfect alignment
- Skew transforms create uneven edges
- Scale variations make each highlight unique
- Different gradient angles change lighting effect

### 4. Layer Architecture

```
.text (container)
├── Text content (highest z-index)
└── ::before pseudo-element
    ├── z-index: -1 (behind text)
    ├── position: absolute; inset: 0
    ├── border-radius: 3px 5px 3px 5px (organic corners)
    └── Multi-layer gradient background
```

### 5. Irregular Border Radius

```scss
border-radius: 3px 5px 3px 5px;
```

Creates asymmetric corners, preventing the "perfect box" look.

---

## Complete Code Reference

### HTML
```html
<div class="text yellow-mark">this is important</div>
<div class="text green-mark">wait, this is also important</div>
<div class="text red-mark">wow, almost forgot this</div>
```

### CSS/SCSS
```scss
@import url('https://fonts.googleapis.com/css2?family=Mansalva&display=swap');

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  color: #222;
  background-color: #ececec;
  font-family: "Mansalva", sans-serif;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
}

.text {
  width: fit-content;
  padding: 6px 12px;
  position: relative;
  font-size: 32px;
  font-weight: 600;
  user-select: none;
  text-align: center;
  white-space: nowrap;
  
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 3px 5px 3px 5px;
    background: 
      conic-gradient(at 0 100%, rgb(var(--mark-color) / 100%) 1% , #fff0 3%) no-repeat 0 0 / auto 120%,
      conic-gradient(from 180deg at 100% 0, #fff0, rgb(var(--mark-color) / 100%) 1%, #fff0 4%) no-repeat 100% 100% / auto 120%,
      linear-gradient(var(--mark-bg-angle), rgb(var(--mark-color) / 60%), rgb(var(--mark-color) / 20%) 75%, rgb(var(--mark-color) / 55%)) no-repeat center / auto;
  }
  
  &.yellow-mark:before {
    rotate: 1deg;
    scale: 1.1;
    transform: skew(-5deg);
    --mark-color: 255 232 62;
    --mark-bg-angle: 50deg;
  }
  
  &.green-mark:before {
    scale: 0.92;
    transform: skew(7deg);
    --mark-color: 91 233 92;
    --mark-bg-angle: 30deg;
  }
  
  &.red-mark:before {
    rotate: 0.5deg;
    transform: skew(5deg);
    --mark-color: 255 100 185;
    --mark-bg-angle: 150deg;
  }
}
```

---

## Color Palette

| Variant | RGB Values | Hex Approx. | Angle | Character |
|---------|-----------|---------------|-------|-----------|
| Yellow | 255 232 62 | #FFE83E | 50deg | Bold, energetic |
| Green | 91 233 92 | #5BE95C | 30deg | Fresh, positive |
| Pink/Red | 255 100 185 | #FF64B9 | 150deg | Attention, urgent |

---

## Animation Possibilities

While the original is static, this effect can be enhanced:

### 1. Draw-on Animation
```scss
.text:before {
  clip-path: inset(0 100% 0 0); // Start hidden
  animation: highlight-draw 0.6s ease-out forwards;
}

@keyframes highlight-draw {
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

### 2. Pulse Glow
```scss
.text:before {
  animation: highlight-pulse 2s ease-in-out infinite;
}

@keyframes highlight-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
```

### 3. Staggered Reveal (Multiple Lines)
```scss
.text {
  @for $i from 1 through 3 {
    &:nth-child(#{$i}):before {
      animation-delay: #{$i * 0.2}s;
    }
  }
}
```

---

## Browser Support

| Feature | Support |
|---------|---------|
| `conic-gradient()` | Chrome 69+, Firefox 83+, Safari 12.1+ |
| `rgb(r g b / a)` syntax | All modern browsers |
| `inset` property | Chrome 84+, Firefox 66+, Safari 14.1+ |
| `rotate`, `scale` properties | Chrome 104+, Firefox 103+, Safari 15.4+ |

**Fallback strategy:** Use `@supports` for older browsers:
```scss
@supports not (background: conic-gradient(red, blue)) {
  .text:before {
    background: linear-gradient(var(--mark-bg-angle), 
      rgb(var(--mark-color) / 60%), 
      rgb(var(--mark-color) / 20%)
    );
  }
}
```

---

## Use Cases

1. **Call-to-action buttons** - Highlight important text
2. **Quotes** - Emphasize key statements
3. **Pricing** - Highlight sale prices or features
4. **Navigation** - Show active/current page
5. **Form validation** - Mark required fields
6. **Educational content** - Highlight key terms

---

## Integration Notes

### With React/TypeScript
```tsx
interface HighlightProps {
  children: React.ReactNode;
  variant: 'yellow' | 'green' | 'pink';
  animate?: boolean;
}

export const Highlight: React.FC<HighlightProps> = ({ 
  children, 
  variant,
  animate = false 
}) => (
  <span className={`text ${variant}-mark ${animate ? 'animate' : ''}`}>
    {children}
  </span>
);
```

### Dark Mode Adaptation
```scss
@media (prefers-color-scheme: dark) {
  .text {
    color: #ececec;
    
    &:before {
      opacity: 0.7; // Slightly dim highlights
    }
  }
}
```

---

## Why This Effect Works

1. **Imperfection = Authenticity** - Real markers don't create perfect rectangles
2. **Layered Complexity** - Multiple gradient layers create depth
3. **Color Variation** - Opacity changes simulate marker pressure
4. **Context Appropriate** - Feels casual, hand-made, personal
5. **Performance** - Pure CSS, no images or JS overhead
