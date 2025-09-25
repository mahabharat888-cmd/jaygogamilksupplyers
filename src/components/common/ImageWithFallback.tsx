import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIconSize?: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = "w-16 h-16", 
  fallbackIconSize = 24 
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (!src || hasError) {
    return (
      <div className={`${className} bg-dairy-100 rounded-lg flex items-center justify-center`}>
        <Package className="text-dairy-600" size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-cover rounded-lg`}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
