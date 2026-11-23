import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, AlertCircle, RefreshCw, Heart } from "lucide-react";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { PageLoader } from "@/components/common/Spinner";
import { CourseCard } from "@/components/ui/CourseCard";
import { EmptyState, FilterTabs, HeroPanel } from "@/components/ui/dashboard";
import { useApiQuery } from "@/hooks/useApi";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthContext } from "@/store/AuthContext";
import { courses as fallbackCourses, celebrities as fallbackMentors } from "@/store/mockData";
import { courseApi, mentorApi } from "@/api/endpoints";

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CourseList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { wishlistCount, isWishlisted, toggleWishlist } = useWishlist();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [tag, setTag] = useState("All");
  const [courseMentors, setCourseMentors] = useState({});

  const {
    data: apiCourses,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApiQuery(() => courseApi.getAll({ status: "approved" }), []);

  const {
    data: apiMentors,
    loading: mentorsLoading,
  } = useApiQuery(() => mentorApi.getAll(), []);

  const courses = useMemo(() => {
    if (Array.isArray(apiCourses) && apiCourses.length > 0) return apiCourses;
    return fallbackCourses.filter((c) => c.status === "approved");
  }, [apiCourses]);

  const mentorsList = useMemo(() => {
    if (Array.isArray(apiMentors) && apiMentors.length > 0) return apiMentors;
    return fallbackMentors || [];
  }, [apiMentors]);

  const tags = useMemo(() => {
    if (!Array.isArray(courses)) return ["All"];
    return ["All", ...Array.from(new Set(courses.map((c) => c.tag).filter(Boolean)))];
  }, [courses]);

  const filtered = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return courses
      .filter((c) => {
        const q = search.toLowerCase();
        return (
          c.title?.toLowerCase().includes(q) ||
          c.tag?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
      })
      .filter((c) => level === "All" || c.level?.toLowerCase() === level.toLowerCase())
      .filter((c) => tag === "All" || c.tag?.toLowerCase() === tag.toLowerCase());
  }, [courses, search, level, tag]);

  const chooseMentor = (courseId, mentorId) => {
    setCourseMentors((current) => ({ ...current, [courseId]: mentorId }));
  };

  const removeMentor = (courseId) => {
    setCourseMentors((current) => ({ ...current, [courseId]: null }));
  };

  if (coursesLoading || mentorsLoading) {
    return <PageLoader />;
  }

  if (coursesError && courses.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Failed to load courses</h2>
        <p className="mt-2 text-sm text-muted">{coursesError}</p>
        <Button variant="outline" onClick={refetchCourses} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Courses</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Technical Courses</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Learn technical skills from your favourite celebrity AI mentor. Choose or switch the mentor for each course anytime.
        </p>
      </HeroPanel>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search courses by title, tag, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAuthenticated && (
          <Button
            variant="outline"
            onClick={() => navigate("/wishlist")}
            className="gap-2 shrink-0 border-[hsl(var(--border))] hover:border-red-500/40 hover:bg-red-500/10"
            title="View saved courses"
          >
            <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : "text-muted"}`} />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
                {wishlistCount}
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 flex items-center gap-1 text-xs text-muted">
          <Filter className="h-3.5 w-3.5" /> Level:
        </span>
        <FilterTabs options={levels} value={level} onChange={setLevel} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 flex items-center gap-1 text-xs text-muted">Tag:</span>
        <FilterTabs options={tags} value={tag} onChange={setTag} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your filters or search terms to explore available courses."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id || course._id}
              course={course}
              mentors={mentorsList}
              selectedMentorId={courseMentors[course.id || course._id]}
              onMentorChange={chooseMentor}
              onMentorRemove={removeMentor}
              isWishlisted={isWishlisted(course)}
              onWishlistToggle={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
