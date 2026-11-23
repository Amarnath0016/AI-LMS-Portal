import { useState, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { forumApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function ForumModeration() {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: postsData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => forumApi.getAll(), []);

  const posts = useMemo(() => {
    return Array.isArray(postsData) ? postsData : postsData?.data || [];
  }, [postsData]);

  const filtered = useMemo(() => {
    return posts.filter((p) =>
      !search ||
      [p.title, p.content, p.category, p.author?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [posts, search]);

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this forum post? This action cannot be undone.")) {
      return;
    }
    try {
      setDeletingId(id);
      await forumApi.delete(id);
      toast.success("Forum post deleted successfully.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete forum post.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Community Governance
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Forum Moderation
            </h1>
            <p className="mt-1 text-sm text-muted">
              Moderate learner discussions, remove inappropriate content, and enforce community standards.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              placeholder="Search posts, topics, or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </HeroPanel>

      {loading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading forum posts...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">Failed to load forum posts.</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={CheckCircle}
          title="All clear"
          description="No forum posts found or all posts match community guidelines."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((post) => {
            const postId = post._id || post.id;
            const isDeleting = deletingId === postId;

            return (
              <div
                key={postId}
                className="app-card flex flex-col justify-between gap-4 rounded-xl p-5 md:flex-row md:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-upto-blue">
                      {post.category || "General"}
                    </span>
                    <span className="text-xs text-muted">
                      • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                    {post.title}
                  </h3>

                  <p className="text-xs text-muted line-clamp-2 max-w-2xl">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted pt-1">
                    <span>Author: <strong className="text-[hsl(var(--foreground))]">{post.author?.name || "Learner"}</strong></span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.upvotes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments?.length || 0} comments
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => handleDeletePost(postId)}
                  className="text-red-400 hover:text-red-300 self-start md:self-center"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
