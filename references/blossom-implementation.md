# CSS Blossoming Flowers - Implementation Guide

## Quick Reference for Reimplementation

### File Structure Needed
```
/src
  /styles
    _variables.scss       # CSS custom properties
    _animations.scss      # Keyframe definitions
    _flowers.scss         # Flower component styles
    _background.scss      # Night sky gradient
    _grass.scss           # Grass elements
    main.scss             # Entry point
  /components
    Flower.tsx            # React/TS flower component
    Scene.tsx             # Main scene container
```

---

## Core Variables

```scss
// _variables.scss
:root {
  // Colors
  --dark-color: #000;
  --flower-primary: #a7ffee;
  --flower-secondary: #54b8aa;
  --flower-accent: #39c6d6;
  --flower-dark: #14757a;
  --grass-color: #159faa;
  --light-gold: rgb(255, 251, 0);
  --light-cyan: #23f0ff;
  
  // Animation
  --fl-speed: 0.8s;
  --grow-duration: 4s;
  
  // Dimensions
  --flower-scale: 0.9;
}
```

---

## Key Animations Reference

### 1. Flower Sway
```scss
@keyframes moving-flower-1 {
  0%, 100% { transform: rotate(2deg); }
  50% { transform: rotate(-2deg); }
}
```

### 2. Bloom Effect
```scss
@keyframes blooming-flower {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### 3. Leaf Unfurl
```scss
@keyframes blooming-leaf-right {
  0% {
    transform-origin: left;
    transform: rotate(70deg) rotateY(30deg) scale(0);
  }
}

@keyframes blooming-leaf-left {
  0% {
    transform-origin: right;
    transform: rotate(-70deg) rotateY(30deg) scale(0);
  }
}
```

### 4. Stem Growth
```scss
@keyframes grow-flower-tree {
  0% {
    height: 0;
    border-radius: 1vmin;
  }
}
```

### 5. Floating Light
```scss
@keyframes light-ans {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
```

### 6. Grass Movement
```scss
@keyframes moving-grass {
  0%, 100% { transform: rotate(-48deg) rotateY(40deg); }
  50% { transform: rotate(-50deg) rotateY(40deg); }
}
```

---

## Petal Shape Formula

```scss
// Primary petals (4 per flower)
.flower__leaf {
  width: 8vmin;
  height: 11vmin;
  border-radius: 51% 49% 47% 53% / 44% 45% 55% 69%;
  background-image: linear-gradient(to top, #54b8aa, #a7ffee);
  transform-origin: bottom center;
  opacity: 0.9;
  box-shadow: inset 0 0 2vmin rgba(255, 255, 255, 0.5);
  
  // Position variants
  &--1 { transform: translate(-10%, 1%) rotateY(40deg) rotateX(-50deg); }
  &--2 { transform: translate(-50%, -4%) rotateX(40deg); }
  &--3 { transform: translate(-90%, 0%) rotateY(45deg) rotateX(50deg); }
  &--4 { 
    // Back petal
    width: 8vmin;
    height: 8vmin;
    border-radius: 4vmin 10vmin 4vmin 4vmin;
    transform: translate(-0%, 18%) rotateX(70deg) rotate(-43deg);
    background-image: linear-gradient(to top, #39c6d6, #a7ffee);
    z-index: 1;
    opacity: 0.8;
  }
}
```

---

## Flower Center Pattern

```scss
.flower__white-circle {
  position: absolute;
  left: -3.5vmin;
  top: -3vmin;
  width: 9vmin;
  height: 4vmin;
  border-radius: 50%;
  background-color: #fff;
  
  // Inner texture
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: inherit;
    background-image: 
      repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 12px),
      repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 12px),
      linear-gradient(90deg, rgb(255, 235, 18), rgb(255, 206, 0));
  }
}
```

---

## Stem Construction

```scss
.flower__line {
  height: 55vmin;
  width: 1.5vmin;
  background-image: 
    linear-gradient(to left, rgb(0,0,0,0.2), transparent, rgba(255,255,255,0.2)),
    linear-gradient(to top, transparent 10%, #14757a, #39c6d6);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
  animation: grow-flower-tree 4s backwards;
}
```

---

## Light Particles

```scss
.flower__light {
  position: absolute;
  bottom: 0vmin;
  width: 1vmin;
  height: 1vmin;
  background-color: rgb(255, 251, 0);
  border-radius: 50%;
  filter: blur(0.2vmin);
  animation: light-ans 4s linear infinite backwards;
  
  &:nth-child(odd) {
    background-color: #23f0ff;
  }
  
  // Position each light with inline styles or specific classes
  &--1 { left: -2vmin; animation-delay: 1s; }
  &--2 { left: 3vmin; animation-delay: 0.5s; }
  // ... etc
}
```

---

## Night Sky Background

```scss
.night {
  position: fixed;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  filter: blur(0.1vmin);
  background-image: 
    radial-gradient(ellipse at top, transparent 0%, var(--dark-color)),
    radial-gradient(ellipse at bottom, var(--dark-color), rgba(145, 233, 255, 0.2)),
    repeating-linear-gradient(220deg, rgb(0,0,0) 0px, rgb(0,0,0) 19px, transparent 19px, transparent 22px),
    repeating-linear-gradient(189deg, rgb(0,0,0) 0px, rgb(0,0,0) 19px, transparent 19px, transparent 22px),
    repeating-linear-gradient(148deg, rgb(0,0,0) 0px, rgb(0,0,0) 19px, transparent 19px, transparent 22px),
    linear-gradient(90deg, rgb(0, 255, 250), rgb(240, 240, 240));
}
```

---

## Stagger Pattern

```scss
// Use inline style for delay: style="--d:1.2s"
.grow-ans {
  animation: grow-animation 1s ease-out backwards;
  animation-delay: var(--d);
}

// Or SCSS loop for multiple items
@for $i from 1 through 8 {
  .leaf--#{$i} {
    animation-delay: #{$i * 0.2}s;
  }
}
```

---

## TypeScript Component Structure

```tsx
// Flower.tsx
interface FlowerProps {
  variant: 1 | 2 | 3;
  delay?: number;
  position?: { x: string; y: string };
}

