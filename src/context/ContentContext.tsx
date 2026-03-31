import React, { createContext, useState, useEffect, useContext } from 'react';

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
  services: [
    {
      id: "network",
      iconName: "Network",
      title: "Network Design & Administration",
      desc: "Robust LAN/WAN setup, optimization, and monitoring for seamless connectivity.",
      features: [
        "LAN, WAN, WLAN setup",
        "Router & switch configuration",
        "Structured cabling",
        "Network optimization",
        "VPN setup and remote access",
        "Network monitoring"
      ]
    },
    {
      id: "server",
      iconName: "Server",
      title: "Server & Infrastructure Management",
      desc: "Expert deployment and maintenance of Windows/Linux servers and infrastructure.",
      features: [
        "Windows & Linux server deployment",
        "Active Directory configuration",
        "Virtualization",
        "Backup & disaster recovery",
        "Infrastructure monitoring"
      ]
    },
    {
      id: "mail",
      iconName: "Mail",
      title: "Mail & DNS Solutions",
      desc: "Secure business email setup and comprehensive domain management.",
      features: [
        "Business email setup (Microsoft 365 & others)",
        "DNS configuration",
        "Domain management",
        "SPF, DKIM, DMARC configuration",
        "Email security hardening"
      ]
    },
    {
      id: "security",
      iconName: "Shield",
      title: "Cybersecurity Solutions",
      desc: "Comprehensive protection with firewalls, endpoint security, and policy implementation.",
      features: [
        "Firewall configuration",
        "Endpoint protection",
        "Vulnerability checks",
        "Security policy implementation",
        "User awareness training"
      ]
    },
    {
      id: "support",
      iconName: "Headphones",
      title: "IT Support & Helpdesk",
      desc: "Responsive remote and on-site helpdesk support to keep your team productive.",
      features: [
        "Remote & on-site support",
        "Hardware troubleshooting",
        "Software maintenance",
        "System upgrades",
        "Performance optimization"
      ]
    },
    {
      id: "consultancy",
      iconName: "Lightbulb",
      title: "IT Consultancy & Advisory",
      desc: "Strategic technology partnerships that help your business grow.",
      features: [
        "IT infrastructure planning",
        "Technology audits",
        "Cost optimization",
        "IT policy development",
        "Digital transformation"
      ]
    },
    {
      id: "training",
      iconName: "GraduationCap",
      title: "IT Training & Capacity Building",
      desc: "Empower your staff with essential IT and cybersecurity skills.",
      features: [
        "Networking training",
        "Cybersecurity awareness",
        "DNS & email best practices",
        "Corporate IT training"
      ]
    }
  ],
  testimonials: [
    {
      id: 1,
      name: "Emmanuel Okonkwo",
      role: "CEO, TechStart Nigeria",
      content: "ProMax IT Support transformed our network infrastructure. We used to have constant downtime, but since they took over, our operations have been seamless. Highly recommended!",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Operations Manager, Logistics Plus",
      content: "The cybersecurity training they provided for our staff was eye-opening. We feel much more secure knowing ProMax is monitoring our systems 24/7.",
      rating: 5
    },
    {
      id: 3,
      name: "Tunde Bakare",
      role: "Director, Bakare Associates",
      content: "Fast, professional, and affordable. They bridge the gap perfectly for small businesses like ours that need enterprise-grade support without the massive cost.",
      rating: 5
    },
    {
      id: 4,
      name: "Chidinma Adebayo",
      role: "Founder, Creative Hub",
      content: "Their response time is incredible. Whenever we have an issue, they are on it within minutes. It feels like having an in-house IT team.",
      rating: 4
    }
  ],
  blogPosts: []
};

export const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('promax_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge missing fields like copyrightYear
      const merged = { ...defaultContent, ...parsed };
      
      // Force update address if it's the old default
      if (parsed.address === "221 Ijesha Road, Surulere, Lagos, Nigeria") {
        merged.address = defaultContent.address;
      }

      // Fix the "Since Since" issue by stripping "Since " from the saved yearEstablished
      if (typeof merged.yearEstablished === 'string' && merged.yearEstablished.toLowerCase().startsWith('since ')) {
        merged.yearEstablished = merged.yearEstablished.substring(6).trim();
      }
      
      return merged;
    }
    return defaultContent;
  });

  useEffect(() => {
    localStorage.setItem('promax_content', JSON.stringify(content));
  }, [content]);

  const updateContent = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateAllContent = (newContent: any) => {
    setContent(newContent);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, updateAllContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
