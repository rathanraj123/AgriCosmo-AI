import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, Plus, Image as ImageIcon, Send, User, Clock, MoreVertical, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  author?: {
    full_name: string;
    role: string;
  };
}

export default function CommunityPage() {
  const { userName, token, userRole } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', image_url: '' });
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      const response = await api.get<any>('/community/posts');
      if (response && response.items) {
        setPosts(response.items);
      } else if (Array.isArray(response)) {
        setPosts(response);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    try {
      const response = await api.post<Post>('/community/posts', newPost);
      if (response) {
        setPosts([response, ...posts]);
        setNewPost({ title: '', content: '', image_url: '' });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post<any>(`/community/posts/${postId}/like`, {});
      setPosts(posts.map(p => {
        if (p.id === postId) {
          const isLiked = res.status === 'liked';
          return {
            ...p,
            is_liked: isLiked,
            likes_count: p.likes_count + (isLiked ? 1 : -1)
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentContent.trim()) return;
    try {
      await api.post(`/community/posts/${postId}/comments`, { content: commentContent });
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      }));
      setCommentContent('');
      setCommentingOn(null);
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) {
      console.error('Failed to delete post:', e);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Community <span className="gradient-text">Feed</span></h1>
            <p className="text-muted-foreground mt-1">Connect with farmers and researchers worldwide.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gradient-primary rounded-xl px-6 h-11 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Create Post Modal/Sheet would go here, using inline for simplicity */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 glass rounded-2xl p-6 border-primary/20"
            >
              <h3 className="font-bold text-lg mb-4">New Post</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Input 
                  placeholder="Title (e.g. Unusual spots on my Tomato plants)" 
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="rounded-xl"
                />
                <textarea 
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full bg-background border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[120px]"
                />
                <div className="flex gap-4">
                  <Input 
                    placeholder="Image URL (optional)" 
                    value={newPost.image_url}
                    onChange={e => setNewPost({...newPost, image_url: e.target.value})}
                    className="rounded-xl flex-1"
                  />
                  <Button type="submit" className="gradient-primary rounded-xl px-8 h-10">
                    Post
                  </Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)} className="rounded-xl px-6 h-10">
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
           <div className="relative min-w-[200px] flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input placeholder="Search discussions..." className="pl-10 rounded-xl" />
           </div>
           {['All', 'Rice', 'Wheat', 'Tomato', 'Pests', 'Fertilizers'].map(tag => (
             <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary">
               {tag}
             </Badge>
           ))}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Clock className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading your feed...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 && !isCreating && (
              <div className="text-center py-20 glass rounded-3xl">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            )}
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                          {post.author?.full_name?.slice(0, 2).toUpperCase() || post.user_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{post.author?.full_name || `Farmer ${post.user_id.slice(0,4)}`}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {(post.user_id === token?.split('.')[0] || userRole === 'admin') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-accent/30">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`gap-2 rounded-lg ${post.is_liked ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                          <span className="text-xs font-semibold">{post.likes_count}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`gap-2 rounded-lg ${commentingOn === post.id ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                          onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-semibold">{post.comments_count}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground rounded-lg">
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs hidden sm:inline">Share</span>
                      </Button>
                    </div>

                    {/* Quick Comment Input */}
                    {commentingOn === post.id && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Input 
                          placeholder="Write a comment..." 
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="h-9 text-xs rounded-lg"
                        />
                        <Button 
                          size="sm" 
                          className="gradient-primary h-9 rounded-lg"
                          onClick={() => handleComment(post.id)}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
}
