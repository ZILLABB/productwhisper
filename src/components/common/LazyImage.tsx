import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  fallbackSrc?: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  threshold?: number;
}

/**
 * LazyImage component that loads images only when they enter the viewport
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=',
  fallbackSrc,
  className = '',
  loadingClassName = 'animate-pulse bg-gray-200',
  errorClassName = 'bg-gray-100',
  threshold = 0.1,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Set up intersection observer to detect when image enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image load error
  const handleError = () => {
    setIsError(true);
  };

  // Determine which image source to use
  const imageSrc = isError && fallbackSrc ? fallbackSrc : shouldLoad ? src : placeholderSrc;
  
  // Determine which CSS classes to apply
  const imageClasses = `${className} ${!isLoaded && !isError ? loadingClassName : ''} ${isError ? errorClassName : ''}`;

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={imageClasses}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default React.memo(LazyImage);
