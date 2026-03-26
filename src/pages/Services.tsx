import React from 'react';
import { Network, Server, Mail, Shield, Headphones, Lightbulb, GraduationCap, Check } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const iconMap: Record<string, React.ReactNode> = {
  Network: <Network className="w-10 h-10 text-white" />,
  Server: <Server className="w-10 h-10 text-white" />,
  Mail: <Mail className="w-10 h-10 text-white" />,
  Shield: <Shield className="w-10 h-10 text-white" />,
  Headphones: <Headphones className="w-10 h-10 text-white" />,
  Lightbulb: <Lightbulb className="w-10 h-10 text-white" />,
  GraduationCap: <GraduationCap className="w-10 h-10 text-white" />
};

const Services = () => {
  const { content } = useContent();
  const services = content.services || [];

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="bg-brand-blue text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Comprehensive technology solutions tailored for your business growth.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="bg-brand-blue p-6 flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    {iconMap[service.iconName] || <Server className="w-10 h-10 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{service.title}</h3>
                </div>
                <div className="p-8 flex-grow">
                  <ul className="space-y-3">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600">
                        <Check className="text-brand-green w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <a href="/contact" className="text-brand-blue font-bold text-sm hover:text-brand-green transition-colors flex items-center justify-between">
                    Request this service
                    <span className="text-xl">&rarr;</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Not sure what you need?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Our experts can conduct a technology audit to identify gaps and opportunities in your current infrastructure.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-brand-green hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg"
          >
            Schedule a Free Consultation
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;
