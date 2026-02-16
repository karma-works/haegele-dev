import { memo, useRef, useState, useEffect, type ImgHTMLAttributes } from 'react';

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  rootMargin?: string;
  threshold?: number;
  fadeIn?: boolean;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%231a1a2e" width="1" height="1"/%3E%3C/svg%3E',
  rootMargin = '200px',
  threshold = 0.1,
  fadeIn = true,
  className = '',
  style,
  onLoad,
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const combinedStyle: React.CSSProperties = {
    ...style,
    opacity: fadeIn && !isLoaded ? 0 : 1,
    transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none',
  };

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : placeholder}
      alt={alt}
      className={className}
      style={combinedStyle}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
});

export default LazyImage;
