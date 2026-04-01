import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Heart, MessageCircle, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User } from 'firebase/auth';
import { speltaGramService, SpeltaGramPost, SpeltaGramComment } from '../services/speltagramService';

interface Props {
  user: User;
  isAdmin: boolean;
}

export function SpeltaGramFeed({ user, isAdmin }: Props) {
  const [posts, setPosts] = useState<SpeltaGramPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SpeltaGramPost | null>(null); // For comments modal
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = speltaGramService.subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-text-main">SpeltaGram</h1>
          <p className="text-text-muted">A comunidade SpeltaFit</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-brand hover:bg-brand-hover text-text-inverse p-3 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-3xl border border-border">
          <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-text-main mb-2">Nenhuma postagem ainda</h3>
          <p className="text-text-muted">Seja o primeiro a compartilhar seu treino ou refeição!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              isAdmin={isAdmin}
              onOpenComments={() => setSelectedPost(post)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <CreatePostModal 
            user={user} 
            onClose={() => setIsCreating(false)} 
          />
        )}
        {selectedPost && (
          <CommentsModal 
            post={selectedPost} 
            currentUser={user} 
            isAdmin={isAdmin}
            onClose={() => setSelectedPost(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- POST CARD COMPONENT ---
function PostCard({ post, currentUser, isAdmin, onOpenComments }: { key?: string | number, post: SpeltaGramPost, currentUser: User, isAdmin: boolean, onOpenComments: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = post.likes?.includes(currentUser.uid);
  const canDelete = post.userId === currentUser.uid || isAdmin;

  const handleLike = async () => {
    try {
      await speltaGramService.toggleLike(post.id, currentUser.uid, !!isLiked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja apagar esta postagem?')) {
      try {
        await speltaGramService.deletePost(post.id, post.imageUrl);
      } catch (e) {
        alert('Erro ao deletar postagem.');
      }
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.userPhoto ? (
            <img src={post.userPhoto} alt={post.userName} className="w-10 h-10 rounded-full object-cover border border-border" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
              {post.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-text-main text-sm">{post.userName}</p>
            <p className="text-xs text-text-muted">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-bg-main">
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                <button 
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Apagar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="w-full bg-black aspect-square md:aspect-[4/5] flex items-center justify-center overflow-hidden">
        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={handleLike} className="flex items-center gap-1.5 group">
            <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-text-main group-hover:text-red-500'}`} />
            <span className="font-bold text-text-main">{post.likes?.length || 0}</span>
          </button>
          <button onClick={onOpenComments} className="flex items-center gap-1.5 group">
            <MessageCircle className="w-7 h-7 text-text-main group-hover:text-brand transition-colors" />
          </button>
        </div>

        {/* Tag & Caption */}
        <div className="space-y-2">
          {post.tag && (
            <span className="inline-block px-2 py-1 bg-brand/10 text-brand text-xs font-bold rounded-md">
              {post.tag}
            </span>
          )}
          {post.caption && (
            <p className="text-sm text-text-main">
              <span className="font-bold mr-2">{post.userName}</span>
              {post.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- CREATE POST MODAL ---
function CreatePostModal({ user, onClose }: { user: User, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 10MB.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const imageUrl = await speltaGramService.uploadImage(file, user.uid);
      await speltaGramService.createPost({
        userId: user.uid,
        userName: user.displayName || 'Aluno',
        userPhoto: user.photoURL || undefined,
        imageUrl,
        caption: caption.trim(),
        tag: tag || undefined
      });
      onClose();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Erro ao publicar. Tente novamente.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-main">Nova Postagem</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-bg-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          {/* Image Selection */}
          {!preview ? (
            <div className="w-full aspect-square bg-bg-main border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-2">
                <ImageIcon className="w-8 h-8 text-brand" />
              </div>
              <p className="text-text-main font-medium text-center">Como você quer enviar sua foto?</p>
              
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 bg-surface border border-border hover:border-brand/50 hover:bg-brand/5 rounded-xl py-4 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-6 h-6 text-brand" />
                  <span className="text-sm font-medium text-text-main">Tirar Foto</span>
                </button>
                
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 bg-surface border border-border hover:border-brand/50 hover:bg-brand/5 rounded-xl py-4 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 text-brand" />
                  <span className="text-sm font-medium text-text-main">Galeria</span>
                </button>
              </div>

              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                ref={cameraInputRef}
                onChange={handleFileChange}
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={galleryInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tag Selection */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">O que você está compartilhando?</label>
            <div className="flex flex-wrap gap-2">
              {['Treino Concluído', 'Refeição da Dieta', 'Refeição Livre', 'Evolução', 'Motivação'].map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t === tag ? '' : t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tag === t ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main border border-border hover:border-brand/50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface">
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- COMMENTS MODAL ---
function CommentsModal({ post, currentUser, isAdmin, onClose }: { post: SpeltaGramPost, currentUser: User, isAdmin: boolean, onClose: () => void }) {
  const [comments, setComments] = useState<SpeltaGramComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = speltaGramService.subscribeToComments(post.id, setComments);
    return () => unsubscribe();
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await speltaGramService.addComment(post.id, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Aluno',
        userPhoto: currentUser.photoURL || undefined,
        text: newComment.trim()
      });
      setNewComment('');
    } catch (error: any) {
      console.error('Error in addComment:', error);
      setError('Erro ao enviar comentário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Apagar comentário?')) {
      try {
        await speltaGramService.deleteComment(post.id, commentId);
      } catch (e) {
        setError('Erro ao apagar.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col h-[80vh] sm:h-[600px]"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
          <h2 className="text-lg font-bold text-text-main">Comentários</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-bg-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          {/* Post Caption as first comment */}
          {post.caption && (
            <div className="flex gap-3 pb-4 border-b border-border/50">
              {post.userPhoto ? (
                <img src={post.userPhoto} alt={post.userName} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0 text-xs">
                  {post.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-text-main">
                  <span className="font-bold mr-2">{post.userName}</span>
                  {post.caption}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comments.map(comment => {
              const canDelete = comment.userId === currentUser.uid || post.userId === currentUser.uid || isAdmin;
              return (
                <div key={comment.id} className="flex gap-3 group">
                  {comment.userPhoto ? (
                    <img src={comment.userPhoto} alt={comment.userName} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0 text-xs">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-text-main">
                      <span className="font-bold mr-2">{comment.userName}</span>
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input */}
        <div className="p-3 border-t border-border bg-surface shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="You" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0 text-xs">
                {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <input
              type="text"
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main placeholder:text-text-muted px-2"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
              className="text-brand font-bold text-sm px-2 disabled:opacity-50"
            >
              Publicar
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
