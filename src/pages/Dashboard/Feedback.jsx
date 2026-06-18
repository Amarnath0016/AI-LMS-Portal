import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { courses } from "@/store/mockData";
import { Star, MessageSquare, Plus, ThumbsUp, Send } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";

export default function FeedbackPage() {
  const { reviews, submitReview } = useAuthContext();
  
  // Review form states
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 1);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    submitReview(selectedCourseId, rating, comment);
    setComment("");
    setRating(5);
  };

  const getCourseTitle = (courseId) => {
    const match = courses.find((c) => c.id === Number(courseId));
    return match ? match.title : `Course #${courseId}`;
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Reviews</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Feedback & Reviews</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Share your learning experiences, rate AI mentors, and read course feedback submitted by other student scholars.
        </p>
      </HeroPanel>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Submit Review Form */}
        <div className="lg:col-span-1 space-y-8">
          <SectionCard title="Submit a Review" description="Your feedback helps us and other students immensely.">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">Course Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-muted transition-colors hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          (hoverRating || rating) >= star
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Comments / Review</label>
                <textarea
                  placeholder="Tell us what you liked, what can be improved, or how the AI mentor supported you..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  required
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full gap-2">
                <Send className="h-4 w-4" /> Submit Feedback
              </Button>
            </form>
          </SectionCard>
        </div>

        {/* Reviews Feed */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title="Student Reviews Feed" description="Latest reviews submitted by our student network.">
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-upto-blue uppercase tracking-wider">
                        {getCourseTitle(rev.courseId)}
                      </h4>
                      <p className="text-xs font-bold text-[hsl(var(--foreground))] mt-1 flex items-center gap-2">
                        {rev.userName}
                        <span className="text-[10px] text-muted font-medium font-normal">{rev.date}</span>
                      </p>
                    </div>

                    {/* Star Rating display */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4.5 w-4.5 ${
                            rev.rating >= star
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed italic bg-[hsl(var(--card))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-muted text-center py-6">No reviews submitted yet.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
