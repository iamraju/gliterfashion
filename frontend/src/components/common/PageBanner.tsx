import type { FC } from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
  className?: string;
}

const PageBanner: FC<PageBannerProps> = ({ 
  title, 
  subtitle, 
  image = '/images/product-top-banner.avif', // Default stylish fashion image
  className = '' 
}) => {
  return (
    <div className={`relative w-full h-[300px] md:h-[400px] overflow-hidden ${className}`}>
        {/* Background Image */}
        <div className="absolute inset-0">
            <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                {title}
            </h1>
            {subtitle && (
                <p className="text-lg md:text-xl text-white/90 max-w-2xl font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    {subtitle}
                </p>
            )}
        </div>
    </div>
  );
};

export default PageBanner;
