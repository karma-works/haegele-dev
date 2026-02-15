# CSS Highlighted Text - Implementation Guide

## Quick Copy-Paste Version

### HTML
```html
<span class="highlight yellow">this is important</span>
<span class="highlight green">wait, this is also important</span>
<span class="highlight pink">wow, almost forgot this</span>
```

### CSS (Vanilla)
```css
@import url('https://fonts.googleapis.com/css2?family=Mansalva&display=swap');

.highlight {
  position: relative;
  padding: 0.2em 0.4em;
  font-family: "Mansalva", cursive;
  font-weight: 600;
  white-space: nowrap;
}

.highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  border-radius: 3px 5px 3px 5px;
  background: 
    conic-gradient(at 0 100%, var(--mark-solid) 1%, transparent 3%) no-repeat 0 0 / auto 120%,
    conic-gradient(from 180deg at 100% 0, transparent, var(--mark-solid) 1%, transparent 4%) no-repeat 100% 100% / auto 120%,
    linear-gradient(var(--mark-angle), var(--mark-light), var(--mark-dark) 75%, var(--mark-medium));
  transform: var(--mark-transform);
}

/* Yellow */
.highlight.yellow {
  --mark-color: 255, 232, 62;
  --mark-solid: rgba(var(--mark-color), 1);
  --mark-light: rgba(var(--mark-color), 0.6);
  --mark-medium: rgba(var(--mark-color), 0.55);
  --mark-dark: rgba(var(--mark-color), 0.2);
  --mark-angle: 50deg;
  --mark-transform: rotate(1deg) skew(-5deg) scale(1.1);
}

/* Green */
.highlight.green {
  --mark-color: 91, 233, 92;
  --mark-solid: rgba(var(--mark-color), 1);
  --mark-light: rgba(var(--mark-color), 0.6);
  --mark-medium: rgba(var(--mark-color), 0.55);
  --mark-dark: rgba(var(--mark-color), 0.2);
  --mark-angle: 30deg;
  --mark-transform: skew(7deg) scale(0.92);
}

/* Pink */
.highlight.pink {
  --mark-color: 255, 100, 185;
  --mark-solid: rgba(var(--mark-color), 1);
  --mark-light: rgba(var(--mark-color), 0.6);
  --mark-medium: rgba(var(--mark-color), 0.55);
  --mark-dark: rgba(var(--mark-color), 0.2);
  --mark-angle: 150deg;
  --mark-transform: rotate(0.5deg) skew(5deg);
}
```

---

## TypeScript Component

```tsx
import React from 'react';
import './Highlight.css';

type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue' | 'purple';

interface HighlightProps {
  children: React.ReactNode;
  color: HighlightColor;
  className?: string;
  style?: React.CSSProperties;
}

const colorMap: Record<HighlightColor, { rgb: string; angle: number; transform: string }> = {
  yellow: { rgb: '255, 232, 62', angle: 50, transform: 'rotate(1deg) skew(-5deg) scale(1.1)' },
  green: { rgb: '91, 233, 92', angle: 30, transform: 'skew(7deg) scale(0.92)' },
  pink: { rgb: '255, 100, 185', angle: 150, transform: 'rotate(0.5deg) skew(5deg)' },
  blue: { rgb: '100, 200, 255', angle: 45, transform: 'rotate(-1deg) skew(-3deg) scale(1.05)' },
  purple: { rgb: '180, 100, 255', angle: 120, transform: 'rotate(0.8deg) skew(4deg)' },
};

export const Highlight: React.FC<HighlightProps> = ({ 
  children, 
  color, 
  className = '',
  style 
}) => {
  const config = colorMap[color];
  
  const customStyle: React.CSSProperties = {
    '--mark-color': config.rgb,
    '--mark-solid': `rgba(${config.rgb}, 1)`,
    '--mark-light': `rgba(${config.rgb}, 0.6)`,
    '--mark-medium': `rgba(${config.rgb}, 0.55)`,
    '--mark-dark': `rgba(${config.rgb}, 0.2)`,
    '--mark-angle': `${config.angle}deg`,
    '--mark-transform': config.transform,
    ...style,
  } as React.CSSProperties;

  return (
    <span className={`highlight ${className}`} style={customStyle}>
      {children}
    </span>
  );
};
```

---

## CSS (For Component)

```css
.highlight {
  position: relative;
  padding: 0.2em 0.4em;
  font-weight: 600;
  white-space: nowrap;
}

.highlight::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 3px 5px 3px 5px;
  background: 
    conic-gradient(at 0 100%, var(--mark-solid) 1%, transparent 3%) no-repeat 0 0 / auto 120%,
    conic-gradient(from 180deg at 100% 0, transparent, var(--mark-solid) 1%, transparent 4%) no-repeat 100% 100% / auto 120%,
    linear-gradient(var(--mark-angle), var(--mark-light), var(--mark-dark) 75%, var(--mark-medium));
  transform: var(--mark-transform);
}
```

---

## Adding Animation

```css
.highlight.animate::before {
  animation: highlight-draw 0.5s ease-out forwards;
  clip-path: inset(0 100% 0 0);
}

@keyframes highlight-draw {
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

Usage:
```tsx
<Highlight color="yellow" className="animate">Animated text</Highlight>
```

---

## Creating Custom Colors

```tsx
<Highlight 
  color="custom" 
  style={{
    '--mark-color': '255, 150, 50',
    '--mark-angle': '60deg',
    '--mark-transform': 'rotate(2deg) skew(-4deg)',
  }}
>
  Custom orange highlight
</Highlight>
```
