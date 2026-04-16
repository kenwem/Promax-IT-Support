import React, { useState, useEffect } from 'react';
import { auth, db, siteAdminEmail, siteId } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { MessageSquare, Send, Reply, Trash2, CheckCircle, Eye, EyeOff, LogIn, UserPlus, Mail, Lock, LogOut } from 'lucide-react';

interface CommentSectionProps {
  collectionName: string;
  docId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ collectionName, docId }) => {
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Auth state
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAdmin = user?.email === siteAdminEmail;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const commentsPath = `sites/${siteId}/${collectionName}/${docId}/comments`;
    const q = query(
      collection(db, commentsPath),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        replies: []
      }));
      
      // Fetch replies for each comment
      fetchedComments.forEach((comment, index) => {
        const repliesPath = `${commentsPath}/${comment.id}/replies`;
        const rq = query(collection(db, repliesPath), orderBy('createdAt', 'asc'));
        onSnapshot(rq, (rSnapshot) => {
          const replies = rSnapshot.docs.map(rdoc => ({ id: rdoc.id, ...rdoc.data() }));
          setComments(prev => {
            const updated = [...prev];
            const target = updated.find(c => c.id === comment.id);
            if (target) target.replies = replies;
            return updated;
          });
        });
      });

      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [collectionName, docId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
        setAuthMode('signin');
        return;
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const postComment = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newComment.trim()) return;

    const commentsPath = `sites/${siteId}/${collectionName}/${docId}/comments`;
    await addDoc(collection(db, commentsPath), {
      userId: user.uid,
      userEmail: user.email,
      text: newComment,
      createdAt: serverTimestamp(),
      status: isAdmin ? 'approved' : 'pending'
    });
    setNewComment('');
  };

  const postReply = async (commentId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!replyText.trim()) return;

    const repliesPath = `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}/replies`;
    await addDoc(collection(db, repliesPath), {
      userId: user.uid,
      userEmail: user.email,
      text: replyText,
      createdAt: serverTimestamp(),
      status: isAdmin ? 'approved' : 'pending'
    });
    setReplyText('');
    setReplyTo(null);
  };

  const approveItem = async (commentId: string, replyId?: string) => {
    if (!isAdmin) return;
    const path = replyId 
      ? `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}/replies/${replyId}`
      : `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}`;
    await updateDoc(doc(db, path), { status: 'approved' });
  };

  const deleteItem = async (commentId: string, replyId?: string, itemUserId?: string) => {
    if (user?.uid !== itemUserId && !isAdmin) return;
    const path = replyId 
      ? `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}/replies/${replyId}`
      : `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}`;
    await deleteDoc(doc(db, path));
  };

  const filteredComments = comments.filter(c => c.status === 'approved' || isAdmin || (user && c.userId === user.uid));

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
        <MessageSquare className="text-brand-blue" />
        Comments ({filteredComments.length})
      </h3>

      {/* Comment Input */}
      <div className="mb-10">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none h-32"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={postComment}
            className="bg-brand-blue text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"
          >
            Post Comment <Send size={18} />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {filteredComments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                {comment.userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{comment.userEmail}</span>
                    {comment.status === 'pending' && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Pending Approval</span>
                    )}
                    {comment.userEmail === siteAdminEmail && (
                      <span className="text-[10px] bg-brand-blue text-white px-2 py-0.5 rounded-full font-bold uppercase">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && comment.status === 'pending' && (
                      <button onClick={() => approveItem(comment.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {(isAdmin || user?.uid === comment.userId) && (
                      <button onClick={() => deleteItem(comment.id, undefined, comment.userId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setReplyTo(comment.id)}
                    className="text-sm font-bold text-brand-blue hover:text-brand-green transition-colors flex items-center gap-1.5"
                  >
                    <Reply size={14} /> Reply
                  </button>
                </div>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-6 ml-8 space-y-6 border-l-2 border-slate-100 pl-6">
                    {comment.replies.filter((r: any) => r.status === 'approved' || isAdmin || (user && r.userId === user.uid)).map((reply: any) => (
                      <div key={reply.id} className="group/reply">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold shrink-0 text-xs">
                            {reply.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{reply.userEmail}</span>
                                {reply.status === 'pending' && (
                                  <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                {isAdmin && reply.status === 'pending' && (
                                  <button onClick={() => approveItem(comment.id, reply.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                {(isAdmin || user?.uid === reply.userId) && (
                                  <button onClick={() => deleteItem(comment.id, reply.id, reply.userId)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{reply.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyTo === comment.id && (
                  <div className="mt-6 ml-8 animate-in fade-in slide-in-from-top-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none h-24 text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => postReply(comment.id)}
                        className="bg-brand-blue text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-900 transition-colors"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-2xl font-bold text-slate-900">
                  {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h4>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <Trash2 size={24} />
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {authError && <p className="text-red-500 text-sm font-medium">{authError}</p>}

                <button
                  type="submit"
                  className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-brand-blue/20"
                >
                  {authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google
              </button>

              <div className="mt-8 text-center space-y-2">
                {authMode === 'signin' ? (
                  <>
                    <p className="text-slate-600 text-sm">
                      Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-brand-blue font-bold hover:underline">Sign Up</button>
                    </p>
                    <button onClick={() => setAuthMode('forgot')} className="text-slate-400 text-sm hover:underline">Forgot password?</button>
                  </>
                ) : (
                  <p className="text-slate-600 text-sm">
                    Already have an account? <button onClick={() => setAuthMode('signin')} className="text-brand-blue font-bold hover:underline">Sign In</button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
