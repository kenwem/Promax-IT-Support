import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Server, Shield, Globe, Users, Clock, Award, Network, Mail, Headphones, Lightbulb, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const iconMap: Record<string, React.ReactNode> = {
  Network: <Globe className="w-8 h-8 text-brand-green" />,
  Server: <Server className="w-8 h-8 text-brand-green" />,
  Mail: <Mail className="w-8 h-8 text-brand-green" />,
  Shield: <Shield className="w-8 h-8 text-brand-green" />,
  Headphones: <Users className="w-8 h-8 text-brand-green" />,
  Lightbulb: <Lightbulb className="w-8 h-8 text-brand-green" />,
  GraduationCap: <GraduationCap className="w-8 h-8 text-brand-green" />
};

const Home = () => {
  const { content } = useContent();
  const services = content.services || [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-brand-blue">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={content?.heroImageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"} 
            alt="Global IT Connectivity and Infrastructure" 
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/95 via-brand-blue/80 to-brand-blue/40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {content.heroTitle1} <br/>
              <span className="text-brand-green">{content.heroTitle2}</span>
            </h1>
            <p className="text-xl text-slate-100 mb-8 leading-relaxed max-w-2xl drop-shadow-md font-medium whitespace-pre-line">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/contact" 
                className="bg-brand-green hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get IT Support <ArrowRight size={20} />
              </Link>
              <Link 
                to="/services" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center"
              >
                Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src={content?.aboutImageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                alt="Network Infrastructure Analysis" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="md:w-1/2">
              <h4 className="text-brand-green font-bold uppercase tracking-wider mb-2">Who We Are</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Empowering Business Through Technology</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                ProMax IT Support Limited bridges the gap between enterprise-level IT services and small business affordability. We provide expert technical support to organizations that require dependable and scalable IT solutions without the overhead of a full in-house department.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="text-brand-green shrink-0" size={20} />
                  <span>Cost-effective solutions for SMEs</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="text-brand-green shrink-0" size={20} />
                  <span>24/7 Monitoring and Support</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="text-brand-green shrink-0" size={20} />
                  <span>Enterprise-grade Security</span>
                </li>
              </ul>
              <Link to="/about" className="text-brand-blue font-bold hover:text-brand-green transition-colors inline-flex items-center gap-2">
                Learn More About Us <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Expertise</h2>
            <p className="text-slate-600">Comprehensive IT solutions designed to keep your business connected, protected, and productive.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service: any, index: number) => (
              <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-brand-green hover:border-brand-blue transition-colors"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {iconMap[service.iconName] || <Server className="w-8 h-8 text-brand-green" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{service.desc}</p>
                <Link to="/services" className="text-brand-blue font-medium text-sm hover:text-brand-green transition-colors">
                  Read More &rarr;
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/services" className="inline-block bg-brand-blue hover:bg-blue-900 text-white px-8 py-3 rounded-full font-medium transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose ProMax?</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                We don't just fix computers; we provide strategic technology partnerships that help your business grow.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-brand-green/20 p-3 rounded-lg h-fit">
                    <Clock className="text-brand-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Fast Response Time</h3>
                    <p className="text-slate-300 text-sm">We understand that downtime costs money. Our team is ready to respond quickly to critical issues.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-brand-green/20 p-3 rounded-lg h-fit">
                    <Award className="text-brand-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Certified Experts</h3>
                    <p className="text-slate-300 text-sm">Our team consists of certified professionals with years of experience in enterprise IT.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-brand-green/20 p-3 rounded-lg h-fit">
                    <Shield className="text-brand-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Proactive Security</h3>
                    <p className="text-slate-300 text-sm">We stop threats before they happen with advanced monitoring and security protocols.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-green rounded-2xl opacity-20 blur-lg"></div>
              <img 
                src={content?.whyChooseUsImageUrl || "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                alt="Secure Digital Infrastructure" 
                className="rounded-2xl shadow-2xl relative z-10 border-4 border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Ready to upgrade your IT infrastructure?</h2>
          <p className="text-xl text-slate-600 mb-10">
            Contact us today for a free consultation and discover how we can help your business thrive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/contact" 
              className="bg-brand-green hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl"
            >
              Request Consultation
            </Link>
            <a 
              href={`tel:${content.phone.replace(/\s+/g, '')}`} 
              className="bg-white border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
