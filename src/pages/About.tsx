import React from 'react';
import { CheckCircle, Target, Eye, Users, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useContent } from '../context/ContentContext';

const About = () => {
  const { content } = useContent();

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="bg-brand-blue text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your trusted partner in navigating the complex world of technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <h4 className="text-brand-green font-bold uppercase tracking-wider mb-2">Our Story</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Since {content.yearEstablished}</h2>
              <div className="prose prose-lg text-slate-600">
                <p className="mb-4 whitespace-pre-line">
                  {content.aboutText}
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 gap-6">
              <img 
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Network Cables and Infrastructure" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <div className="grid grid-cols-2 gap-6">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                  alt="Data Analytics Screen" 
                  className="rounded-2xl shadow-lg w-full h-40 object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                  alt="Circuit Board Technology" 
                  className="rounded-2xl shadow-lg w-full h-40 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-2xl shadow-md border-l-4 border-brand-blue"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-blue/10 p-3 rounded-full">
                  <Target className="text-brand-blue w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                To ensure businesses remain connected, protected, and productive by providing top-tier IT solutions that are accessible and affordable.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-2xl shadow-md border-l-4 border-brand-green"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-green/10 p-3 rounded-full">
                  <Eye className="text-brand-green w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                To be the leading IT support partner for SMEs in Nigeria, bridging the gap between complex technology and business growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-brand-blue text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <p className="text-slate-300 text-sm">We operate with transparency and honesty in all our dealings.</p>
            </div>
            <div className="p-6">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Focus</h3>
              <p className="text-slate-300 text-sm">Your success is our priority. We listen, understand, and deliver.</p>
            </div>
            <div className="p-6">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-slate-300 text-sm">We strive for perfection in every cable laid and every server configured.</p>
            </div>
            <div className="p-6">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Security</h3>
              <p className="text-slate-300 text-sm">We prioritize the safety of your data and infrastructure above all.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
