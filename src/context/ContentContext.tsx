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
    },
    {
      id: "service-8",
      iconName: "Code",
      title: "Web Development",
      desc: "Custom web development, responsive applications, and high-performance digital platforms.",
      features: [
        "Custom Web Applications",
        "Responsive & Mobile-First Design",
        "E-Commerce & Portals",
        "CMS Solutions & Maintenance",
        "API Integration & Performance Optimization"
      ]
    }
  ],
  testimonials: [
    {
      id: "testimonial-1",
      name: "Tunde Adebayo",
      role: "Operations Director, Apex Logistics",
      content: "ProMax transformed our office network and server reliability. We experienced zero downtime during our peak shipping quarter.",
      rating: 5
    },
    {
      id: "testimonial-2",
      name: "Chidinma Okonkwo",
      role: "Managing Partner, Prime Legal Associates",
      content: "Their cybersecurity implementation and rapid IT helpdesk support gave our firm peace of mind with sensitive client data.",
      rating: 5
    }
  ],
  blogPosts: [
    {
      id: "post-1",
      title: "How Technology Helps Small Businesses Grow",
      slug: "how-technology-helps-small-businesses-grow",
      category: "Business & Growth",
      author: "Shehu Mohammed",
      authorDesignation: "IT Expert",
      date: "29/10/2026",
      featured: true,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      excerpt: "In today's fast-paced digital world, leveraging modern IT infrastructure and cloud solutions enables small businesses to scale efficiently, enhance security, and outpace the competition.",
      content: `# How Technology Helps Small Businesses Grow

In the modern enterprise landscape, technology is no longer a luxury reserved for multinational conglomerates. For small and medium-sized enterprises (SMEs), implementing robust, secure, and agile IT solutions is the single most decisive factor in scaling operations and outperforming legacy competitors.

---

## 1. Streamlined Operations & High Availability

Downtime translates directly into lost revenue and diminished customer trust. With modern **server infrastructure management** and high-availability cloud networking, small businesses can achieve enterprise-grade uptime of 99.9%.

| Capability | Legacy Approach | Modern IT Support |
| :--- | :--- | :--- |
| **Data Backup** | Manual USB drives | Automated Cloud Replication |
| **System Monitoring** | Reactive (after a crash) | Proactive 24/7 Health Telemetry |
| **Network Security** | Basic commercial routers | Managed UTM Firewalls & VPNs |
| **Helpdesk** | Ad-hoc internal troubleshooting | Dedicated SLA-backed IT Helpdesk |

---

## 2. Fortified Cybersecurity & Data Protection

Cyber threats are increasingly targeting smaller businesses because they often lack enterprise security measures. A comprehensive defense strategy includes:

- **End-to-End Encryption**: Securing all internal communications and sensitive customer data.
- **Multi-Factor Authentication (MFA)**: Eliminating credential-stuffing vulnerability across all email and domain accounts.
- **Managed DNS & Anti-Phishing Filters**: Blocking malicious traffic before it ever hits employee workstations.

> *"Investing in preventative IT support is exponentially more cost-effective than remediating a single security incident or unrecoverable data loss."*

---

## 3. Remote Work & Scalable Cloud Collaboration

Transitioning to secure mail servers, centralized active directories, and private VPN infrastructure empowers your team to collaborate seamlessly from any location without compromising corporate governance.

---

### Ready to Accelerate Your Business Growth?

At **ProMax IT Support Limited**, we provide customized network design, proactive infrastructure monitoring, and tailored IT consulting to ensure your technology accelerates your ambitions.

[Explore Our IT Services](/services) • [Request a Consultation](/contact)`
    },
    {
      id: "post-2",
      title: "Top 5 Cybersecurity Best Practices for Modern Businesses",
      slug: "top-5-cybersecurity-best-practices",
      category: "Cybersecurity",
      author: "Shehu Mohammed",
      authorDesignation: "IT Expert",
      date: "28/10/2026",
      featured: false,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      excerpt: "Protect your corporate networks and client data with essential cyber hygiene protocols, zero-trust network access, and proactive threat detection.",
      content: `# Top 5 Cybersecurity Best Practices for Modern Businesses

Cybersecurity threats have evolved dramatically. Today, threat actors deploy sophisticated automated scanners targeting known vulnerabilities in network perimeters, email relays, and unpatched endpoints.

## 1. Enforce Zero Trust Network Access (ZTNA)
Never trust any connection implicitly, even if it originates from within the local office network. Require authentication, device compliance verification, and least-privilege permissions.

## 2. Patching and Lifecycle Management
Over 60% of data breaches involve unpatched software vulnerabilities where a vendor fix was already available. Establish monthly recurring patch cadences for firewalls, operating systems, and network controllers.

## 3. Advanced Email Filtering & DMARC Enforcements
Phishing accounts for over 80% of initial network intrusions. Implementing SPF, DKIM, and strict DMARC policies ensures spoofed emails cannot impersonate your executive leadership or domain.

## 4. Immutable Backups
Maintain isolated, write-once-read-many (WORM) backups of all core databases and virtual machine snapshots to neutralize ransomware threats.

## 5. Employee Awareness & Simulation
Conduct regular simulated phishing drills to transform your workforce into the primary line of defense.

[Contact Our Security Team](/contact)`
    }
  ]
};

export const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<any>(defaultContent);
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
        services: prev?.services?.length ? prev.services : defaultContent.services,
        testimonials: prev?.testimonials?.length ? prev.testimonials : defaultContent.testimonials,
        blogPosts: prev?.blogPosts?.length ? prev.blogPosts : defaultContent.blogPosts
      }));
      
      if (!snapshot.exists()) {
        setDoc(settingsDoc, defaultContent).catch(err => console.error("Error creating initial settings:", err));
      }
      setLoading(false);
    });

    const unsubServices = onSnapshot(servicesCol, (snapshot) => {
      const remoteServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (remoteServices.length > 0) {
        // Ensure all default services (including Web Development) are present if not already added to Firestore
        const mergedServices = [...remoteServices];
        defaultContent.services.forEach(defService => {
          const exists = remoteServices.some((s: any) => 
            s.id === defService.id || 
            (s.title && s.title.toLowerCase().trim() === defService.title.toLowerCase().trim())
          );
          if (!exists) {
            mergedServices.push(defService);
          }
        });
        setContent((prev: any) => ({ ...prev, services: mergedServices }));
      } else {
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