export const Flower: React.FC<FlowerProps> = ({ 
  variant, 
  delay = 0,
  position = { x: '50%', y: '10vmin' }
}) => {
  return (
    <div 
      className={`flower flower--${variant}`}
      style={{ 
        left: position.x, 
        bottom: position.y,
        '--d': `${delay}s` 
      } as React.CSSProperties}
    >
      <div className={`flower__leafs flower__leafs--${variant}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flower__leaf flower__leaf--${i}`} />
        ))}
        <div className="flower__white-circle" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className={`flower__light flower__light--${i}`} />
        ))}
      </div>
      <div className="flower__line">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`flower__line__leaf flower__line__leaf--${i}`} />
        ))}
      </div>
    </div>
  );
};
```

---

## Critical Performance Notes

1. **Always use `transform` and `opacity`** - GPU accelerated
2. **Avoid animating `width`, `height`, `top`, `left`** - Causes reflows
3. **Use `backwards` fill-mode** - Prevents flash of unstyled content
4. **Consider `will-change`** - Hint browser for optimization (use sparingly)
5. **Use CSS variables for delays** - Easier JavaScript coordination
6. **Limit simultaneous animations** - Too many can overwhelm GPU

---

## Color Palette

| Element | Colors |
|---------|--------|
| Background | #000, rgb(0,255,250), rgb(240,240,240) |
| Flower Petals | #a7ffee, #54b8aa, #39c6d6, #14757a |
| Flower Center | #fff, rgb(255,235,18), rgb(255,206,0) |
| Grass | #159faa, #079097 |
| Lights | rgb(255,251,0), #23f0ff |

---

## Responsive Considerations

- All dimensions use `vmin` (viewport minimum)
- Scale entire scene with `transform: scale(0.9)`
- Adjust `--flower-scale` CSS variable for fine-tuning
- Consider reducing flower count on mobile (< 768px)
