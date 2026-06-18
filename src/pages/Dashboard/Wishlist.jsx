import { useAuthContext } from "@/store/AuthContext";
import { courses } from "@/store/mockData";
import { Heart, BookOpen, Clock, Users, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";
import { formatCurrency } from "@/utils";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, enrollCourse, courseProgress } = useAuthContext();

  // Find saved course objects from mock courses
  const savedCourses = courses.filter((c) => wishlist.includes(c.id));

  const handleEnroll = (courseId) => {
    enrollCourse(courseId);
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
        {savedCourses.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Explore our Course Catalog and save courses you find interesting for later."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedCourses.map((course) => {
              const isAlreadyEnrolled = courseProgress[course.id] !== undefined;

              return (
                <div
                  key={course.id}
                  className="app-card group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all hover:-translate-y-1 hover:border-upto-blue/30 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  {/* Card Header Background */}
                  <div className="h-28 bg-gradient-to-r from-upto-blue/10 to-indigo-500/10 p-4 relative">
                    <span className="rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-bold text-upto-blue">
                      {course.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(course.id)}
                      className="absolute right-4 top-4 rounded-full bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-upto-orange">
                      {course.league}
                    </p>
                    <h3 className="mt-1 text-sm font-black text-[hsl(var(--foreground))] line-clamp-2 min-h-[40px] leading-snug group-hover:text-upto-blue transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Meta stats */}
                    <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3 text-[10px] text-muted font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {course.enrolled}
                      </span>
                      <span className="flex items-center gap-1 text-upto-orange">
                        <Zap className="h-3 w-3" /> {course.xp} XP
                      </span>
                    </div>

                    {/* Price and Action Button */}
                    <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
                      <span className="text-sm font-black text-[hsl(var(--foreground))]">
                        {course.price === 0 ? "Freemium" : formatCurrency(course.price)}
                      </span>
                      {isAlreadyEnrolled ? (
                        <span className="rounded-lg bg-upto-green/10 px-3.5 py-1.5 text-xs font-bold text-upto-green">
                          Enrolled
                        </span>
                      ) : (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          className="px-4 py-1.5"
                        >
                          Quick Enroll
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
