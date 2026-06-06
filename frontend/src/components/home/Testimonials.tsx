import { Star, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

const Testimonials = ({ limit }: { limit?: number }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/testimonials/public?active=true`);
        setTestimonials(res.data);
      } catch (error) {
        console.error('Failed to fetch testimonials');
      }
    };
    fetchTestimonials();
  }, []);

  const displayTestimonials = limit ? testimonials.slice(0, limit) : testimonials;

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-500 max-w-2xl">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </div>
          {limit && (
              <a href="/testimonials" className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors">
                View All Reviews <span className="ml-2">→</span>
              </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 p-8 rounded-[32px] hover:shadow-lg hover:bg-white hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < testimonial.rating ? "currentColor" : "none"} 
                    className={i < testimonial.rating ? "" : "text-gray-300"}
                  />
                ))}
              </div>
              
              <blockquote className="text-gray-700 leading-relaxed mb-6 flex-1 italic">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200/50">
                {testimonial.imageUrl ? (
                    <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                        <User className="w-6 h-6 text-gray-400" />
                    </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {limit && (
           <div className="mt-12 text-center md:hidden">
              <a href="/testimonials" className="inline-flex items-center text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors">
                View All Reviews <span className="ml-2">→</span>
              </a>
           </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
