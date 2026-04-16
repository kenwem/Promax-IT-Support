import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle, ChevronRight } from 'lucide-react';
import CommentSection from '../components/CommentSection';
import { siteId } from '../lib/firebase';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content } = useContent();
  const posts = content.blogPosts || [];
  
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!slug || posts.length === 0) return;

    // Try to find by slug
    let foundPost = posts.find((p: any) => p.slug === slug);
    
    // If not found by slug, try by ID (for old URLs)
    if (!foundPost) {
      foundPost = posts.find((p: any) => p.id === slug);
      if (foundPost && foundPost.slug) {
        // Redirect to slug URL for SEO
        navigate(`/blog/${foundPost.slug}`, { replace: true });
        return;
      }
    }

    setPost(foundPost);
    window.scrollTo(0, 0);
  }, [slug, posts, navigate]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Post not found</h2>
          <Link to="/blog" className="text-brand-blue font-bold flex items-center gap-2 justify-center">
            <ArrowLeft size={20} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = post.title;

  const shareOptions = [
    { name: 'Facebook', icon: <Facebook size={18} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'bg-[#1877F2]' },
    { name: 'Twitter', icon: <Twitter size={18} />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, color: 'bg-[#1DA1F2]' },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`, color: 'bg-[#0A66C2]' },
    { name: 'WhatsApp', icon: <MessageCircle size={18} />, url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, color: 'bg-[#25D366]' },
  ];

  return (
    <div className="w-full pt-20 bg-white min-h-screen">
      <Helmet>
        <title>{post.title} | ProMax IT Support</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto max-w-4xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium">
              <ArrowLeft size={20} /> Back to Insights
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-brand-green text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-white/60 text-sm flex items-center gap-1.5">
                <Clock size={14} /> 8 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-8 text-white/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center font-bold">
                  {(post.author || 'A').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{post.author || 'Admin'}</div>
                  <div className="text-xs text-white/60">{post.authorDesignation || 'IT Expert'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-green" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-slate-900 mt-12 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-slate-900 mt-10 mb-5 border-b border-slate-100 pb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-6 text-lg" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-8 space-y-3 text-slate-600" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-8 space-y-3 text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="pl-2" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-brand-blue bg-slate-50 p-8 my-10 italic text-slate-700 rounded-r-2xl" {...props} />
                ),
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-10 rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                th: ({node, ...props}) => <th className="p-4 font-bold text-slate-900 border-b border-slate-200" {...props} />,
                td: ({node, ...props}) => <td className="p-4 text-slate-600 border-b border-slate-100" {...props} />,
                img: ({node, ...props}) => (
                  <img className="rounded-2xl shadow-lg my-12 w-full h-auto object-cover" referrerPolicy="no-referrer" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-brand-blue font-bold hover:text-brand-green underline decoration-2 underline-offset-4 transition-colors" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Share Options */}
          <div className="mt-20 pt-10 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Share this Article</h4>
                <p className="text-slate-500">Help others discover these insights by sharing on your favorite platforms.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${option.color} text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg flex items-center gap-2 px-5`}
                  >
                    {option.icon}
                    <span className="text-sm font-bold hidden sm:inline">{option.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <CommentSection collectionName="posts" docId={post.id} />

          {/* CTA Section */}
          <div className="mt-20 bg-brand-blue rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Need expert IT support for your business?</h3>
              <p className="text-xl text-slate-300 mb-10">
                Our team is ready to help you build a secure, scalable, and efficient technology infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="w-full sm:w-auto bg-brand-green text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-brand-green/20">
                  Get a Free Consultation
                </Link>
                <Link to="/services" className="w-full sm:w-auto bg-white/10 text-white px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-colors backdrop-blur-sm flex items-center gap-2">
                  Explore Services <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
