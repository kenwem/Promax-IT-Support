import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, siteId } from '../lib/firebase';

const defaultContent = {
  heroTitle1: "Ready to Help —",
  heroTitle2: "Anytime IT Matters.",
  heroSubtitle: "Professional IT services delivering reliable, secure, and cost-effective technology solutions for modern businesses.",
  aboutText: "ProMax IT Support Limited is a professional IT services company committed to delivering reliable, secure, and cost-effective technology solutions for startups, SMEs, and growing businesses.",
  phone: "+234 802 236 2666",
  email: "hello@promaxitsupport.com.ng",
  whatsapp: "https://wa.me/+2348022362666",
  address: "221 Ijesha Road, Surulere, Lagos, Nigeria\n(6.4398771, 3.9229101) Livingstone Estate, Epenlenmeje Orofun Ibeju Lekki Lagos",
  slogan: "Ready to Help — Anytime IT Matters.",
  yearEstablished: "January 2025",
  copyrightYear: "2026",
  logoUrl: "",
  heroImageUrl: "",
  aboutImageUrl: "",
  whyChooseUsImageUrl: "",
  services: [
    {
      id: "service-1",
      iconName: "Network",
      title: "Network Design & Administration",
      desc: "Design and implementation of robust, scalable network solutions.",
      features: ["LAN/WAN Setup", "VPN Configuration", "Wireless Solutions", "Network Security"]
    },
    {
      id: "service-2",
      iconName: "Server",
      title: "Server & Infrastructure Management",
      desc: "Comprehensive management of your server and IT infrastructure.",
      features: ["Server Setup", "Virtualization", "Storage Solutions", "Infrastructure Monitoring"]
    },
    {
      id: "service-3",
      iconName: "Mail",
      title: "Mail & DNS Solutions",
      desc: "Professional email hosting and DNS management services.",
      features: ["Email Hosting", "DNS Configuration", "Spam Protection", "Mail Migration"]
    },
    {
      id: "service-4",
      iconName: "Shield",
      title: "Cybersecurity Solutions",
      desc: "Protecting your digital assets with advanced security protocols.",
      features: ["Threat Detection", "Firewall Management", "Data Encryption", "Security Audits"]
    },
    {
      id: "service-5",
      iconName: "Headphones",
      title: "IT Support & Helpdesk",
      desc: "24/7 proactive monitoring and technical assistance.",
      features: ["Remote Support", "On-site Assistance", "Help Desk Services", "System Maintenance"]
    },
    {
      id: "service-6",
      iconName: "Lightbulb",
      title: "IT Consultancy & Advisory",
      desc: "Strategic IT consulting to align technology with your business goals.",
      features: ["IT Strategy", "Digital Transformation", "Compliance", "Project Management"]
    },
    {
      id: "service-7",
      iconName: "GraduationCap",
      title: "IT Training & Capacity Building",
      desc: "Empowering your team with the latest technical skills.",
      features: ["Staff Training", "Workshops", "Certification Prep", "Tech Literacy"]
    }
  ],
  testimonials: [],
  blogPosts: []
};

export const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sitePath = `sites/${siteId}`;
    const settingsDoc = doc(db, sitePath, 'settings', 'site');
    const servicesCol = collection(db, sitePath, 'services');
    const testimonialsCol = collection(db, sitePath, 'testimonials');
    const postsCol = collection(db, sitePath, 'posts');

    const unsubSettings = onSnapshot(settingsDoc, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      setContent((prev: any) => ({
        ...(prev || defaultContent),
        ...data,
        // Ensure arrays are initialized if not present in data
        services: prev?.services || [],
        testimonials: prev?.testimonials || [],
        blogPosts: prev?.blogPosts || []
      }));
      
      if (!snapshot.exists()) {
        setDoc(settingsDoc, defaultContent).catch(err => console.error("Error creating initial settings:", err));
      }
      setLoading(false);
    });

    const unsubServices = onSnapshot(servicesCol, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (services.length > 0) {
        setContent((prev: any) => ({ ...prev, services }));
      } else {
        // If collection is empty, use defaults from defaultContent
        setContent((prev: any) => ({ ...prev, services: defaultContent.services }));
      }
    });

    const unsubTestimonials = onSnapshot(testimonialsCol, (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (testimonials.length > 0) {
        setContent((prev: any) => ({ ...prev, testimonials }));
      } else {
        setContent((prev: any) => ({ ...prev, testimonials: defaultContent.testimonials }));
      }
    });

    const unsubPosts = onSnapshot(postsCol, (snapshot) => {
      const blogPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (blogPosts.length > 0) {
        setContent((prev: any) => ({ ...prev, blogPosts }));
      } else {
        setContent((prev: any) => ({ ...prev, blogPosts: defaultContent.blogPosts }));
      }
    });

    return () => {
      unsubSettings();
      unsubServices();
      unsubTestimonials();
      unsubPosts();
    };
  }, []);

  const updateContent = async (key: string, value: any) => {
    const sitePath = `sites/${siteId}`;
    try {
      await setDoc(doc(db, sitePath, 'settings', 'site'), { [key]: value }, { merge: true });
    } catch (err) {
      console.error("Error updating content:", err);
    }
  };

  const updateAllContent = async (newContent: any) => {
    const sitePath = `sites/${siteId}`;
    const { services, testimonials, blogPosts, ...settings } = newContent;
    try {
      await setDoc(doc(db, sitePath, 'settings', 'site'), settings, { merge: true });
      // Note: Updating collections is usually done individually in the admin panel
    } catch (err) {
      console.error("Error updating all content:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <ContentContext.Provider value={{ content, updateContent, updateAllContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);

