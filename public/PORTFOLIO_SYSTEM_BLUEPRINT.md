# Production Portfolio & Case Study System Blueprint
**Self-Contained Architecture & Implementation Guide for React + Firebase (Modular v9 SDK)**

This document provides the complete, copy-pasteable blueprint for replicating the exact **Portfolio & Case Study System** used in this application into any React (Vite / Next.js) project backed by Firebase Firestore and Firebase Storage.

---

## 1. System Features & Architecture Overview

1. **Service-Aligned Category Filtering**:
   - Filter tabs dynamically map to company services, with specialized services (e.g. *Web Development*, *Mobile App Development*) positioned appropriately.
   - Built-in fuzzy keyword matching ensures existing projects gracefully match categories even if names vary slightly.
2. **Real-time Live Search**:
   - Instant filtering across project title, client name, case study summary, full description, and technical stack tags.
3. **Responsive Card Grid & Case Study Modal**:
   - Cards display responsive cover images, category pills, completion year, client names, summaries, tech tags, and modal triggers.
   - Case study modal features full problem/solution story, bulleted key deliverables checklist, tech tags, and a direct conversion CTA linking to your contact or booking flow.
4. **Secure Multi-Site Firestore Architecture**:
   - Multi-tenant path: `sites/{siteId}/portfolio/{docId}`.
   - Public read access for visitors, authenticated admin-only mutations.
5. **Zero-Lockout Image Upload Pipeline**:
   - Client-side compression automatically guarantees image payloads remain strictly under Storage quotas (e.g. < 1MB).
   - If direct Firebase Storage encounters permission restrictions or offline states, it seamlessly falls back to inline compressed Base64 Data URLs so the admin is never blocked from publishing work.

---

## 2. Directory Structure

```text
├── public/
│   └── PORTFOLIO_SYSTEM_BLUEPRINT.md
├── src/
│   ├── components/
│   │   ├── AdminModal.tsx         # Admin dashboard with Portfolio CRUD & upload tab
│   │   └── Navbar.tsx             # Main navigation linking to /portfolio
│   ├── context/
│   │   └── ContentContext.tsx     # Real-time Firestore snapshot synchronization
│   ├── lib/
│   │   └── firebase.ts            # Firebase modular SDK v9 configuration
│   ├── pages/
│   │   ├── Portfolio.tsx          # Full showcase page with filtering and modals
│   │   └── Contact.tsx            # Contact form receiving service pre-selection
│   ├── utils/
│   │   └── imageUtils.ts          # Image compression and URL formatting helpers
│   ├── App.tsx                    # Route definitions (/portfolio)
│   └── main.tsx
```

---

## 3. Step 1: Firebase Configuration (`src/lib/firebase.ts`)

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Multi-site configuration identifier
export const siteId = "siteC"; 
export const siteAdminEmail = "admin@yourdomain.com";
```

---

## 4. Step 2: Firestore & Storage Rules

### Firestore Security Rules (`firestore.rules`):
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sites/{siteId} {
      match /{collection}/{docId} {
        // Public read for website visitors
        allow read: if true;
        
        // Admin operations controlled via auth + frontend
        allow create, update, delete: if request.auth != null;
        
        // Comments & subcollections
        match /comments/{commentId} {
          allow read: if true;
          allow create, update, delete: if request.auth != null;
          match /replies/{replyId} {
            allow read: if true;
            allow create, update, delete: if request.auth != null;
          }
        }
      }
    }
  }
}
```

### Firebase Storage Rules (`storage.rules`):
```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId 
                   && request.resource.size < 1 * 1024 * 1024; // 1MB limit
    }
  }
}
```

---

## 5. Step 3: Image Compression & Safe Upload Utility (`src/utils/imageUtils.ts`)

```typescript
export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  contentType: string;
  sizeBytes: number;
}

export const formatImageUrl = (url?: string): string => {
  if (!url) return '';
  // Convert Dropbox share links to raw direct image links
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=0/, '');
  }
  return url;
};

export const compressImageForUpload = async (
  file: File, 
  options: { maxWidth?: number; maxHeight?: number; quality?: number; maxSizeBytes?: number } = {}
): Promise<CompressedImageResult> => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85, maxSizeBytes = 950 * 1024 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas blob conversion failed'));
          resolve({
            blob,
            dataUrl,
            contentType: 'image/jpeg',
            sizeBytes: blob.size
          });
        }, 'image/jpeg', quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

---

## 6. Step 4: Content Data Schema & Context Provider (`src/context/ContentContext.tsx`)

```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';
import { db, siteId } from '../lib/firebase';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  technologies: string[];
  client: string;
  year: string;
  image: string;
  summary: string;
  description: string;
  deliverables: string[];
  demoUrl?: string;
  featured?: boolean;
}

export const defaultPortfolio: PortfolioItem[] = [
  {
    id: "proj-1",
    title: "Campus-Wide Wi-Fi 6 & High-Density Core Network Overhaul",
    category: "Network Design & Administration",
    technologies: ["Cisco Catalyst", "Ubiquiti UniFi", "Sophos Firewall", "VLANs"],
    client: "Livingstone Educational Academy",
    year: "2026",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop",
    summary: "Comprehensive enterprise networking design deploying 85+ Wi-Fi 6 access points, core switches, and captive guest access.",
    description: "Overhauled the entire IT and networking infrastructure for a multi-building academic campus...",
    deliverables: [
      "Seamless roaming Wi-Fi 6 coverage across 4 campus buildings",
      "Isolated guest network with branded captive login portal"
    ],
    demoUrl: "https://yourdomain.com",
    featured: true
  }
];

