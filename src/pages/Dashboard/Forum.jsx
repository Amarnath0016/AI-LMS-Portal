import { useState, useMemo } from "react";
import { MessageCircle, Search, PlusCircle, ArrowUp, Send, User, Sparkles, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";
import { forumApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";
import { useAuthContext } from "@/store/AuthContext";
import { toast } from "sonner";

const categories = ["All", "Programming", "Web Development", "AI/ML", "Cloud", "DevOps", "Cybersecurity"];

export default function ForumPage() {
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Compose post states
  const [isComposing, setIsComposing] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeCategory, setComposeCategory] = useState("Programming");
  const [composeContent, setComposeContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const {
    data: forumData,
    loading,
    error,
    refetch,
  } = useApiQuery(
    () =>
      forumApi.getAll(
        selectedCategory !== "All" ? { category: selectedCategory } : {}
      ),
    [selectedCategory]
  );

  const forumPosts = useMemo(() => {
    return Array.isArray(forumData) ? forumData : forumData?.data || [];
  }, [forumData]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return forumPosts
      .filter((post) => selectedCategory === "All" || post.category === selectedCategory)
      .filter((post) => {
        const q = search.toLowerCase();
        return (
          post.title?.toLowerCase().includes(q) ||
          post.content?.toLowerCase().includes(q) ||
          post.category?.toLowerCase().includes(q)
        );
      });
  }, [forumPosts, selectedCategory, search]);

  const activePost = useMemo(() => {
    if (!forumPosts.length) return null;
    if (!selectedPostId) return forumPosts[0];
    return (
      forumPosts.find((p) => (p._id || p.id) === selectedPostId) ||
      forumPosts[0]
    );
  }, [forumPosts, selectedPostId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeContent.trim()) {
      return toast.error("Please provide title and content");
    }

    setSubmittingPost(true);
    try {
      await forumApi.create({
        title: composeTitle.trim(),
        category: composeCategory,
        content: composeContent.trim(),
      });
      toast.success("Discussion posted to community forum!");
      setComposeTitle("");
      setComposeContent("");
      setIsComposing(false);
      refetch();
    } catch (err) {
      toast.error("Failed to post: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handlePostReply = async (postId) => {
    if (!replyText.trim()) return toast.error("Please enter a reply");

    setSubmittingReply(true);
    try {
      await forumApi.addComment(postId, { content: replyText.trim() });
      toast.success("Reply added!");
      setReplyText("");
      refetch();
    } catch (err) {
      toast.error("Failed to reply: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpvote = async (post, e) => {
    e.stopPropagation();
    const id = post._id || post.id;
    try {
      await forumApi.upvote(id);
      refetch();
    } catch (err) {
      toast.error("Could not upvote: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePost = async (post, e) => {
    e.stopPropagation();
    const id = post._id || post.id;
    if (!window.confirm("Are you sure you want to delete this discussion post?")) return;
    try {
      await forumApi.delete(id);
      toast.success("Post deleted");
      if (selectedPostId === id) setSelectedPostId(null);
      refetch();
    } catch (err) {
      toast.error("Failed to delete post: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Community</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Discussion Forum</h1>
            <p className="mt-2 max-w-xl text-muted">
              Connect with fellow learners, ask technical questions, and get assistance from AI Mentors.
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => setIsComposing((prev) => !prev)}
            className="gap-2 shrink-0 self-start md:self-center"
          >
            <PlusCircle className="h-4 w-4" /> {isComposing ? "Cancel Post" : "Ask Question"}
          </Button>
        </div>
      </HeroPanel>

      {/* Compose Form Modal/Drawer */}
      {isComposing && (
        <SectionCard title="Start a New Discussion" description="Ask a question or share knowledge with the cohort.">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Title</label>
                <Input
                  placeholder="e.g. How does backpropagation compute gradients in PyTorch?"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Category</label>
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value)}
                  className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Details / Code Snippet</label>
              <textarea
                placeholder="Describe your question or share your code..."
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsComposing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm" disabled={submittingPost}>
                {submittingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Discussion"}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-upto-blue text-white"
                  : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {loading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading forum discussions...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load forum</p>
          <p className="text-sm text-red-400/80 mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Discussion List & Active Thread Grid */}
      {!loading && !error && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Side: Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const postId = post._id || post.id;
                const isSelected = (activePost?._id || activePost?.id) === postId;
                const isAuthorOrAdmin =
                  user && (user.role === "admin" || user._id === post.userId || user.id === post.userId || user.name === post.author);
                const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
                const formattedDate = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : post.date || "Recent";

                return (
                  <article
                    key={postId}
                    onClick={() => setSelectedPostId(postId)}
                    className={`app-card cursor-pointer rounded-xl border p-5 transition-all hover:border-upto-blue/40 ${
                      isSelected
                        ? "border-upto-blue bg-upto-blue/5 shadow-sm"
                        : "border-[hsl(var(--border))]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-block rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-[10px] font-bold uppercase text-upto-orange">
                          {post.category || "General"}
                        </span>
                        <h3 className="text-sm font-black text-[hsl(var(--foreground))] hover:text-upto-blue transition-colors">
                          {post.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleUpvote(post, e)}
                          className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2.5 py-1.5 text-xs text-muted hover:border-upto-blue hover:text-upto-blue transition-all"
                        >
                          <ArrowUp className="h-4 w-4" />
                          <span className="text-[10px] font-bold">{post.upvotes || 0}</span>
                        </button>
                        {isAuthorOrAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleDeletePost(post, e)}
                            className="p-1.5 text-muted hover:text-red-400 rounded transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-[10px] text-muted font-bold">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Posted by {post.author || "Student"} &bull; {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {commentsCount} comments
                      </span>
                    </div>
                  </article>
                );
              })}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 rounded-lg border border-dashed border-[hsl(var(--border))]">
                  <MessageCircle className="mx-auto h-8 w-8 text-muted/60" />
                  <h4 className="mt-2 text-sm font-bold text-[hsl(var(--foreground))]">No discussions found</h4>
                  <p className="text-xs text-muted">Be the first to ask a question in this category!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Thread Detail / Active Comments */}
          <div className="space-y-6">
            {activePost ? (
              <SectionCard
                title={
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <MessageCircle className="h-4.5 w-4.5 text-upto-blue" />
                    Discussion Thread
                  </span>
                }
              >
                <div className="space-y-4">
                  {/* Original Post */}
                  <div className="border-b border-[hsl(var(--border))] pb-4 space-y-2">
                    <span className="inline-block rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-[9px] font-black uppercase text-upto-blue">
                      {activePost.category}
                    </span>
                    <h3 className="text-base font-black text-[hsl(var(--foreground))] leading-snug">
                      {activePost.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-wrap">
                      {activePost.content}
                    </p>
                    <p className="text-[10px] text-muted font-bold mt-2">
                      Asked by {activePost.author || "Student"}
                    </p>
                  </div>

                  {/* Comments Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Replies ({activePost.comments?.length || 0})
                    </h4>
                  </div>

                  {/* Comments Feed */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {(activePost.comments || []).map((comm, idx) => {
                      const isAi = comm.author === "AI Mentor";
                      return (
                        <div
                          key={idx}
                          className={`rounded-lg p-3 ${
                            isAi
                              ? "bg-upto-blue/10 border border-upto-blue/20"
                              : "bg-[hsl(var(--surface))] border border-[hsl(var(--border))]"
                          }`}
                        >
                          <p className="flex items-center gap-1.5 text-[10px] font-bold">
                            {isAi ? (
                              <span className="flex items-center gap-1 text-upto-blue">
                                <Sparkles className="h-3 w-3" /> AI Mentor
                              </span>
                            ) : (
                              <span className="text-[hsl(var(--foreground))]">{comm.author || "Learner"}</span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-[hsl(var(--foreground))] leading-relaxed">
                            {comm.content}
                          </p>
                        </div>
                      );
                    })}
                    {(!activePost.comments || activePost.comments.length === 0) && (
                      <p className="text-xs text-muted text-center py-4">No replies yet. Start the conversation!</p>
                    )}
                  </div>

                  {/* Reply Form */}
                  <div className="border-t border-[hsl(var(--border))] pt-4 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePostReply(activePost._id || activePost.id);
                      }}
                    />
                    <Button
                      variant="gradient"
                      disabled={submittingReply}
                      onClick={() => handlePostReply(activePost._id || activePost.id)}
                    >
                      {submittingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </SectionCard>
            ) : (
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center text-muted">
                <MessageCircle className="mx-auto h-8 w-8 opacity-40 mb-3" />
                <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">No Thread Selected</h4>
                <p className="text-xs mt-1">Select a discussion topic from the feed to view replies, upvote, and comment.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
