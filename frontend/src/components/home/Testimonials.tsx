import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: "The quality of the clothes is absolutely amazing! I've never felt more confident in my outfits. The delivery was super fast too.",
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: "Great selection of trendy items. I love how the website curates collections, makes it so easy to find what I'm looking for.",
  },
  {
    id: 3,
    name: 'Emma Wilson',
    role: 'Style Blogger',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    rating: 4,
    text: "Glitter Fashion has become my go-to for seasonal updates. The fabrics are comfortable and the designs are always on point.",
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg hover:bg-white hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100"
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
              
              <blockquote className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
