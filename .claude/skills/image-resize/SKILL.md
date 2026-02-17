---
name: image-resize
description: Process and optimize image assets for this React project. Use when adding new images to public/assets/, when tsx files reference new image paths, or when optimizing existing images. Converts to WebP format, resizes to max 600px, and places output in public/assets/ subdirectories.
---

# Image Resize

Process images for optimal web performance in this project.

## Preferences

| Setting       | Value            |
| ------------- | ---------------- |
| Format        | WebP             |
| Max dimension | 600px            |
| Quality       | 80%              |
| Output dir    | `public/assets/` |

## Tools (macOS)

- `sips` - Resize images (built-in)
- `cwebp` - Convert to WebP (`brew install webp`)

## Workflow

1. Check if source image exists in `images/` folder
2. Create target directory: `public/assets/{category}/`
3. Resize to max 600px: `sips -Z 600 <source> --out /tmp/resized.png`
4. Convert to WebP: `cwebp -q 80 /tmp/resized.png -o <output.webp>`
5. Reference in tsx: `"/assets/{category}/{name}.webp"`

## Categories

- `projects/` - Project screenshots
- `public/` - General site images
- `manifest/` - PWA/SEO images

## One-liner

```bash
for f in name1 name2; do
  sips -Z 600 "images/$f.png" --out "/tmp/$f-resized.png" 2>/dev/null
  cwebp -q 80 "/tmp/$f-resized.png" -o "public/assets/{category}/$f.webp"
done
```

## In Components

Add `image` field to data interfaces, display with lazy loading:

```tsx
<img src={item.image} alt={item.title} loading="lazy" />
```
