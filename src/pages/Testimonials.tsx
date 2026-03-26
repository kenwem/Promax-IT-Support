import React from 'react';
import { Quote, Star } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const Testimonials = () => {
  const { content } = useContent();
  const testimonials = content.testimonials || [];

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="bg-brand-blue text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Client Testimonials</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here is what our clients have to say.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((item: any) => (
              <div key={item.id} className="bg-white p-8 rounded-2xl shadow-lg relative">
                <Quote className="absolute top-8 right-8 text-brand-blue/10 w-16 h-16" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} 
                    />
                  ))}
                </div>
                <p className="text-slate-600 text-lg italic mb-8 leading-relaxed relative z-10">
                  "{item.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Join our list of satisfied clients</h2>
          <a 
            href="/contact" 
            className="inline-block bg-brand-green hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg"
          >
            Get Started Today
          </a>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
