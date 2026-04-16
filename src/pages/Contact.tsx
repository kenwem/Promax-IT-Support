import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useLocation } from 'react-router-dom';

const Contact = () => {
  const { content } = useContent();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (location.hash === '#contact-form') {
      setTimeout(() => {
        const element = document.getElementById('contact-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formspree.io/f/xpwqzvda", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
      } else {
        const result = await response.json();
        console.error('Formspree Error:', result);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      
      // Clear the status message after 8 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 8000);
    }
  };

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="bg-brand-blue text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Get in touch with our team for support, inquiries, or a free consultation.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div id="contact-form" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              <form 
                action={`https://formspree.io/f/xpwqzvda`} 
                method="POST" 
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                {/* Formspree Configuration */}
                <input type="hidden" name="_subject" value="New Contact Form Submission" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all disabled:opacity-60"
                      placeholder="Alex O"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all disabled:opacity-60"
                      placeholder="Alex@company.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all disabled:opacity-60"
                      placeholder="+234..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                    <input 
                      type="text" 
                      name="company"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all disabled:opacity-60"
                      placeholder="Your Company Ltd"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea 
                    name="message"
                    required
                    disabled={isSubmitting}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none disabled:opacity-60"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-blue hover:bg-blue-900 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'} <Send size={18} />
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="shrink-0" size={20} />
                    <p>Thank you! Your message has been sent successfully.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="shrink-0" size={20} />
                    <p>Oops! Something went wrong. Please try again later.</p>
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info & Map */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-green/10 p-3 rounded-full shrink-0">
                    <MapPin className="text-brand-green w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Our Location</h3>
                    <p className="text-slate-600 whitespace-pre-line">{content.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-green/10 p-3 rounded-full shrink-0">
                    <Phone className="text-brand-green w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Phone & WhatsApp</h3>
                    <p className="text-slate-600 mb-1"><a href={`tel:${content.phone.replace(/\s+/g, '')}`} className="hover:text-brand-blue">{content.phone}</a></p>
                    <a href={content.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-green font-medium hover:underline">Available on WhatsApp</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-green/10 p-3 rounded-full shrink-0">
                    <Mail className="text-brand-green w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Email Us</h3>
                    <p className="text-slate-600"><a href={`mailto:${content.email}`} className="hover:text-brand-blue">{content.email}</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-green/10 p-3 rounded-full shrink-0">
                    <Clock className="text-brand-green w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Business Hours</h3>
                    <p className="text-slate-600">Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p className="text-slate-600">Sat: 10:00 AM - 4:00 PM</p>
                    <p className="text-slate-600">Sun: Closed (Emergency Support Only)</p>
                  </div>
                </div>
              </div>

              {/* Map Embed */}
              <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden shadow-md">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.133276707374!2d3.3369!3d6.4943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c10383705d1%3A0x705132223456789!2sIjesha%20Rd%2C%20Surulere%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1645555555555!5m2!1sen!2sng" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
