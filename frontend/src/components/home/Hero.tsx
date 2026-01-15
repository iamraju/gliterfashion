import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-gray-900">
      {/* Background Image - Using a placeholder for now */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")' }}
      />
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-start text-white">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <span className="text-accent font-bold tracking-widest uppercase text-sm">New Collection 2026</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
            Elegance is not just being noticed, it's about being remembered.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-lg">
            Discover our curated collection of premium fashion essentials designed to elevate your everyday style.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-accent hover:text-white transition-all duration-300"
            >
              Shop Now
            </Link>
            <Link 
              to="/collections" 
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
            >
              View Collections <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
