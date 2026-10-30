import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin, MessageCircle, ChevronRight, BookOpen } from 'lucide-react';
import CommentSection from '../components/CommentSection';
import { db, siteId } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { formatImageUrl } from '../utils/imageUtils';

function safeFormatDate(date: any): string {
  if (!date) return 'Recently';
  if (typeof date === 'string') {
    return date;
  }
  if (typeof date === 'object' && date && 'seconds' in date) {
    return new Date(date.seconds * 1000).toLocaleDateString('en-GB');
  }
  return String(date);
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content } = useContent();
  const posts = content?.blogPosts || [];
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rawSlug = slug ? String(slug).trim() : '';
  const cleanSlug = decodeURIComponent(rawSlug).replace(/\/+$/, '').toLowerCase();

  useEffect(() => {
    let isMounted = true;

    if (!rawSlug) {
      setIsLoading(false);
      return;
    }

    const resolvePost = async () => {
      setIsLoading(true);

      // Strategy 1: Check in-memory posts from ContentContext
      if (posts && posts.length > 0) {
        // A. Match slug exactly or case-insensitively
        let found = posts.find((p: any) => 
          (p.slug && p.slug.toLowerCase() === cleanSlug) ||
          p.slug === rawSlug
        );

        // B. Match ID (for old URLs redirecting to slug)
        if (!found) {
          found = posts.find((p: any) => p.id === rawSlug || p.id === cleanSlug);
        }

        // C. Match slugified title
        if (!found) {
          found = posts.find((p: any) => {
            const titleSlug = (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return titleSlug === cleanSlug;
          });
        }

        if (found && isMounted) {
          setPost(found);
          setIsLoading(false);
          // Redirect old ID URLs to slug for SEO
          if (found.slug && found.slug !== rawSlug) {
            navigate(`/blog/${found.slug}`, { replace: true });
          }
          window.scrollTo(0, 0);
          return;
        }
      }

      // Strategy 2: Direct Firestore Query (essential for WhatsApp links, cold reloads, external shares)
      try {
        const sitePath = `sites/${siteId}/posts`;

        // 2a. Query by slug
        const qSlug = query(collection(db, sitePath), where('slug', '==', rawSlug));
        let snap = await getDocs(qSlug);

        if (snap.empty && rawSlug !== cleanSlug) {
          const qClean = query(collection(db, sitePath), where('slug', '==', cleanSlug));
          snap = await getDocs(qClean);
        }

        if (!snap.empty && isMounted) {
          const docData = snap.docs[0].data();
          const loaded: any = { id: snap.docs[0].id, ...(docData as any) };
          setPost(loaded);
          setIsLoading(false);
          window.scrollTo(0, 0);
          return;
        }

        // 2b. Lookup by document ID
        const docRef = doc(db, sitePath, rawSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          const docData = docSnap.data();
          const loaded: any = { id: docSnap.id, ...(docData as any) };
          setPost(loaded);
          setIsLoading(false);
          if (loaded.slug && loaded.slug !== rawSlug) {
            navigate(`/blog/${loaded.slug}`, { replace: true });
          }
          window.scrollTo(0, 0);
          return;
        }

        // 2c. Fallback scan all docs in posts collection for case-insensitivity
        const allSnap = await getDocs(collection(db, sitePath));
        let matchFromAll: any = null;
        for (const docItem of allSnap.docs) {
          const data = docItem.data();
          const itemSlug = (data.slug || '').toLowerCase();
          const titleSlug = (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          if (docItem.id === rawSlug || docItem.id === cleanSlug || itemSlug === cleanSlug || titleSlug === cleanSlug) {
            matchFromAll = { id: docItem.id, ...data };
            break;
          }
        }

        if (matchFromAll && isMounted) {
          setPost(matchFromAll);
          setIsLoading(false);
          if (matchFromAll.slug && matchFromAll.slug !== rawSlug) {
            navigate(`/blog/${matchFromAll.slug}`, { replace: true });
          }
          window.scrollTo(0, 0);
          return;
        }

        if (isMounted) {
          setPost(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn("Direct Firestore lookup:", err?.message);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    resolvePost();

    return () => {
      isMounted = false;
    };
  }, [rawSlug, cleanSlug, posts, navigate]);

  if (isLoading) {
    return (
      <div className="w-full pt-20 bg-slate-50 min-h-screen">
        <div className="h-[45vh] min-h-[350px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
          <div className="text-center z-10 px-6">
            <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 font-medium">Loading insight...</p>
          </div>
        </div>
        <div className="container mx-auto px-6 max-w-4xl py-16 space-y-6 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 px-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Article Not Found</h2>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            The article you requested could not be found or may have been moved. Explore our latest technology insights below.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/blog" className="bg-brand-blue text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 justify-center hover:bg-blue-900 transition-colors shadow-lg">
              <ArrowLeft size={18} /> View All Insights
            </Link>
            <Link to="/services" className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-medium flex items-center gap-2 justify-center hover:bg-slate-200 transition-colors">
              Explore Our Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canonicalUrl = window.location.origin + '/blog/' + (post.slug || post.id);
  const shareTitle = post.title || 'ProMax IT Support Insights';

  const shareOptions = [
    { name: 'WhatsApp', icon: <MessageCircle size={18} />, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + '\n\n' + canonicalUrl)}`, color: 'bg-[#25D366]' },
    { name: 'Facebook', icon: <Facebook size={18} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`, color: 'bg-[#1877F2]' },
    { name: 'Twitter', icon: <Twitter size={18} />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareTitle)}`, color: 'bg-[#1DA1F2]' },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(shareTitle)}`, color: 'bg-[#0A66C2]' },
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
          src={formatImageUrl(post.image) || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"} 
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
                {post.category || 'Technology'}
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
                <span>{safeFormatDate(post.date)}</span>
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
