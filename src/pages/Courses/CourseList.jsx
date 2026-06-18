import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/common/input";
import { CourseCard } from "@/components/ui/CourseCard";
import { EmptyState, FilterTabs, HeroPanel } from "@/components/ui/dashboard";
import { courses } from "@/store/mockData";

const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const tags = ["All", ...Array.from(new Set(courses.map((course) => course.tag)))];

export default function CourseList() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [tag, setTag] = useState("All");
  const [courseMentors, setCourseMentors] = useState({});

  const filtered = courses
    .filter((c) => c.status === "approved")
    .filter((c) => {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q);
    })
    .filter((c) => level === "All" || c.level === level)
    .filter((c) => tag === "All" || c.tag === tag);

  const chooseMentor = (courseId, mentorId) => {
    setCourseMentors((current) => ({ ...current, [courseId]: mentorId }));
  };

  const removeMentor = (courseId) => {
    setCourseMentors((current) => ({ ...current, [courseId]: null }));
  };

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Courses</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Technical Courses</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Learn technical skills from your favourite celebrity AI mentor. Choose or remove the mentor for each course anytime.
        </p>
      </HeroPanel>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 flex items-center gap-1 text-xs text-muted">
          <Filter className="h-3.5 w-3.5" /> Level:
        </span>
        <FilterTabs options={levels} value={level} onChange={setLevel} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 self-center text-xs text-muted">Category:</span>
        <FilterTabs options={tags} value={tag} onChange={setTag} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No courses match your filters" description="Try a broader search or remove one of the filters." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              selectedMentorId={courseMentors[course.id]}
              onMentorChange={chooseMentor}
              onMentorRemove={removeMentor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
