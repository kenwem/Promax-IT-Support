import React from 'react';
import { Calendar, User, ArrowRight, Tag, Clock } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const Blog = () => {
  const { content } = useContent();
  const posts = content.blogPosts || [];

  // Separate featured post (first one marked featured, or just the first post)
  const featuredPost = posts.find((p: any) => p.featured) || posts[0];
  const regularPosts = posts.filter((p: any) => p.id !== featuredPost?.id);

  const categories = ["Security", "Networking", "Cloud", "Business", "Tech Tips", "News"];

  return (
    <div className="w-full pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-brand-blue text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">Our <span className="text-brand-green">Insights</span></h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
            Discover the latest trends, expert tips, and news from the forefront of technology and IT support.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-1 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">Featured Article</h2>
              </div>
              <article className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row group cursor-pointer border border-slate-100">
                <div className="lg:w-1/2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-blue/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover min-h-[400px] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                      {featuredPost.category}
                    </span>
                  </div>
                </div>
                <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-6 text-sm text-slate-500 mb-6 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={16} className="text-brand-blue" /> {featuredPost.date}</span>
                    <span className="flex items-center gap-2"><User size={16} className="text-brand-blue" /> {featuredPost.author}</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-brand-blue transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-auto">
                    <a href="#" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-blue transition-colors group-hover:gap-4">
                      Read Article <ArrowRight size={18} />
                    </a>
                  </div>
                </div>
              </article>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-1 bg-brand-blue rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">Latest Posts</h2>
          </div>

          {/* Grid of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post: any) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group border border-slate-100 hover:-translate-y-1">
                <div className="relative overflow-hidden h-60">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-brand-blue text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date.split(',')[0]}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> 5 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{post.author}</span>
                    </div>
                    <a href="#" className="text-brand-blue font-bold hover:text-brand-green transition-colors p-2 rounded-full hover:bg-slate-50">
                      <ArrowRight size={20} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Blog;
