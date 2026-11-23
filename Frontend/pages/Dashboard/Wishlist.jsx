import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, Users, Zap, Trash2, Loader2, AlertCircle, ArrowRight, BookOpen, Lock, Check } from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";
import { formatCurrency } from "@/utils";
import { toast } from "sonner";
import { wishlistApi, courseApi, enrollmentApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";
import { useWishlist } from "@/hooks/useWishlist";
import { useSubscription } from "@/hooks/useSubscription";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { refetchWishlist: syncGlobalWishlist } = useWishlist();
  const { hasAccess, isSubscribedToCourse } = useSubscription();
  const [enrollingId, setEnrollingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const {
    data: wishlistData,
    loading: wishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
    isEmpty,
  } = useApiQuery(() => wishlistApi.getAll(), []);

  const {
    data: enrollmentsData,
    refetch: refetchEnrollments,
  } = useApiQuery(() => enrollmentApi.getMyEnrollments(), []);

  const savedCourses = useMemo(() => {
    return Array.isArray(wishlistData) ? wishlistData : wishlistData?.data || [];
  }, [wishlistData]);

  const enrolledCourseIds = useMemo(() => {
    const list = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || [];
    return new Set(list.map((e) => String(e.courseId || e.course?._id || e.course?.id)));
  }, [enrollmentsData]);

  const handleRemove = async (e, course) => {
    if (e?.stopPropagation) e.stopPropagation();
    const id = course._id || course.id;
    setRemovingId(id);
    try {
      await wishlistApi.remove(id);
      toast.success(`Removed "${course.title}" from wishlist`);
      refetchWishlist();
      syncGlobalWishlist();
    } catch (err) {
      toast.error("Failed to remove: " + (err.response?.data?.message || err.message));
    } finally {
      setRemovingId(null);
    }
  };

  const handleEnroll = async (e, course) => {
    if (e?.stopPropagation) e.stopPropagation();
    const id = course._id || course.id;
    setEnrollingId(id);
    try {
      await courseApi.enroll(id);
      toast.success(`Successfully enrolled in "${course.title}"!`);
      refetchWishlist();
      syncGlobalWishlist();
      refetchEnrollments();
    } catch (err) {
      toast.error("Enrollment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Saved Courses</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">My Wishlist</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Save courses here that you are planning to learn later. Click &ldquo;Quick Enroll&rdquo; to start learning instantly!
        </p>
      </HeroPanel>

      <SectionCard title={`Saved Courses (${savedCourses.length})`}>
        {wishlistLoading && (
          <div className="flex h-48 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
            <p className="text-sm text-muted">Loading your saved courses...</p>
          </div>
        )}

        {wishlistError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <p className="font-semibold text-red-300">Failed to load wishlist</p>
            <p className="text-sm text-red-400/80 mt-1">{wishlistError}</p>
            <Button variant="outline" className="mt-4" onClick={refetchWishlist}>
              Retry
            </Button>
          </div>
        )}

        {!wishlistLoading && !wishlistError && (isEmpty || savedCourses.length === 0) && (
          <div className="py-8 text-center">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Explore our Course Catalog and save courses you find interesting for later."
            />
            <div className="mt-6 flex justify-center">
              <Button
                variant="gradient"
                onClick={() => navigate("/courses")}
                className="gap-2 px-6"
              >
                <BookOpen className="h-4 w-4" /> Browse Course Catalog
              </Button>
            </div>
          </div>
        )}

        {!wishlistLoading && !wishlistError && savedCourses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedCourses.map((course) => {
              const courseId = course._id || course.id;
              const isAlreadyEnrolled =
                enrolledCourseIds.has(String(courseId)) ||
                enrolledCourseIds.has(String(course.id)) ||
                enrolledCourseIds.has(String(course._id));

              return (
                <div
                  key={courseId}
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="app-card group relative cursor-pointer overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all hover:-translate-y-1 hover:border-upto-blue/30 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  {/* Card Header Background */}
                  <div className="h-28 bg-gradient-to-r from-upto-blue/10 to-indigo-500/10 p-4 relative">
                    <span className="rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-bold text-upto-blue">
                      {course.tag || "Course"}
                    </span>
                    <button
                      type="button"
                      disabled={removingId === courseId}
                      onClick={(e) => handleRemove(e, course)}
                      className="absolute right-4 top-4 rounded-full bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removingId === courseId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-upto-orange">
                      {course.league || "Professional Track"}
                    </p>
                    <h3 className="mt-1 text-sm font-black text-[hsl(var(--foreground))] line-clamp-2 min-h-[40px] leading-snug group-hover:text-upto-blue transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {course.mentor ? (
                        <>with <span className="text-upto-blue font-medium">{course.mentor.name} AI</span></>
                      ) : (
                        <span className="font-medium text-muted">AI Mentor Curriculum</span>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Meta stats */}
                    <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3 text-[10px] text-muted font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration || "4 weeks"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {course.enrolled || 0}
                      </span>
                      <span className="flex items-center gap-1 text-upto-orange">
                        <Zap className="h-3 w-3" /> {course.xp || 500} XP
                      </span>
                    </div>

                    {/* Price and Action Button */}
                    <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
                      <div>
                        {isSubscribedToCourse(course) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                            <Check className="h-3 w-3" /> Subscribed ✓
                          </span>
                        ) : course.accessType === "free" || (!course.accessType && (!course.price || course.price === 0)) ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black tracking-wider text-emerald-400 border border-emerald-500/30">
                            FREE
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/subscribe?course=${courseId}`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-upto-orange/15 px-2.5 py-1 text-xs font-bold text-upto-orange border border-upto-orange/40 hover:bg-upto-orange hover:text-white transition-all shadow-sm"
                            title="Subscribe to unlock this course"
                          >
                            <Lock className="h-3 w-3" />
                            {course.price ? `₹${Number(course.price).toLocaleString("en-IN")} - Subscribe` : "Subscribe"}
                          </button>
                        )}
                      </div>
                      {isAlreadyEnrolled ? (
                        <span className="rounded-lg bg-upto-green/10 px-3.5 py-1.5 text-xs font-bold text-upto-green">
                          Enrolled
                        </span>
                      ) : (course.accessType === "paid" || (course.price > 0 && course.accessType !== "free")) && !hasAccess(course) ? (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/subscribe?course=${courseId}`);
                          }}
                          className="px-3 py-1.5 text-xs font-bold gap-1"
                        >
                          <Lock className="h-3 w-3" /> Unlock
                        </Button>
                      ) : (
                        <Button
                          variant="gradient"
                          size="sm"
                          disabled={enrollingId === courseId}
                          onClick={(e) => handleEnroll(e, course)}
                          className="px-4 py-1.5"
                        >
                          {enrollingId === courseId ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Enrolling...
                            </>
                          ) : (
                            "Quick Enroll"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
