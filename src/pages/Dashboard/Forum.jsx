import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { MessageCircle, Search, PlusCircle, ArrowUp, ThumbsUp, Send, User, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";

const categories = ["All", "Programming", "Web Development", "AI/ML", "Cloud", "DevOps", "Cybersecurity"];

export default function ForumPage() {
  const { forumPosts, addForumPost, addForumReply, upvoteForumPost } = useAuthContext();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePostId, setActivePostId] = useState(null);

  // Compose post states
  const [isComposing, setIsComposing] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeCategory, setComposeCategory] = useState("Programming");
  const [composeContent, setComposeContent] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");

  // Filter posts
  const filteredPosts = forumPosts
    .filter((post) => selectedCategory === "All" || post.category === selectedCategory)
    .filter((post) => {
      const q = search.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeContent.trim()) return;
    addForumPost({
      title: composeTitle,
      category: composeCategory,
      content: composeContent,
    });
    setComposeTitle("");
    setComposeContent("");
    setIsComposing(false);
  };

  const handlePostReply = (postId) => {
    if (!replyText.trim()) return;
    addForumReply(postId, replyText);
    setReplyText("");
  };

  const activePost = forumPosts.find((p) => p.id === activePostId);

  return (
    <div className="space-y-8">
      <HeroPanel>
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Community</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Discussion Forum</h1>
            <p className="mt-2 max-w-xl text-muted">
              Ask questions, discuss lectures with your peers, and get answers from our AI mentors.
            </p>
          </div>
          <Button
            variant={isComposing ? "outline" : "gradient"}
            onClick={() => {
              setIsComposing(!isComposing);
              setActivePostId(null);
            }}
            className="gap-2 shrink-0 self-start md:self-center"
          >
            <PlusCircle className="h-4 w-4" />
            {isComposing ? "Cancel Post" : "Ask a Question"}
          </Button>
        </div>
      </HeroPanel>

      {/* New Post Composer Form */}
      {isComposing && (
        <SectionCard title="Ask a Question" description="Submit your question to the technical community.">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Title / Question</label>
              <Input
                placeholder="What is the difference between SQL and NoSQL databases?"
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Category</label>
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value)}
                  className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Explain Details</label>
              <textarea
                placeholder="Describe your question fully. Include context or code snippets if necessary..."
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsComposing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Post Question
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Main Forum Split Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Category Filters & Discussion Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 4).map((cat) => (
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
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => {
                  setActivePostId(post.id);
                  setIsComposing(false);
                }}
                className={`app-card group cursor-pointer rounded-xl border p-5 transition-all hover:border-upto-blue/30 hover:shadow-lg ${
                  activePostId === post.id
                    ? "border-upto-blue/50 bg-upto-blue/5 shadow-sm"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-[9px] font-black uppercase text-upto-blue">
                      <Tag className="h-2.5 w-2.5" /> {post.category}
                    </span>
                    <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-upto-blue transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      upvoteForumPost(post.id);
                    }}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-muted hover:border-upto-blue hover:text-upto-blue"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{post.upvotes}</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-[10px] text-muted font-bold">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Posted by {post.author} &bull; {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> {post.comments.length} comments
                  </span>
                </div>
              </article>
            ))}
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
                {/* original Post */}
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
                    Asked by {activePost.author} on {activePost.date}
                  </p>
                </div>

                {/* Comments Header */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Replies ({activePost.comments.length})
                  </h4>
                </div>

                {/* Comments Feed */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {activePost.comments.map((comm, idx) => {
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
                            <span className="text-[hsl(var(--foreground))]">{comm.author}</span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-[hsl(var(--foreground))] leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    );
                  })}
                  {activePost.comments.length === 0 && (
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
                      if (e.key === "Enter") handlePostReply(activePost.id);
                    }}
                  />
                  <Button variant="gradient" onClick={() => handlePostReply(activePost.id)}>
                    <Send className="h-3.5 w-3.5" />
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
    </div>
  );
}
