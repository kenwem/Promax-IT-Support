import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Lock, 
  LayoutDashboard, 
  Server, 
  MessageSquare, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  Key, 
  CheckCircle, 
  MessageCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { auth, storage, db, siteId, siteAdminEmail } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdminModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { content, updateAllContent } = useContent();
  const [formData, setFormData] = useState(content);
  const [activeTab, setActiveTab] = useState('general');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isModerating, setIsModerating] = useState(false);
  
  // Timeout logic
  useEffect(() => {
    if (!user) return;
    
    const timeoutDuration = 30 * 60 * 1000; // 30 minutes
    let timeoutId: any;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        setNotification({ message: 'Session timed out after 30 minutes', type: 'error' });
      }, timeoutDuration);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimeout));
    
    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimeout));
    };
  }, [user]);

  // Fetch all comments for moderation
  useEffect(() => {
    if (!user || activeTab !== 'comments') return;
    
    setIsModerating(true);
    const collections = ['posts', 'editorials', 'products', 'trainings', 'services', 'testimonials'];
    const allComments: any[] = [];
    
    // This is a complex fetch because we don't use collectionGroup
    const fetchComments = async () => {
      try {
        for (const colName of collections) {
          const sitePath = `sites/${siteId}/${colName}`;
          const colRef = collection(db, sitePath);
          const docsSnap = await getDocs(colRef);
          
          for (const docItem of docsSnap.docs) {
            const commentsPath = `${sitePath}/${docItem.id}/comments`;
            const commentsSnap = await getDocs(collection(db, commentsPath));
            
            for (const commentDoc of commentsSnap.docs) {
              const commentData = commentDoc.data();
              allComments.push({
                id: commentDoc.id,
                path: commentsPath,
                parentTitle: docItem.data().title || docItem.data().name || docItem.id,
                collection: colName,
                ...commentData,
                replies: []
              });
              
              // Fetch replies
              const repliesPath = `${commentsPath}/${commentDoc.id}/replies`;
              const repliesSnap = await getDocs(collection(db, repliesPath));
              repliesSnap.docs.forEach(rdoc => {
                allComments.push({
                  id: rdoc.id,
                  path: repliesPath,
                  parentTitle: `Reply to: ${commentData.text.substring(0, 20)}...`,
                  collection: colName,
                  isReply: true,
                  ...rdoc.data()
                });
              });
            }
          }
        }
        setComments(allComments.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      } catch (err) {
        console.error("Error fetching comments for moderation:", err);
      } finally {
        setIsModerating(false);
      }
    };

    fetchComments();
  }, [user, activeTab]);
  
  // New state for list vs edit view
  const [viewState, setViewState] = useState<'list' | 'edit'>('list');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [blogEditTab, setBlogEditTab] = useState<'content' | 'preview'>('content');

  // Custom alerts and confirms (since window.alert/confirm are blocked in iframes)
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, type: string, index: number} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== siteAdminEmail) {
      setNotification({ message: 'Access denied. Only the site administrator can access this panel.', type: 'error' });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setNotification({ message: 'Logged in successfully', type: 'success' });
    } catch (error: any) {
      setNotification({ message: error.message || 'Login failed', type: 'error' });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setNotification({ message: 'Please enter your email address first', type: 'error' });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification({ message: 'Password reset email sent!', type: 'success' });
    } catch (error: any) {
      setNotification({ message: error.message || 'Failed to send reset email', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setNotification({ message: 'Logged out', type: 'success' });
    } catch (error: any) {
      setNotification({ message: 'Logout failed', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isNested: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(field);
    try {
      const storageRef = ref(storage, `site/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (isNested) {
        setEditData((prev: any) => ({ ...prev, [field]: url }));
      } else {
        setFormData((prev: any) => ({ ...prev, [field]: url }));
      }
      setNotification({ message: 'Image uploaded successfully', type: 'success' });
    } catch (error: any) {
      setNotification({ message: 'Upload failed: ' + error.message, type: 'error' });
    } finally {
      setIsUploading(null);
    }
  };

  const handleSave = () => {
    updateAllContent(formData);
    setNotification({ message: 'Changes saved successfully!', type: 'success' });
    setTimeout(() => {
      onClose();
      setNotification(null);
    }, 1500);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setViewState('list');
  };

  // Array management helpers
  const handleEdit = (index: number, item: any) => {
    setEditIndex(index);
    setEditData({ ...item });
    setViewState('edit');
    setBlogEditTab('content');
  };

  const handleAddNew = (type: string) => {
    setEditIndex(-1);
    
    // Set default empty data based on type
    if (type === 'services') {
      setEditData({ id: Date.now(), iconName: 'Server', title: '', desc: '', features: [] });
    } else if (type === 'testimonials') {
      setEditData({ id: Date.now(), name: '', role: '', content: '', rating: 5 });
    } else if (type === 'blogPosts') {
      setEditData({ 
        id: Date.now(), 
        title: '', 
        slug: '', 
        excerpt: '', 
        content: '', 
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ''),
        author: 'Admin', 
        category: 'News', 
        tags: [], 
        image: '', 
        status: 'Draft', 
        featured: false 
      });
    }
    setViewState('edit');
    setBlogEditTab('content');
  };

  const handleDeleteClick = (type: string, index: number) => {
    setConfirmDialog({ isOpen: true, type, index });
  };

  const confirmDelete = async () => {
    if (confirmDialog) {
      const { type, index } = confirmDialog;
      const item = formData[type][index];
      const sitePath = `sites/${siteId}`;
      const collectionName = type === 'blogPosts' ? 'posts' : type;
      
      try {
        await deleteDoc(doc(db, sitePath, collectionName, item.id.toString()));
        setConfirmDialog(null);
        setNotification({ message: 'Item deleted successfully.', type: 'success' });
      } catch (err: any) {
        setNotification({ message: 'Delete failed: ' + err.message, type: 'error' });
      }
    }
  };

  const handleSaveItem = async (type: string) => {
    const sitePath = `sites/${siteId}`;
    const collectionName = type === 'blogPosts' ? 'posts' : type;
    const docId = editData.id?.toString() || Date.now().toString();
    
    try {
      await setDoc(doc(db, sitePath, collectionName, docId), editData);
      setViewState('list');
      setNotification({ message: 'Item saved successfully.', type: 'success' });
    } catch (err: any) {
      setNotification({ message: 'Save failed: ' + err.message, type: 'error' });
    }
  };

  const handleApproveComment = async (comment: any) => {
    try {
      await updateDoc(doc(db, comment.path, comment.id), { status: 'approved' });
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: 'approved' } : c));
      setNotification({ message: 'Comment approved', type: 'success' });
    } catch (err: any) {
      setNotification({ message: 'Approval failed: ' + err.message, type: 'error' });
    }
  };

  const handleDeleteComment = async (comment: any) => {
    try {
      await deleteDoc(doc(db, comment.path, comment.id));
      setComments(prev => prev.filter(c => c.id !== comment.id));
      setNotification({ message: 'Comment deleted', type: 'success' });
    } catch (err: any) {
      setNotification({ message: 'Deletion failed: ' + err.message, type: 'error' });
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: <LayoutDashboard size={18} /> },
    { id: 'services', label: 'Services', icon: <Server size={18} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={18} /> },
    { id: 'blog', label: 'Blog Posts', icon: <FileText size={18} /> },
    { id: 'comments', label: 'Moderation', icon: <MessageCircle size={18} /> }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Lock size={24} className="text-brand-blue" />
            ProMax Admin Panel
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {user && (
            <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 overflow-y-auto shrink-0">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-brand-blue text-white' 
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
            
            {/* Notifications */}
            {notification && (
              <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {notification.message}
              </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
              <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertCircle size={24} />
                    <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                  </div>
                  <p className="text-slate-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors">
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!user ? (
              <div className="max-w-sm mx-auto py-20 px-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors">
                    Login
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-sm text-brand-blue hover:underline font-medium disabled:opacity-50"
                  >
                    {isResetting ? 'Sending...' : 'Forgot Password?'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 h-full">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                  <div className="text-sm text-slate-500">
                    Logged in as: <span className="font-bold text-slate-700">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
                
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                  <div className="space-y-8 max-w-4xl">
                    {/* Branding Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ImageIcon size={20} className="text-brand-green" /> Branding & Media
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={formData.logoUrl || ''}
                                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                                placeholder="External URL or upload"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none text-sm"
                              />
                              <input 
                                type="file" 
                                id="logo-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'logoUrl')}
                              />
                              <button 
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                disabled={isUploading === 'logoUrl'}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
                              >
                                {isUploading === 'logoUrl' ? <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div> : <Plus size={20} />}
                              </button>
                            </div>
                            {formData.logoUrl && (
                              <div className="relative w-32 h-12 bg-slate-50 rounded border border-slate-200 p-2 flex items-center justify-center">
                                <img src={formData.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Hero Background Image</label>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={formData.heroImageUrl || ''}
                                onChange={(e) => setFormData({...formData, heroImageUrl: e.target.value})}
                                placeholder="External URL or upload"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none text-sm"
                              />
                              <input 
                                type="file" 
                                id="hero-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'heroImageUrl')}
                              />
                              <button 
                                onClick={() => document.getElementById('hero-upload')?.click()}
                                disabled={isUploading === 'heroImageUrl'}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
                              >
                                {isUploading === 'heroImageUrl' ? <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div> : <Plus size={20} />}
                              </button>
                            </div>
                            {formData.heroImageUrl && (
                              <div className="relative w-full h-24 bg-slate-50 rounded border border-slate-200 overflow-hidden">
                                <img src={formData.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">About Section Image</label>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={formData.aboutImageUrl || ''}
                                onChange={(e) => setFormData({...formData, aboutImageUrl: e.target.value})}
                                placeholder="External URL or upload"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none text-sm"
                              />
                              <input 
                                type="file" 
                                id="about-image-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'aboutImageUrl')}
                              />
                              <button 
                                onClick={() => document.getElementById('about-image-upload')?.click()}
                                disabled={isUploading === 'aboutImageUrl'}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
                              >
                                {isUploading === 'aboutImageUrl' ? <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div> : <Plus size={20} />}
                              </button>
                            </div>
                            {formData.aboutImageUrl && (
                              <div className="relative w-full h-24 bg-slate-50 rounded border border-slate-200 overflow-hidden">
                                <img src={formData.aboutImageUrl} alt="About preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Why Choose Us Image</label>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={formData.whyChooseUsImageUrl || ''}
                                onChange={(e) => setFormData({...formData, whyChooseUsImageUrl: e.target.value})}
                                placeholder="External URL or upload"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none text-sm"
                              />
                              <input 
                                type="file" 
                                id="why-choose-us-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'whyChooseUsImageUrl')}
                              />
                              <button 
                                onClick={() => document.getElementById('why-choose-us-upload')?.click()}
                                disabled={isUploading === 'whyChooseUsImageUrl'}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
                              >
                                {isUploading === 'whyChooseUsImageUrl' ? <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div> : <Plus size={20} />}
                              </button>
                            </div>
                            {formData.whyChooseUsImageUrl && (
                              <div className="relative w-full h-24 bg-slate-50 rounded border border-slate-200 overflow-hidden">
                                <img src={formData.whyChooseUsImageUrl} alt="Why choose us preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title (Line 1)</label>
                        <input 
                          type="text"
                          value={formData.heroTitle1}
                          onChange={(e) => setFormData({...formData, heroTitle1: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title (Line 2 - Green)</label>
                        <input 
                          type="text"
                          value={formData.heroTitle2}
                          onChange={(e) => setFormData({...formData, heroTitle2: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Hero Subtitle</label>
                      <textarea 
                        value={formData.heroSubtitle}
                        onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">About Us Main Text</label>
                      <textarea 
                        value={formData.aboutText}
                        onChange={(e) => setFormData({...formData, aboutText: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                        <input 
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input 
                          type="text"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                        <input 
                          type="text"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Link</label>
                        <input 
                          type="text"
                          value={formData.whatsapp || ''}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Slogan</label>
                        <input 
                          type="text"
                          value={formData.slogan || ''}
                          onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Year Established</label>
                        <input 
                          type="text"
                          value={formData.yearEstablished || ''}
                          onChange={(e) => setFormData({...formData, yearEstablished: e.target.value})}
                          placeholder="e.g. January 2025"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Copyright Year</label>
                        <input 
                          type="text"
                          value={formData.copyrightYear || ''}
                          onChange={(e) => setFormData({...formData, copyrightYear: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SERVICES TAB */}
                {activeTab === 'services' && viewState === 'list' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Manage Services</h3>
                      <button onClick={() => handleAddNew('services')} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors">
                        <Plus size={18} /> Add New Service
                      </button>
                    </div>
                    {formData.services?.map((service: any, index: number) => (
                      <div key={service.id || index} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-bold text-slate-800">{service.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{service.desc}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <button onClick={() => handleEdit(index, service)} className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick('services', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'services' && viewState === 'edit' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                      <button onClick={() => setViewState('list')} className="text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={24} />
                      </button>
                      <h3 className="text-2xl font-bold text-slate-800">{editIndex === -1 ? 'Add New Service' : 'Edit Service'}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Service Title</label>
                          <input 
                            type="text"
                            value={editData.title || ''}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Icon Name</label>
                          <select 
                            value={editData.iconName || 'Server'}
                            onChange={(e) => setEditData({...editData, iconName: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none bg-white"
                          >
                            <option value="Network">Network (Globe)</option>
                            <option value="Server">Server</option>
                            <option value="Mail">Mail</option>
                            <option value="Shield">Shield (Security)</option>
                            <option value="Headphones">Headphones (Support)</option>
                            <option value="Lightbulb">Lightbulb (Consultancy)</option>
                            <option value="GraduationCap">Graduation Cap (Training)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                        <input 
                          type="text"
                          value={editData.desc || ''}
                          onChange={(e) => setEditData({...editData, desc: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Features (comma separated)</label>
                        <textarea 
                          value={editData.features?.join(', ') || ''}
                          onChange={(e) => setEditData({...editData, features: e.target.value.split(',').map((s: string) => s.trim())})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                          rows={4}
                        />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button onClick={() => handleSaveItem('services')} className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors">
                          Save Service
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TESTIMONIALS TAB */}
                {activeTab === 'testimonials' && viewState === 'list' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Manage Testimonials</h3>
                      <button onClick={() => handleAddNew('testimonials')} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors">
                        <Plus size={18} /> Add New Testimonial
                      </button>
                    </div>
                    {formData.testimonials?.map((testimonial: any, index: number) => (
                      <div key={testimonial.id || index} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{testimonial.role}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <button onClick={() => handleEdit(index, testimonial)} className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick('testimonials', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'testimonials' && viewState === 'edit' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                      <button onClick={() => setViewState('list')} className="text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={24} />
                      </button>
                      <h3 className="text-2xl font-bold text-slate-800">{editIndex === -1 ? 'Add New Testimonial' : 'Edit Testimonial'}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Client Name</label>
                          <input 
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Role/Company</label>
                          <input 
                            type="text"
                            value={editData.role || ''}
                            onChange={(e) => setEditData({...editData, role: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Testimonial Content</label>
                        <textarea 
                          value={editData.content || ''}
                          onChange={(e) => setEditData({...editData, content: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-brand-blue outline-none"
                          rows={4}
                        />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button onClick={() => handleSaveItem('testimonials')} className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors">
                          Save Testimonial
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BLOG TAB */}
                {activeTab === 'blog' && viewState === 'list' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Manage Blog Posts</h3>
                      <button onClick={() => handleAddNew('blogPosts')} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors">
                        <Plus size={18} /> Add New Post
                      </button>
                    </div>
                    {formData.blogPosts?.map((post: any, index: number) => (
                      <div key={post.id || index} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          {post.image && (
                            <img src={post.image} alt="" className="w-16 h-16 object-cover rounded-md shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-800">{post.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {post.status || 'Draft'}
                              </span>
                              <span className="text-sm text-slate-500">{post.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <button onClick={() => handleEdit(index, post)} className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick('blogPosts', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'blog' && viewState === 'edit' && (
                  <div className="bg-[#f8fafc] min-h-full -m-6 p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setViewState('list')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                          <ArrowLeft size={18} /> Back
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800">{editIndex === -1 ? 'New Post' : 'Edit Post'}</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-sm font-medium">{editData.status || 'Draft'}</span>
                        <button onClick={() => handleSaveItem('blogPosts')} className="bg-[#026fc2] hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2 font-medium transition-colors shadow-sm">
                          <Save size={18} /> Save
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-slate-200 mb-6">
                      <button 
                        onClick={() => setBlogEditTab('content')}
                        className={`pb-3 font-medium text-sm ${blogEditTab === 'content' ? 'border-b-2 border-[#026fc2] text-[#026fc2]' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}
                      >
                        Content
                      </button>
                      <button 
                        onClick={() => setBlogEditTab('preview')}
                        className={`pb-3 font-medium text-sm ${blogEditTab === 'preview' ? 'border-b-2 border-[#026fc2] text-[#026fc2]' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}
                      >
                        Preview
                      </button>
                    </div>

                    {blogEditTab === 'content' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Col */}
                      <div className="col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                          <div className="mb-5">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                            <input 
                              type="text" 
                              value={editData.title || ''} 
                              onChange={e => setEditData({...editData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} 
                              className="w-full px-3 py-2 border-2 border-[#026fc2] text-slate-900 rounded-md outline-none" 
                              placeholder="Post title" 
                            />
                          </div>
                          <div className="mb-5">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Slug (URL)</label>
                            <input 
                              type="text" 
                              value={editData.slug || ''} 
                              disabled 
                              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md text-slate-400 outline-none" 
                              placeholder="auto-generated-slug" 
                            />
                          </div>
                          <div className="mb-5">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Cover Image URL</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={editData.image || ''} 
                                onChange={e => setEditData({...editData, image: e.target.value})} 
                                className="flex-1 px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                                placeholder="https://..." 
                              />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id="blog-image-upload" 
                                onChange={(e) => handleFileUpload(e, 'image', true)}
                              />
                              <button 
                                onClick={() => document.getElementById('blog-image-upload')?.click()}
                                disabled={isUploading === 'image'}
                                className="p-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                              >
                                {isUploading === 'image' ? <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div> : <ImageIcon size={20}/>}
                              </button>
                            </div>
                            {editData.image && <img src={editData.image} alt="Cover preview" className="mt-3 w-full h-48 object-cover rounded-md" />}
                          </div>
                          <div className="mb-5">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Excerpt (Short Description)</label>
                            <textarea 
                              value={editData.excerpt || ''} 
                              onChange={e => setEditData({...editData, excerpt: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                              rows={2}
                              placeholder="Brief summary of the post..."
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Content (HTML/Markdown)</label>
                            <textarea 
                              value={editData.content || ''} 
                              onChange={e => setEditData({...editData, content: e.target.value})} 
                              className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-md h-80 font-mono text-sm outline-none resize-y focus:border-[#026fc2]" 
                              placeholder="Write your story here..."
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Right Col */}
                      <div className="space-y-6">
                        {/* Publishing Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Publishing</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                            <select 
                              value={editData.status || 'Draft'} 
                              onChange={e => setEditData({...editData, status: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2] bg-white"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Publish Date</label>
                            <input 
                              type="text" 
                              value={editData.date || ''} 
                              onChange={e => setEditData({...editData, date: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                              placeholder="DD/MM/YYYY, HH:MM AM" 
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input 
                              type="checkbox" 
                              id="featured" 
                              checked={editData.featured || false} 
                              onChange={e => setEditData({...editData, featured: e.target.checked})} 
                              className="w-4 h-4 rounded border-slate-300 text-[#026fc2] focus:ring-[#026fc2]" 
                            />
                            <label htmlFor="featured" className="text-sm font-bold text-slate-700 cursor-pointer">Mark as Featured</label>
                          </div>
                        </div>

                        {/* Taxonomy Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Taxonomy</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                            <select 
                              value={editData.category || ''} 
                              onChange={e => setEditData({...editData, category: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2] bg-white"
                            >
                              <option value="Destinations">Destinations</option>
                              <option value="Security">Security</option>
                              <option value="Networking">Networking</option>
                              <option value="Cloud">Cloud</option>
                              <option value="Business">Business</option>
                              <option value="Tech Tips">Tech Tips</option>
                              <option value="News">News</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (comma separated)</label>
                            <input 
                              type="text" 
                              value={editData.tags?.join(', ') || ''} 
                              onChange={e => setEditData({...editData, tags: e.target.value.split(',').map((t: string)=>t.trim())})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                            />
                          </div>
                        </div>

                        {/* Author Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Author Info</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Author Name</label>
                            <input 
                              type="text" 
                              value={editData.author || ''} 
                              onChange={e => setEditData({...editData, author: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                              placeholder="e.g. Shehu Mohammed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Designation / Position</label>
                            <input 
                              type="text" 
                              value={editData.authorDesignation || ''} 
                              onChange={e => setEditData({...editData, authorDesignation: e.target.value})} 
                              className="w-full px-3 py-2 border border-slate-200 text-slate-900 rounded-md outline-none focus:border-[#026fc2]" 
                              placeholder="e.g. IT Expert"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
                        {editData.image && (
                          <img src={editData.image} alt={editData.title} className="w-full h-[400px] object-cover rounded-xl mb-8" />
                        )}
                        <div className="flex items-center gap-4 mb-6">
                          <span className="bg-[#026fc2]/10 text-[#026fc2] px-3 py-1 rounded-full text-sm font-medium">
                            {editData.category || 'Uncategorized'}
                          </span>
                          <span className="text-slate-500 text-sm">{editData.date || 'No date'}</span>
                          <span className="text-slate-500 text-sm">By {editData.author || 'Admin'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-6">{editData.title || 'Untitled Post'}</h1>
                        {editData.tags && editData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {editData.tags.map((tag: string, i: number) => (
                              <span key={i} className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">#{tag}</span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
                            {(editData.author || 'A').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{editData.author || 'Admin'}</div>
                            <div className="text-sm text-slate-500">{editData.authorDesignation || 'Site Administrator'}</div>
                          </div>
                        </div>

                        <div className="prose prose-lg max-w-none text-slate-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {editData.content || 'Write your story here...'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODERATION TAB */}
                {activeTab === 'comments' && (
                  <div className="space-y-6 max-w-5xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Comment Moderation</h3>
                      <button 
                        onClick={() => setActiveTab('comments')} // Refresh
                        className="text-brand-blue font-bold text-sm hover:underline"
                      >
                        Refresh List
                      </button>
                    </div>

                    {isModerating ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue mb-4"></div>
                        <p className="text-slate-500 font-medium">Scanning all collections for comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 text-lg">No comments found across any collection.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                  {comment.userEmail.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{comment.userEmail}</span>
                                    {comment.isReply && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">Reply</span>}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${comment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {comment.status}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    On <span className="text-brand-blue font-medium">{comment.parentTitle}</span> ({comment.collection})
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {comment.status === 'pending' && (
                                  <button 
                                    onClick={() => handleApproveComment(comment)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                  >
                                    <CheckCircle size={18} /> Approve
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteComment(comment)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                >
                                  <Trash2 size={18} /> Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                              "{comment.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Global Modal Footer (hidden in edit views) */}
        {user && viewState === 'list' && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button onClick={handleSave} className="bg-brand-green hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
              <Save size={20} /> Save All Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
