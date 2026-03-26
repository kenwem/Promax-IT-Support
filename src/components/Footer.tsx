import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import AdminModal from './AdminModal';
import { useContent } from '../context/ContentContext';

const Footer = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { content } = useContent();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-brand-green text-white p-1.5 rounded">
                <span className="font-bold text-lg">PM</span>
              </div>
              <span className="font-bold text-xl text-white">ProMax IT Support</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Bridging the gap between enterprise-level IT services and small business affordability. 
              Reliable, secure, and cost-effective technology solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-blue transition-colors text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-blue transition-colors text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-blue transition-colors text-white">
                <Linkedin size={18} />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-blue transition-colors text-white">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> Blog
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> Testimonials
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-green transition-colors flex items-center gap-2">
                  <ArrowRight size={14} /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              {content.services?.slice(0, 6).map((service: any, index: number) => (
                <li key={index} className="hover:text-brand-green transition-colors cursor-pointer">{service.title}</li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-green shrink-0 mt-1" size={18} />
                <span>{content.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-green shrink-0" size={18} />
                <div className="flex flex-col">
                  <a href={`tel:${content.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{content.phone}</a>
                  <a href={content.whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-green hover:underline mt-0.5">WhatsApp Us</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-green shrink-0" size={18} />
                <Link to="/contact#contact-form" className="hover:text-white transition-colors">
                  {content.email.split('.').map((part: string, i: number, arr: string[]) => (
                    <React.Fragment key={i}>
                      {part}{i < arr.length - 1 && <>.&#8203;</>}
                    </React.Fragment>
                  ))}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 <span onClick={() => setIsAdminOpen(true)} className="cursor-pointer hover:text-white transition-colors">ProMax</span> IT Support Limited. All Rights Reserved.</p>
        </div>
      </div>
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </footer>
  );
};

export default Footer;