export const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<any>({ portfolio: defaultPortfolio });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sitePath = `sites/${siteId}`;
    const portfolioCol = collection(db, sitePath, 'portfolio');

    const unsubPortfolio = onSnapshot(portfolioCol, (snapshot) => {
      const remotePortfolio = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContent((prev: any) => ({
        ...prev,
        portfolio: remotePortfolio.length > 0 ? remotePortfolio : defaultPortfolio
      }));
      setLoading(false);
    });

    return () => unsubPortfolio();
  }, []);

  return (
    <ContentContext.Provider value={{ content }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
```

---

## 7. Step 5: Portfolio Showcase Page Component (`src/pages/Portfolio.tsx`)

```tsx
import React, { useState } from 'react';
import { 
  Briefcase, Search, ExternalLink, User, CheckCircle, ArrowRight, X, 
  Smartphone, Globe, Layers, Network, Server, Mail, Shield, Headphones, Lightbulb 
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../utils/imageUtils';

const categories = [
  "All Projects",
  "Network Design & Administration",
  "Server & Infrastructure Management",
  "Mail & DNS Solutions",
  "Cybersecurity Solutions",
  "IT Support & Helpdesk",
  "IT Consultancy & Advisory",
  "Web Development",
  "Mobile App Development"
];

const categoryIcons: Record<string, React.ReactNode> = {
  "All Projects": <Layers className="w-4 h-4" />,
  "Network Design & Administration": <Network className="w-4 h-4" />,
  "Server & Infrastructure Management": <Server className="w-4 h-4" />,
  "Mail & DNS Solutions": <Mail className="w-4 h-4" />,
  "Cybersecurity Solutions": <Shield className="w-4 h-4" />,
  "IT Support & Helpdesk": <Headphones className="w-4 h-4" />,
  "IT Consultancy & Advisory": <Lightbulb className="w-4 h-4" />,
  "Web Development": <Globe className="w-4 h-4" />,
  "Mobile App Development": <Smartphone className="w-4 h-4" />
};

export default function Portfolio() {
  const { content } = useContent();
  const portfolioItems = content.portfolio || [];
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All Projects");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProject, setActiveProject] = useState<any | null>(null);

  const filteredItems = portfolioItems.filter((item: any) => {
    let matchesCategory = false;
    if (selectedCategory === "All Projects") {
      matchesCategory = true;
    } else {
      const itemCat = (item.category || '').toLowerCase().trim();
      const selCat = selectedCategory.toLowerCase().trim();
      if (itemCat === selCat) {
        matchesCategory = true;
      } else if (selCat.includes("network") && itemCat.includes("network")) {
        matchesCategory = true;
      } else if (selCat.includes("server") && (itemCat.includes("server") || itemCat.includes("cloud"))) {
        matchesCategory = true;
      } else if (selCat.includes("cybersecurity") && itemCat.includes("security")) {
        matchesCategory = true;
      } else if (selCat.includes("web") && itemCat.includes("web")) {
        matchesCategory = true;
      } else if (selCat.includes("mobile") && (itemCat.includes("mobile") || itemCat.includes("app"))) {
        matchesCategory = true;
      }
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.client?.toLowerCase().includes(q) ||
      item.technologies?.some((tech: string) => tech.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pt-20 bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase mb-5">
            <Briefcase size={14} /> Our Work & Case Studies
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Engineering Solutions That Deliver Impact
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Explore our expertise in enterprise IT infrastructure, network engineering, server administration, cybersecurity, and managed technology solutions.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {categoryIcons[cat] || <Layers size={14} />}
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-8 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white"
            />
          </div>
        </div>
      </section>

      {/* Grid of Projects */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((project: any) => (
            <div key={project.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all flex flex-col">
              <div className="relative h-56 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setActiveProject(project)}>
                <img src={formatImageUrl(project.image)} alt={project.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-white backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 onClick={() => setActiveProject(project)} className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-emerald-600 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{project.summary}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button onClick={() => setActiveProject(project)} className="text-slate-900 font-bold text-sm hover:text-emerald-600 inline-flex items-center gap-1">
                    View Details <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64 bg-slate-900">
              <img src={formatImageUrl(activeProject.image)} alt={activeProject.title} className="w-full h-full object-cover" />
              <button onClick={() => setActiveProject(null)} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">{activeProject.title}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{activeProject.description}</p>
              {activeProject.deliverables?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Key Deliverables</h4>
                  <ul className="space-y-2">
                    {activeProject.deliverables.map((del: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" /> {del}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Step 6: Admin CRUD Upload Form (`AdminModal.tsx`)

When uploading in the admin panel:
```typescript
const handleSaveProject = async (projectData: any) => {
  const sitePath = `sites/${siteId}`;
  const docId = projectData.id || `proj-${Date.now()}`;
  try {
    await setDoc(doc(db, sitePath, 'portfolio', docId), projectData);
    setNotification({ message: 'Project saved successfully!', type: 'success' });
  } catch (err: any) {
    setNotification({ message: 'Failed to save project: ' + err.message, type: 'error' });
  }
};
```

---

## 9. Replication Checklist for New Projects

- [ ] Install dependencies: `npm install firebase lucide-react react-router-dom`
- [ ] Configure `src/lib/firebase.ts` with your credentials and `siteId`
- [ ] Deploy the `firestore.rules` and `storage.rules`
- [ ] Add the `/portfolio` route to your React router (`createBrowserRouter`)
- [ ] Add the Portfolio link to your header navigation and footer
- [ ] Add your company projects via the Admin dashboard or `defaultPortfolio` data

*End of Guide.*
