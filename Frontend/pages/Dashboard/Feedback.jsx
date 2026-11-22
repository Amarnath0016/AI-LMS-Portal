import { useState, useMemo } from "react";
import { Star, Send, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";
import { courseApi, reviewApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function FeedbackPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: coursesData,
    loading: coursesLoading,
  } = useApiQuery(() => courseApi.getAll(), []);

  const courses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : coursesData?.data || [];
  }, [coursesData]);

  // Default to first course once loaded
  const effectiveCourseId = selectedCourseId || (courses.length > 0 ? courses[0]._id || courses[0].id : "");

  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
    isEmpty: reviewsEmpty,
  } = useApiQuery(() => reviewApi.getAll(), []);

  const reviews = useMemo(() => {
    return Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || [];
  }, [reviewsData]);

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      map[String(c._id)] = c.title;
      if (c.id !== undefined) map[String(c.id)] = c.title;
    });
    return map;
  }, [courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please enter a review comment");
    if (!effectiveCourseId) return toast.error("Please select a course");

    setSubmitting(true);
    try {
      await reviewApi.create(effectiveCourseId, { rating, comment });
      toast.success("Review submitted successfully! Thank you for your feedback.");
      setComment("");
      setRating(5);
      refetchReviews();
    } catch (err) {
      toast.error("Failed to submit review: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Reviews</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Feedback &amp; Reviews</h1>
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
                {coursesLoading ? (
                  <p className="text-xs text-muted mt-1">Loading courses...</p>
                ) : (
                  <select
                    value={effectiveCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="mt-1 block h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  >
                    {courses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
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

              <Button type="submit" variant="gradient" disabled={submitting} className="w-full gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </SectionCard>
        </div>

        {/* Reviews Feed */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title="Student Reviews Feed" description="Latest reviews submitted by our student network.">
            {reviewsLoading && (
              <div className="flex h-48 flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
                <p className="text-sm text-muted">Loading reviews...</p>
              </div>
            )}

            {reviewsError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
                <p className="font-semibold text-red-300">Failed to load reviews</p>
                <p className="text-sm text-red-400/80 mt-1">{reviewsError}</p>
                <Button variant="outline" className="mt-4" onClick={refetchReviews}>
                  Retry
                </Button>
              </div>
            )}

            {!reviewsLoading && !reviewsError && (reviewsEmpty || reviews.length === 0) && (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="Be the first student to review a course!"
              />
            )}

            {!reviewsLoading && !reviewsError && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const courseTitle =
                    courseMap[String(rev.courseId)] ||
                    rev.courseTitle ||
                    `Course #${rev.courseId}`;
                  const formattedDate = rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : rev.date || "Recently";

                  return (
                    <div
                      key={rev._id || rev.id}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-extrabold text-upto-blue uppercase tracking-wider">
                            {courseTitle}
                          </h4>
                          <p className="text-xs font-bold text-[hsl(var(--foreground))] mt-1 flex items-center gap-2">
                            {rev.userName || "Student"}
                            <span className="text-[10px] text-muted font-normal">
                              {formattedDate}
                            </span>
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
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
