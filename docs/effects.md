# JHey
https://codepen.io/jh3y


Tuggable Light Bulb
https://codepen.io/jh3y/pen/VwjgdLj

Let's scroll
https://codepen.io/jh3y/pen/VYZwOwd


# Modern Fancy Web UI Effects (Pure CSS/JS/TS + Three.js Allowed)

Discover spectacular web effects using only CSS, vanilla JavaScript/TypeScript, and optionally Three.js—no other dependencies. These examples draw from curated collections and demos for inspiration and copy-paste code. [freefrontend](https://freefrontend.com/css-animations/)

## Pure CSS Effects
Pure CSS delivers performant, hardware-accelerated animations like glassmorphism, 3D transforms, and particle-like behaviors via keyframes and pseudo-elements.

- **Glassmorphism Glowing Cards**: Backdrop-filter blur with neon borders and hover glows; ideal for modern dashboards. [github](https://github.com/davidteren/simple_morph)
- **Blossoming Flowers**: Night sky with blooming SVG paths using organic keyframe scaling and rotation. [codepen](https://codepen.io/mdusmanansari/pen/BamepLe)
- **3D Rotating Cube**: Perspective transforms create floating, interactive cubes with emoji faces and gradient shines. [gist.github](https://gist.github.com/johnlindquist/b82190c4c44fbdff60013ffd48bffc8e)
- **Neon Glowing Buttons**: Cycling border animations with box-shadow pulses for cyberpunk vibes. [github](https://github.com/sera619/PureCSS-Animations)
- **Fingerprint Scanner**: Radial gradients and scan-line keyframes mimic biometric UI feedback. [github](https://github.com/sera619/PureCSS-Animations)

Resources: CodePen collections at freefrontend.com/css-animations (147+ demos) and GitHub sera619/PureCSS-Animations (download ZIP for offline HTML/CSS files). [freefrontend](https://freefrontend.com/css-animations/)

## Vanilla JS/TS Effects
Enhance CSS with lightweight JS for mouse/scroll interactions, canvas particles, and dynamic transforms—perfect for your software engineering toolkit.

- **Particle Fire Trails**: Canvas-based mouse-following particles with CSS filters (blur, hue-rotate) for liquid-fire button hovers. [youtube](https://www.youtube.com/watch?v=lPVZYS4fvco)
- **Constellation Lines**: Connect random canvas dots on hover; uses requestAnimationFrame for 60fps smoothness. [youtube](https://www.youtube.com/watch?v=lPVZYS4fvco)
- **Magnetic Buttons**: JS calculates element positions to pull nearby items via transform; no libs needed. [github](https://github.com/lindelof/awesome-web-effect)
- **Glitch Text**: Shuffle letters with timing functions and canvas text rendering on scroll-enter. [freefrontend](https://freefrontend.com/javascript-text-effects/)
- **Liquid Blob Morphs**: Canvas path interpolation for button distortions using mouse velocity. [youtube](https://www.youtube.com/watch?v=lPVZYS4fvco)

Tip: Use TypeScript by adding types to vanilla JS classes (e.g., Particle class with Vector2D interface) for your dev workflow.

## Three.js Effects
Leverage Three.js for WebGL spectacles like volumetrics and shaders, keeping bundle minimal (~150KB gzipped).

- **Particle Volumetric Lights**: God rays through fog with point lights; mouse controls beam direction. [democoding](https://democoding.in/threejs)
- **Torus Knot Viewer**: Infinite twisting geometry with dynamic camera orbit via OrbitControls (built-in). [threejs](https://threejs.org/examples/)
- **Low-Poly Scenes**: Wireframe landscapes with scroll-driven camera; pure shaders for sunset cycles. [democoding](https://democoding.in/threejs)
- **Disco Lighting**: Multi-point lights blending colors rhythmically on reactive meshes. [threejsdemos](https://threejsdemos.com)
- **Hexagon Fly-Through**: Tunnel of morphing hexagons using instanced geometry. [democoding](https://democoding.in/threejs)

Starter: threejs.org/examples/—fork webgl_ variants and strip extras. [threejs](https://threejs.org/examples/)

## Implementation Tips
- **Performance**: Prefer transform/opacity over width/height; use will-change: transform. [blog.openreplay](https://blog.openreplay.com/modern-css-features-no-javascript/)
- **Accessibility**: Pair :hover with :focus-visible; add reduced-motion media queries. [dev](https://dev.to/sharique_siddiqui_8242dad/complex-animations-and-interaction-patterns-in-css-2aa7)
- **Prototyping**: CodePen for quick tests; export to TS via VS Code snippets. [dev](https://dev.to/alvaromontoro/10-cool-codepen-demos-july-2025-2265)
- **Metrics**: All under 10KB gzipped; test on Zürich metro (4G) for real-world perf.

Copy this Markdown, save as `web-ui-effects.md`, and use for reference or GitHub repo. Explore linked demos for full HTML/CSS/JS source—fork and customize! [1stwebdesigner](https://1stwebdesigner.com/30-useful-pure-css-code-snippets/)