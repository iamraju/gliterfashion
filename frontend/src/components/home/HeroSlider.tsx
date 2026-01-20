import { useRef, useState, useEffect } from 'react';
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
import { storeApi } from '../../api/store';

const defaultSlides = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'Spring Collection 2025',
    subtitle: 'New arrivals are here. Discover the latest trends.',
    buttonText: 'Shop Now',
    link: '/products/mens-fashion',
    align: 'left'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    title: 'Elegant Evening Wear',
    subtitle: 'Stand out in our exclusive evening collection.',
    buttonText: 'View Collection',
    link: '/products/womens-fashion/evening-gowns',
    align: 'center'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    title: 'Urban Street Style',
    subtitle: 'Comfort meets fashion in our new street wear line.',
    buttonText: 'Explore',
    link: '/products/unisex-collections/streetwear',
    align: 'right'
  }
];

const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await storeApi.getBanners();
        if (banners && banners.length > 0) {
          // Filter active banners and sort them (backend might already sort, but safe to ensure)
          const activeBanners = banners
            .filter((b: any) => b.isActive)
            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
          if (activeBanners.length > 0) {
            setSlides(activeBanners);
          }
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const onBeforeInit = (swiper: SwiperType) => {
    // Override navigation refs
    if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
      swiper.params.navigation.prevEl = navigationPrevRef.current;
      swiper.params.navigation.nextEl = navigationNextRef.current;
    }
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 pt-6 pb-6">
      <div className="relative h-[600px] rounded-2xl overflow-hidden group bg-gray-100">
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
                   src={slide.imageUrl || slide.image} 
                   alt={slide.title} 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-black/30" />
              </div>
              
              <div className="relative h-full container mx-auto px-12 md:px-20 flex items-center">
                 <div className={`max-w-xl text-white space-y-6 ${
                     slide.align === 'center' ? 'mx-auto text-center' : 
                     slide.align === 'right' ? 'ml-auto text-right' : ''
                 }`}>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight fill-mode-forwards">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 font-light fill-mode-forwards">
                      {slide.subtitle}
                    </p>
                    <div className="fill-mode-forwards">
                      <a 
                          href={slide.link}
                          className="inline-flex items-center px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 rounded-full"
                      >
                          {slide.buttonText || slide.cta || 'Shop Now'}
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
      </div>
    </section>
  );
};

export default HeroSlider;
