import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
    },
    {
      id: "service-9",
      iconName: "Smartphone",
      title: "Mobile App Development",
      desc: "Native and cross-platform mobile applications engineered for exceptional user experience, performance, and scale.",
      features: [
        "Native iOS & Android Applications",
        "Cross-Platform Apps (Flutter & React Native)",
        "Mobile UI/UX Design & Prototyping",
        "App Store & Google Play Store Publishing",
        "Push Notifications & Offline Data Sync",
        "Secure Backend & API Integration"
      ]
    }
  ],
  portfolio: [
    {
      id: "proj-1",
      title: "Campus-Wide Wi-Fi 6 & High-Density Core Network Overhaul",
      category: "Network Design & Administration",
      technologies: ["Cisco Catalyst", "Ubiquiti UniFi", "Sophos Firewall", "VLANs", "Fiber Optics"],
      client: "Livingstone Educational Academy",
      year: "2026",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop",
      summary: "Comprehensive enterprise networking design deploying 85+ Wi-Fi 6 access points, core switches, and captive guest access.",
      description: "Overhauled the entire IT and networking infrastructure for a multi-building academic campus. Installed managed gigabit switches, high-density Wi-Fi 6 access points, segmented VLANs for staff, students, and administration, and configured unified threat management with content web-filtering.",
      deliverables: [
        "Seamless roaming Wi-Fi 6 coverage across 4 campus buildings",
        "Isolated guest network with branded captive login portal",
        "Layer 7 deep packet inspection and intrusion prevention",
        "Continuous remote management and telemetry monitoring"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
    },
    {
      id: "proj-2",
      title: "Enterprise Hybrid Cloud & Automated Disaster Recovery",
      category: "Server & Infrastructure Management",
      technologies: ["AWS", "VMware ESXi", "Terraform", "Cisco UTM", "Kubernetes", "Linux"],
      client: "Prime Heritage Financial Group",
      year: "2025",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      summary: "Architected redundant multi-region hybrid cloud infrastructure with automated failover, VPN mesh, and ISO-aligned server hardening.",
      description: "Migrated legacy on-premise infrastructure to a secure hybrid AWS cloud setup. Configured redundant Cisco site-to-site VPN tunnels, automated multi-zone failover, virtualization cluster orchestration, and centralized telemetry monitoring with automated alert triggers.",
      deliverables: [
        "Zero-trust network access (ZTNA) policy implementation",
        "Multi-region automated disaster recovery with under 5-minute RTO",
        "24/7 proactive infrastructure health and telemetry monitoring",
        "60% reduction in on-premise hardware maintenance costs"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
    },
    {
      id: "proj-3",
      title: "Corporate Microsoft 365 & DMARC Security Architecture",
      category: "Mail & DNS Solutions",
      technologies: ["Microsoft 365", "Exchange Online", "DMARC/DKIM/SPF", "Cloudflare DNS", "Mimecast"],
      client: "Vertex Global Consulting",
      year: "2025",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
      summary: "Seamless zero-downtime migration of 350+ corporate mailboxes to Microsoft 365 with strict DMARC, DKIM, and anti-spoofing enforcement.",
      description: "Planned and executed the complete mail and domain name system migration for Vertex Global Consulting. Configured high-availability DNS failovers, strict email authentication to eliminate domain spoofing, and deployed advanced anti-phishing inbound filters.",
      deliverables: [
        "Zero-loss migration of 350+ executive mailboxes and shared archives",
        "100% compliance with RFC DMARC, DKIM, and SPF enforcement",
        "Redundant anycast DNS configuration for lightning-fast lookups",
        "Automated spam quarantine and anti-malware attachment scanning"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: false
    },
    {
      id: "proj-4",
      title: "Next-Gen Firewall Hardening & Zero-Trust Defense",
      category: "Cybersecurity Solutions",
      technologies: ["Sophos XG", "Fortinet FortiGate", "SIEM Telemetry", "MFA", "Snort IPS"],
      client: "Apex Commercial Holdings",
      year: "2026",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
      summary: "Enterprise perimeter defense audit, next-generation firewall deployment, and automated intrusion prevention system.",
      description: "Secured corporate data center perimeter against ransomware, unauthorized intrusions, and data exfiltration. Configured stateful deep packet inspection, automated threat response scripts, and hardened workstation security policies across remote and on-premise staff.",
      deliverables: [
        "Deployment of redundant high-availability next-gen firewalls",
        "Zero-trust network access policies for remote workers",
        "Continuous vulnerability scanning and automated patch schedules",
        "Incident response playbooks with 15-minute mitigation response"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
    },
    {
      id: "proj-5",
      title: "24/7 Managed IT Helpdesk & Remote Infrastructure Monitoring",
      category: "IT Support & Helpdesk",
      technologies: ["Proactive RMM", "ServiceNow", "Zabbix", "Remote Desktop SLA", "Active Directory"],
      client: "Zenith Business Towers",
      year: "2026",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
      summary: "Comprehensive multi-tenant IT helpdesk and proactive infrastructure monitoring guaranteeing 99.9% employee productivity.",
      description: "Delivering ongoing 24/7 technical helpdesk, workstation provisioning, printer and peripheral troubleshooting, and real-time network telemetry for corporate tenants across 8 commercial office floors.",
      deliverables: [
        "Average ticket resolution time under 18 minutes",
        "Proactive patch management and workstation health monitoring",
        "Centralized Active Directory and single sign-on user lifecycle",
        "Monthly executive IT telemetry and uptime reports"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: false
    },
    {
      id: "proj-6",
      title: "PaySecure Enterprise Billing & Merchant Portal",
      category: "Web Development",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Docker"],
      client: "PaySecure Financial Services",
      year: "2025",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
      summary: "High-volume corporate transaction dashboard, automated reconciliation engine, and merchant checkout portal.",
      description: "Built a responsive, bank-grade web dashboard enabling business clients to manage multi-currency accounts, execute batch payroll payouts, and visualize revenue analytics in real-time. Compliant with strict cryptographic security standards and two-factor administrator authorization.",
      deliverables: [
        "Interactive analytics dashboards with Chart.js and Tailwind",
        "Role-based multi-user hierarchy with granular permissions",
        "Automated PDF invoicing and transaction statement exports",
        "99.99% uptime microservices architecture"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
    },
    {
      id: "proj-7",
      title: "NovaMarket Multi-Vendor E-Commerce Platform",
      category: "Web Development",
      technologies: ["Next.js", "Tailwind CSS", "Paystack", "PostgreSQL", "Cloudinary"],
      client: "NovaMarket Global",
      year: "2026",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
      summary: "High-performance digital marketplace featuring instant product search, lightning-fast checkout, and merchant order analytics.",
      description: "Engineered a modern, responsive multi-vendor e-commerce marketplace. Includes instantaneous search with autocomplete, real-time inventory tracking, integrated payment gateways, and a seller management portal with sales payout automation.",
      deliverables: [
        "Sub-second page load times with server-side rendering",
        "Secure automated checkout with multi-currency payment options",
        "Dedicated vendor portal with sales analytics and order tracking",
        "SEO-optimized product catalog with structured schema markup"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: false
    },
    {
      id: "proj-8",
      title: "Apex Logistics Fleet Tracking & Dispatch Mobile App",
      category: "Mobile App Development",
      technologies: ["Flutter", "Firebase", "Google Maps API", "Node.js", "WebSockets"],
      client: "Apex Logistics International",
      year: "2025",
      image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1200&auto=format&fit=crop",
      summary: "Real-time GPS fleet tracking, automated dispatch routing, and driver telemetry mobile application for commercial freight vehicles.",
      description: "Developed a comprehensive mobile operations platform for Apex Logistics. The app provides real-time telematics tracking, turn-by-turn routing with geofencing alerts, digital proof of delivery with instant barcode scanning, and driver safety scoring. Supported offline synchronization for long-distance transit across regions with patchy cellular coverage.",
      deliverables: [
        "Cross-platform iOS and Android mobile app",
        "Live driver location telemetry with sub-second polling",
        "Automated digital bill-of-lading and e-signatures",
        "Offline cache and auto-reconciliation engine"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
    },
    {
      id: "proj-9",
      title: "MedCare Patient Portal & Telehealth App",
      category: "Mobile App Development",
      technologies: ["React Native", "TypeScript", "Express.js", "PostgreSQL"],
      client: "MedCare Health Network",
      year: "2026",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
      summary: "Mobile healthcare application enabling patients to book doctor consultations, receive lab test notifications, and access digital prescriptions securely.",
      description: "Designed and engineered an intuitive patient companion app for iOS and Android. Features include biometric face/fingerprint authentication, instant appointment booking with doctor calendar synchronization, secure in-app messaging, and push notifications for medication reminders.",
      deliverables: [
        "Biometric authentication (Touch ID / Face ID)",
        "Integrated calendar and consultation booking engine",
        "HIPAA / NDPR compliant encrypted document vault",
        "Push notification reminders for medications and test results"
      ],
      demoUrl: "https://promaxitsupport.com.ng",
      featured: true
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
  const siteSettingsRef = useRef<any>({});

  useEffect(() => {
    const sitePath = `sites/${siteId}`;
    const settingsDoc = doc(db, sitePath, 'settings', 'site');
    const servicesCol = collection(db, sitePath, 'services');
    const portfolioCol = collection(db, sitePath, 'portfolio');
    const testimonialsCol = collection(db, sitePath, 'testimonials');
    const postsCol = collection(db, sitePath, 'posts');

    const unsubSettings = onSnapshot(settingsDoc, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      siteSettingsRef.current = data;
      const deletedPortfolioIds: string[] = data.deletedPortfolioIds || [];
      const isPortfolioInit = data.portfolioInitialized || false;

      setContent((prev: any) => {
        // Filter current portfolio against deleted IDs
        let currentPortfolio = prev?.portfolio;
        if (!currentPortfolio || currentPortfolio.length === 0) {
          currentPortfolio = isPortfolioInit ? [] : defaultContent.portfolio;
        }
        const filteredPortfolio = (currentPortfolio || []).filter(
          (p: any) => !deletedPortfolioIds.includes(p.id?.toString())
        );

        return {
          ...(prev || defaultContent),
          ...data,
          services: prev?.services?.length ? prev.services : defaultContent.services,
          portfolio: filteredPortfolio,
          testimonials: prev?.testimonials?.length ? prev.testimonials : defaultContent.testimonials,
          blogPosts: prev?.blogPosts?.length ? prev.blogPosts : defaultContent.blogPosts
        };
      });
      
      if (!snapshot.exists()) {
        setDoc(settingsDoc, defaultContent).catch(err => console.error("Error creating initial settings:", err));
      }
      setLoading(false);
    });

    const unsubServices = onSnapshot(servicesCol, (snapshot) => {
      const remoteServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deletedServiceIds: string[] = siteSettingsRef.current?.deleted_services_ids || [];
      if (remoteServices.length > 0) {
        // Ensure all default services (including Web Development and Mobile App Development) are present if not already added to Firestore
        const mergedServices = [...remoteServices];
        defaultContent.services.forEach(defService => {
          const exists = remoteServices.some((s: any) => 
            s.id === defService.id || 
            (s.title && s.title.toLowerCase().trim() === defService.title.toLowerCase().trim())
          );
          if (!exists && !deletedServiceIds.includes(defService.id)) {
            mergedServices.push(defService);
          }
        });
        const filtered = mergedServices.filter((s: any) => !deletedServiceIds.includes(s.id?.toString()));
        setContent((prev: any) => ({ ...prev, services: filtered }));
      } else {
        const filteredDefaults = defaultContent.services.filter((s: any) => !deletedServiceIds.includes(s.id?.toString()));
        setContent((prev: any) => ({ ...prev, services: filteredDefaults }));
      }
    });

    const unsubPortfolio = onSnapshot(portfolioCol, (snapshot) => {
      const remotePortfolio = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deletedIds: string[] = siteSettingsRef.current?.deletedPortfolioIds || [];
      const isInit = siteSettingsRef.current?.portfolioInitialized || false;

      if (remotePortfolio.length > 0) {
        const filtered = remotePortfolio.filter((item: any) => !deletedIds.includes(item.id?.toString()));
        setContent((prev: any) => ({ ...prev, portfolio: filtered }));
      } else if (isInit) {
        setContent((prev: any) => ({ ...prev, portfolio: [] }));
      } else {
        const filteredDefaults = defaultContent.portfolio.filter((item: any) => !deletedIds.includes(item.id?.toString()));
        setContent((prev: any) => ({ ...prev, portfolio: filteredDefaults }));
      }
    });

    const unsubTestimonials = onSnapshot(testimonialsCol, (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deletedTestimonialIds: string[] = siteSettingsRef.current?.deleted_testimonials_ids || [];
      if (testimonials.length > 0) {
        const filtered = testimonials.filter((t: any) => !deletedTestimonialIds.includes(t.id?.toString()));
        setContent((prev: any) => ({ ...prev, testimonials: filtered }));
      } else {
        const filteredDefaults = defaultContent.testimonials.filter((t: any) => !deletedTestimonialIds.includes(t.id?.toString()));
        setContent((prev: any) => ({ ...prev, testimonials: filteredDefaults }));
      }
    });

    const unsubPosts = onSnapshot(postsCol, (snapshot) => {
      const blogPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deletedPostIds: string[] = siteSettingsRef.current?.deleted_blogPosts_ids || [];
      if (blogPosts.length > 0) {
        const filtered = blogPosts.filter((p: any) => !deletedPostIds.includes(p.id?.toString()));
        setContent((prev: any) => ({ ...prev, blogPosts: filtered }));
      } else {
        const filteredDefaults = defaultContent.blogPosts.filter((p: any) => !deletedPostIds.includes(p.id?.toString()));
        setContent((prev: any) => ({ ...prev, blogPosts: filteredDefaults }));
      }
    });

    return () => {
      unsubSettings();
      unsubServices();
      unsubPortfolio();
      unsubTestimonials();
      unsubPosts();
    };
  }, []);

  const deleteContentItem = (type: string, itemId: string) => {
    setContent((prev: any) => {
      if (!prev || !prev[type]) return prev;
      return {
        ...prev,
        [type]: prev[type].filter((item: any) => item.id?.toString() !== itemId?.toString())
      };
    });
  };

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
    const { services, portfolio, testimonials, blogPosts, ...settings } = newContent;
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
    <ContentContext.Provider value={{ content, updateContent, updateAllContent, deleteContentItem }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);

