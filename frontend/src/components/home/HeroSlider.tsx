import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/effect-fade';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'Spring Collection 2025',
    subtitle: 'New arrivals are here. Discover the latest trends.',
    cta: 'Shop Now',
    link: '/products/mens-fashion',
    align: 'left'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    title: 'Elegant Evening Wear',
    subtitle: 'Stand out in our exclusive evening collection.',
    cta: 'View Collection',
    link: '/products/womens-fashion/evening-gowns',
    align: 'center'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    title: 'Urban Street Style',
    subtitle: 'Comfort meets fashion in our new street wear line.',
    cta: 'Explore',
    link: '/products/unisex-collections/streetwear',
    align: 'right'
  }
];

const HeroSlider = () => {
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);

  const onBeforeInit = (swiper: SwiperType) => {
    // Override navigation refs
    if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
      swiper.params.navigation.prevEl = navigationPrevRef.current;
      swiper.params.navigation.nextEl = navigationNextRef.current;
    }
  };

  return (
    <section className="relative h-[600px] w-full bg-gray-100 overflow-hidden group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
            clickable: true,
            renderBullet: (_index, className) => {
                return `<span class="${className} !w-2.5 !h-2.5 !bg-white/50 !opacity-100 [&.swiper-pagination-bullet-active]:!bg-white [&.swiper-pagination-bullet-active]:!w-8 !rounded-full !transition-all !duration-300"></span>`;
            }
        }}
        onBeforeInit={onBeforeInit}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative h-full w-full">
            <div className="absolute inset-0">
               <img 
                 src={slide.image} 
                 alt={slide.title} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/30" />
            </div>
            
            <div className="relative h-full container mx-auto px-4 flex items-center">
               <div className={`max-w-xl text-white space-y-6 ${
                   slide.align === 'center' ? 'mx-auto text-center' : 
                   slide.align === 'right' ? 'ml-auto text-right' : ''
               }`}>
                  <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards delay-300">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 font-light opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards delay-500">
                    {slide.subtitle}
                  </p>
                  <div className="opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards delay-700">
                    <a 
                        href={slide.link}
                        className="inline-flex items-center px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                        {slide.cta}
                    </a>
                  </div>
               </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button ref={navigationPrevRef} className="w-12 h-12 rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-all">
             <ArrowLeft size={20} />
           </button>
           <button ref={navigationNextRef} className="w-12 h-12 rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-all">
             <ArrowRight size={20} />
           </button>
        </div>
      </Swiper>
    </section>
  );
};

export default HeroSlider;
