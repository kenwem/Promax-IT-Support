import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle, 
  ArrowRight, 
  X, 
  Smartphone, 
  Globe, 
  Cloud, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Network,
  Server,
  Mail,
  Shield,
  Headphones,
  Lightbulb
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../utils/imageUtils';

// Ordered to follow the exact service hierarchy, with Web & Mobile App Development coming last
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

  // Filter items based on category and search query (with smart fuzzy matching for service aliases)
  const filteredItems = portfolioItems.filter((item: any) => {
    let matchesCategory = false;
    if (selectedCategory === "All Projects") {
      matchesCategory = true;
    } else {
      const itemCat = (item.category || '').toLowerCase().trim();
      const selCat = selectedCategory.toLowerCase().trim();
      
      if (itemCat === selCat) {
        matchesCategory = true;
      } else if (selCat.includes("network") && (itemCat.includes("network") || itemCat.includes("wifi"))) {
        matchesCategory = true;
      } else if (selCat.includes("server") && (itemCat.includes("server") || itemCat.includes("infrastructure") || itemCat.includes("cloud"))) {
        matchesCategory = true;
      } else if (selCat.includes("mail") && (itemCat.includes("mail") || itemCat.includes("dns") || itemCat.includes("email"))) {
        matchesCategory = true;
      } else if (selCat.includes("cybersecurity") && (itemCat.includes("security") || itemCat.includes("cyber") || itemCat.includes("firewall"))) {
        matchesCategory = true;
      } else if (selCat.includes("support") && (itemCat.includes("support") || itemCat.includes("helpdesk"))) {
        matchesCategory = true;
      } else if (selCat.includes("consult") && itemCat.includes("consult")) {
        matchesCategory = true;
      } else if (selCat.includes("web") && (itemCat.includes("web") || itemCat.includes("portal") || itemCat.includes("e-commerce"))) {
        matchesCategory = true;
      } else if (selCat.includes("mobile") && (itemCat.includes("mobile") || itemCat.includes("app") || itemCat.includes("android") || itemCat.includes("ios"))) {
        matchesCategory = true;
      }
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.client?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.technologies?.some((tech: string) => tech.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pt-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00d4b2_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/20 text-brand-green border border-brand-green/30 text-xs font-semibold uppercase tracking-wider mb-5">
              <Briefcase size={14} /> Our Work & Case Studies
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Engineering Solutions That <span className="text-brand-green">Deliver Impact</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              Explore our expertise in enterprise IT infrastructure, network engineering, server administration, cybersecurity, and managed technology solutions designed to strengthen operations, enhance security, and drive business continuity
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-left">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl md:text-3xl font-extrabold text-brand-green">50+</div>
                <div className="text-xs text-slate-300 mt-1">Projects Delivered</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl md:text-3xl font-extrabold text-brand-green">99.9%</div>
                <div className="text-xs text-slate-300 mt-1">Uptime Reliability</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl md:text-3xl font-extrabold text-brand-green">100%</div>
                <div className="text-xs text-slate-300 mt-1">Client Satisfaction</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl md:text-3xl font-extrabold text-brand-green">24/7</div>
                <div className="text-xs text-slate-300 mt-1">Active SLA Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills (Ordered with Web & Mobile at the end) */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    selectedCategory === cat
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {categoryIcons[cat] || <Layers size={14} />}
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box Only (Manage Work button removed for security) */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tech..."
                className="w-full pl-10 pr-8 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Briefcase size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No projects found</h3>
              <p className="text-slate-500 text-sm mb-6">
                No case studies match your current filter or search criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All Projects");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((project: any, index: number) => {
                const imgUrl = formatImageUrl(project.image) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop";
                return (
                  <div
                    key={project.id || index}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                  >
                    {/* Project Image */}
                    <div className="relative h-56 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setActiveProject(project)}>
                      <img
                        src={imgUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-10 max-w-[80%]">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue/90 text-white backdrop-blur-md shadow-md truncate">
                          {categoryIcons[project.category] || <Sparkles size={12} />}
                          <span className="truncate">{project.category}</span>
                        </span>
                      </div>

                      {/* Year badge */}
                      {project.year && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                            {project.year}
                          </span>
                        </div>
                      )}

                      {/* Client Name on Image overlay */}
                      <div className="absolute bottom-3 left-4 right-4 z-10">
                        <div className="text-xs text-brand-green font-medium flex items-center gap-1.5 truncate">
                          <User size={13} className="shrink-0" /> <span className="truncate">{project.client || "Enterprise Client"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 
                          onClick={() => setActiveProject(project)}
                          className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors cursor-pointer leading-snug line-clamp-2"
                        >
                          {project.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {project.summary || project.description}
                        </p>

                        {/* Tech Stack Pills */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {project.technologies.slice(0, 4).map((tech: string, i: number) => (
                              <span 
                                key={i} 
                                className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 4 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                                +{project.technologies.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <button
                          onClick={() => setActiveProject(project)}
                          className="text-brand-blue font-bold text-sm hover:text-brand-green transition-colors inline-flex items-center gap-1"
                        >
                          View Details <ArrowRight size={15} />
                        </button>
                        
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-brand-blue transition-colors inline-flex items-center gap-1 text-xs font-medium"
                          >
                            Demo <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Case Study Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 border border-slate-200">
            {/* Modal Header Image */}
            <div className="relative h-64 md:h-80 bg-slate-900">
              <img
                src={formatImageUrl(activeProject.image) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"}
                alt={activeProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-20"
                aria-label="Close project modal"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green text-slate-950 mb-3 shadow-md">
                  {categoryIcons[activeProject.category] || <Sparkles size={12} />}
                  {activeProject.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {activeProject.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Client</div>
                  <div className="font-bold text-slate-800 mt-0.5">{activeProject.client || "Confidential Enterprise"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Timeline / Year</div>
                  <div className="font-bold text-slate-800 mt-0.5">{activeProject.year || "2025/2026"}</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Category</div>
                  <div className="font-bold text-slate-800 mt-0.5">{activeProject.category}</div>
                </div>
              </div>

              {/* Overview / Story */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Project Overview</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
                  {activeProject.description || activeProject.summary}
                </p>
              </div>

              {/* Key Deliverables */}
              {activeProject.deliverables && activeProject.deliverables.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Key Solutions & Deliverables</h4>
                  <ul className="space-y-2.5">
                    {activeProject.deliverables.map((del: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                        <CheckCircle className="text-brand-green w-5 h-5 shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack */}
              {activeProject.technologies && activeProject.technologies.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Technologies & Architecture</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.technologies.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-brand-blue/10 text-brand-blue font-semibold text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal CTA */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to={`/contact?service=${encodeURIComponent(activeProject.category || activeProject.title)}#contact-form`}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-blue hover:bg-blue-900 text-white rounded-xl font-bold text-sm text-center transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  Start a Similar Project <ArrowRight size={16} />
                </Link>
                
                {activeProject.demoUrl && (
                  <a
                    href={activeProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:border-brand-blue text-slate-700 hover:text-brand-blue rounded-xl font-semibold text-sm text-center transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Visit Live Link <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Banner Section */}
      <section className="py-20 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Have a Project or Ready to Build?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            From enterprise IT networking to custom web and mobile applications, our engineering specialists are prepared to assist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-brand-green hover:bg-emerald-600 text-slate-950 font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request a Free Consultation
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-3.5 rounded-full transition-colors"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
