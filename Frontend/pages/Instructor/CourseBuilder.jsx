import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Paperclip,
  FileText,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Upload,
  BookOpen,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { instructorApi, mentorApi } from "@/api/endpoints";

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [course, setCourse] = useState({
    title: "",
    description: "",
    tag: "Programming",
    league: "Python League",
    level: "Beginner",
    duration: "10h",
    accessType: "free",
    price: 0,
    xp: 1000,
    mentorId: 1,
    status: "draft",
    modules: [],
    lessons: [],
    rejectionReason: "",
  });

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active lesson editor state
  const [editingLesson, setEditingLesson] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // AI draft generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiObjectives, setAiObjectives] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Student preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load mentors
  useEffect(() => {
    mentorApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMentors(list);
      })
      .catch((err) => console.error("Failed to load mentors:", err));
  }, []);

  // Load existing course if editing
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      instructorApi
        .getCourse(id)
        .then((res) => {
          const data = res.data?.data || res.data || {};
          setCourse({
            ...data,
            modules: data.modules || [],
            lessons: data.lessons || [],
          });
        })
        .catch((err) => {
          toast.error("Failed to load course details: " + (err.response?.data?.message || err.message));
          navigate("/instructor-dashboard");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  // Selected Mentor
  const selectedMentor = useMemo(() => {
    return mentors.find((m) => String(m.id) === String(course.mentorId) || String(m._id) === String(course.mentorId)) || mentors[0];
  }, [mentors, course.mentorId]);

  // Save course metadata
  const handleSaveCourse = async () => {
    if (!course.title.trim()) return toast.error("Course title is required.");
    if (!course.description.trim()) return toast.error("Course description is required.");

    setSaving(true);
    try {
      if (isNew) {
        const res = await instructorApi.createCourse(course);
        const created = res.data?.data || res.data;
        toast.success("Course draft created!");
        navigate(`/instructor/builder/${created._id || created.id}`, { replace: true });
      } else {
        const res = await instructorApi.updateCourse(id, course);
        setCourse(res.data?.data || res.data);
        toast.success("Course details saved!");
      }
    } catch (err) {
      toast.error("Error saving course: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Submit for admin review
  const handleSubmitReview = async () => {
    if (isNew) return toast.error("Please save your course first.");
    if (!course.lessons || course.lessons.length === 0) {
      return toast.error("Please add at least one lesson before submitting for review.");
    }

    setSubmitting(true);
    try {
      const res = await instructorApi.submitCourse(id);
      toast.success("Course submitted for admin review!");
      setCourse(res.data?.data || { ...course, status: "pending", rejectionReason: "" });
      navigate("/instructor-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit course.");
    } finally {
      setSubmitting(false);
    }
  };

  // Module Management
  const handleAddModule = () => {
    const title = window.prompt("Enter module title:");
    if (!title || !title.trim()) return;

    const newMod = {
      _id: "mod_" + Date.now(),
      id: "mod_" + Date.now(),
      title: title.trim(),
      description: "",
      order: course.modules.length,
    };

    const updatedModules = [...course.modules, newMod];
    setCourse({ ...course, modules: updatedModules });

    if (!isNew) {
      instructorApi
        .addModule(id, { title: newMod.title })
        .then(() => toast.success("Module added!"))
        .catch((err) => toast.error("Failed to add module: " + err.message));
    }
  };

  const handleDeleteModule = (modId) => {
    if (!window.confirm("Delete this module? Associated lessons will remain unassigned.")) return;
    const updatedModules = course.modules.filter((m) => String(m._id) !== String(modId) && String(m.id) !== String(modId));
    setCourse({ ...course, modules: updatedModules });

    if (!isNew) {
      instructorApi
        .deleteModule(id, modId)
        .then(() => toast.success("Module deleted."))
        .catch((err) => toast.error("Failed to delete module: " + err.message));
    }
  };

  const handleMoveModule = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= course.modules.length) return;

    const updated = [...course.modules];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((m, idx) => ({ ...m, order: idx }));
    setCourse({ ...course, modules: reordered });

    if (!isNew) {
      instructorApi.reorderModules(id, reordered.map((m) => m._id || m.id));
    }
  };

  // Lesson Management
  const handleAddLesson = (modId = null) => {
    const newLesson = {
      _id: "les_" + Date.now(),
      id: course.lessons.length + 1,
      title: "New Lesson " + (course.lessons.length + 1),
      duration: "15 min",
      script: "Welcome to this lecture. Today we will explore...",
      text: "",
      transcript: "",
      pdfNotes: "",
      moduleId: modId,
      order: course.lessons.length,
      attachments: [],
      quizQuestions: [],
    };

    const updatedLessons = [...course.lessons, newLesson];
    setCourse({ ...course, lessons: updatedLessons });
    setEditingLesson(newLesson);

    if (!isNew) {
      instructorApi.addLesson(id, newLesson).catch((err) => console.error("Error creating lesson:", err));
    }
  };

  const handleSaveLesson = async (lessonToSave) => {
    const updatedLessons = course.lessons.map((l) =>
      String(l._id) === String(lessonToSave._id) || String(l.id) === String(lessonToSave.id)
        ? lessonToSave
        : l
    );

    setCourse({ ...course, lessons: updatedLessons });
    setEditingLesson(null);
    toast.success(`Lesson "${lessonToSave.title}" updated.`);

    if (!isNew) {
      try {
        await instructorApi.updateLesson(id, lessonToSave._id || lessonToSave.id, lessonToSave);
      } catch (err) {
        toast.error("Failed to save lesson: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteLesson = (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    const updatedLessons = course.lessons.filter(
      (l) => String(l._id) !== String(lessonId) && String(l.id) !== String(lessonId)
    );
    setCourse({ ...course, lessons: updatedLessons });
    if (editingLesson && (String(editingLesson._id) === String(lessonId) || String(editingLesson.id) === String(lessonId))) {
      setEditingLesson(null);
    }

    if (!isNew) {
      instructorApi.deleteLesson(id, lessonId).then(() => toast.success("Lesson deleted."));
    }
  };

  const handleMoveLesson = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= course.lessons.length) return;

    const updated = [...course.lessons];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((l, idx) => ({ ...l, order: idx }));
    setCourse({ ...course, lessons: reordered });

    if (!isNew) {
      instructorApi.reorderLessons(id, reordered.map((l) => l._id || l.id));
    }
  };

  // File Upload for Lesson Attachments
  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingLesson) return;

    if (isNew) {
      return toast.error("Please save the course before uploading file attachments.");
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingAttachment(true);
    try {
      const res = await instructorApi.uploadAttachment(id, editingLesson._id || editingLesson.id, formData);
      const newAttach = res.data?.data;
      const updatedAttachments = [...(editingLesson.attachments || []), newAttach];
      const updatedLesson = { ...editingLesson, attachments: updatedAttachments };

      setEditingLesson(updatedLesson);
      setCourse({
        ...course,
        lessons: course.lessons.map((l) =>
          String(l._id) === String(editingLesson._id) || String(l.id) === String(editingLesson.id)
            ? updatedLesson
            : l
        ),
      });

      toast.success(`Attached "${file.name}" to lesson!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!editingLesson || isNew) return;
    try {
      await instructorApi.deleteAttachment(id, editingLesson._id || editingLesson.id, attachmentId);
      const updatedAttachments = (editingLesson.attachments || []).filter(
        (a) => String(a._id) !== String(attachmentId) && a.filename !== attachmentId
      );
      const updatedLesson = { ...editingLesson, attachments: updatedAttachments };

      setEditingLesson(updatedLesson);
      setCourse({
        ...course,
        lessons: course.lessons.map((l) =>
          String(l._id) === String(editingLesson._id) || String(l.id) === String(editingLesson.id)
            ? updatedLesson
            : l
        ),
      });
      toast.success("Attachment deleted.");
    } catch (err) {
      toast.error("Failed to delete attachment: " + err.message);
    }
  };

  // AI Draft Generator (Structured Output validated with Zod)
  const handleGenerateAiDraft = async () => {
    if (!aiTopic.trim()) return toast.error("Please enter a lesson topic.");

    setGeneratingAi(true);
    try {
      const res = await instructorApi.generateLessonDraft({
        courseId: id,
        lessonTopic: aiTopic.trim(),
        objectives: aiObjectives ? aiObjectives.split("\n").filter((o) => o.trim()) : ["Master the core fundamentals"],
      });

      const draft = res.data?.data || res.data;
      const scriptSegments = draft.scriptSegments || [];
      const narration = scriptSegments.map((s) => s.narration).join("\n\n") || draft.script || "";

      if (editingLesson) {
        setEditingLesson({
          ...editingLesson,
          title: draft.title || editingLesson.title,
          script: narration || editingLesson.script,
          quizQuestions: draft.quizQuestions || editingLesson.quizQuestions || [],
          text: draft.practiceTask?.instructions || editingLesson.text,
        });
      }

      toast.success("AI Draft generated successfully! Review and edit before saving.");
      setShowAiModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Draft generation failed.");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
        <p className="text-sm text-muted">Loading Course Studio...</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Top Navigation & Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/instructor-dashboard")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-gray-700" />
          <h2 className="text-lg font-black text-white">{isNew ? "Create New Course" : course.title || "Course Studio"}</h2>
          <StatusBadge tone={course.status === "approved" ? "green" : course.status === "pending" ? "yellow" : course.status === "rejected" ? "red" : "slate"}>
            {course.status ? course.status.toUpperCase() : "DRAFT"}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(true)} disabled={course.lessons.length === 0} className="gap-1.5">
            <Eye className="h-4 w-4" /> Student Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCourse} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </Button>
          {(course.status === "draft" || course.status === "rejected") && (
            <Button variant="gradient" size="sm" onClick={handleSubmitReview} disabled={submitting || isNew} className="gap-1.5">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit for Review
            </Button>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {course.status === "rejected" && course.rejectionReason && (
        <div className="mb-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-300">Course Rejected by Administrator</h4>
              <p className="text-xs text-red-200/90 mt-1">
                <strong>Feedback:</strong> {course.rejectionReason}
              </p>
              <p className="text-xs text-red-400/80 mt-1">Please address the feedback in your curriculum and submit again.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Left Column: Course Metadata & Curriculum Tree */}
        <div className="space-y-6">
          <SectionCard title="1. Course Specification" description="Define curriculum parameters, pricing, and AI faculty mentor.">
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-300">Course Title</label>
                <Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} placeholder="e.g. Distributed Systems Architecture" className="mt-1" />
              </div>

              <div>
                <label className="font-semibold text-gray-300">Description</label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  rows={3}
                  placeholder="Comprehensive course overview..."
                  className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs text-white placeholder-muted focus:border-upto-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-300">Category Tag</label>
                  <Input value={course.tag} onChange={(e) => setCourse({ ...course, tag: e.target.value })} placeholder="e.g. Technology" className="mt-1" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">League</label>
                  <Input value={course.league} onChange={(e) => setCourse({ ...course, league: e.target.value })} placeholder="e.g. Cloud League" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-300">Level</label>
                  <select
                    value={course.level}
                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-upto-dark px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-300">XP Reward</label>
                  <Input type="number" value={course.xp} onChange={(e) => setCourse({ ...course, xp: Number(e.target.value) })} className="mt-1" />
                </div>
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 p-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-300 block" htmlFor="course-access-type">
                      Course Access Model
                    </label>
                    <select
                      id="course-access-type"
                      value={course.accessType || (course.price > 0 ? "paid" : "free")}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        setCourse({
                          ...course,
                          accessType: nextType,
                          price: nextType === "free" ? 0 : (course.price || 999),
                        });
                      }}
                      className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-upto-dark px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-upto-blue"
                    >
                      <option value="free">Free Course (Accessible to all students)</option>
                      <option value="paid">Paid Course (Subscription Required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-300 block" htmlFor="course-price">
                      Course Price (INR)
                    </label>
                    <Input
                      id="course-price"
                      type="number"
                      disabled={course.accessType === "free"}
                      value={course.accessType === "free" ? 0 : course.price}
                      onChange={(e) => setCourse({ ...course, price: Math.max(0, Number(e.target.value)) })}
                      placeholder={course.accessType === "free" ? "Free (₹0)" : "e.g. 2999"}
                      className="mt-1"
                    />
                  </div>
                </div>

                {course.accessType === "paid" ? (
                  <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Paid courses require subscription checkout and administrator approval before going live.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Free courses are open to all enrolled students with full access to curriculum & AI mentorship.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-gray-300">Faculty AI Mentor</label>
                <select
                  value={course.mentorId}
                  onChange={(e) => setCourse({ ...course, mentorId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-upto-dark px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {mentors.map((m) => (
                    <option key={m._id || m.id} value={m.id || m._id}>
                      {m.name} ({m.subject}) · {m.type === "historical" ? "Historical Tribute" : "Original Persona"}
                    </option>
                  ))}
                </select>
                {selectedMentor && (
                  <p className="mt-1 text-[11px] text-amber-300/90 flex items-center gap-1">
                    <span>AI-generated mentor · {selectedMentor.name}</span>
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Curriculum Structure (Modules & Lessons Tree) */}
          <SectionCard
            title="2. Curriculum Outline"
            description="Organize modules and lessons with reordering."
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddModule} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Module
                </Button>
                <Button variant="gradient" size="sm" onClick={() => handleAddLesson(null)} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Lesson
                </Button>
              </div>
            }
          >
            {course.lessons.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted border border-dashed rounded-lg border-[hsl(var(--border))]">
                No lessons added yet. Click &quot;+ Lesson&quot; to begin building.
              </div>
            ) : (
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => {
                  const isSelected = editingLesson && (String(editingLesson._id) === String(lesson._id) || String(editingLesson.id) === String(lesson.id));

                  return (
                    <div
                      key={lesson._id || lesson.id || index}
                      onClick={() => setEditingLesson(lesson)}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-upto-blue bg-upto-blue/10 ring-1 ring-upto-blue/40"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted cursor-grab" />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{lesson.title}</p>
                          <p className="text-[10px] text-muted">{lesson.duration || "15 min"} · {lesson.attachments?.length || 0} files · {lesson.quizQuestions?.length || 0} questions</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleMoveLesson(index, -1)} disabled={index === 0} className="p-1 text-muted hover:text-white disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleMoveLesson(index, 1)} disabled={index === course.lessons.length - 1} className="p-1 text-muted hover:text-white disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson._id || lesson.id)} className="p-1 text-red-400 hover:text-red-300 ml-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column: Detailed Lesson Editor */}
        <div>
          {editingLesson ? (
            <LessonDetailEditor
              lesson={editingLesson}
              courseId={id}
              isNewCourse={isNew}
              onSave={handleSaveLesson}
              onUploadAttachment={handleUploadAttachment}
              onDeleteAttachment={handleDeleteAttachment}
              uploadingAttachment={uploadingAttachment}
              onOpenAiModal={() => {
                setAiTopic(editingLesson.title);
                setShowAiModal(true);
              }}
            />
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center text-muted">
              <BookOpen className="h-10 w-10 text-muted mb-3" />
              <p className="font-semibold text-white text-sm">Select or create a lesson to edit</p>
              <p className="text-xs text-muted max-w-sm mt-1">
                Customize script text for the AI mentor, attach materials, add quiz questions, or draft automatically with AI.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Draft Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-upto-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Generate Lesson Draft with AI</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted">
              Generates a structured lesson plan (script segments, quiz questions, and practice tasks) validated with Zod. Stored as an editable draft for your human review before publishing.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-300">Lesson Topic / Concept</label>
                <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. Asynchronous I/O and the Node.js Event Loop" className="mt-1" />
              </div>
              <div>
                <label className="font-semibold text-gray-300">Key Learning Objectives (one per line)</label>
                <textarea
                  value={aiObjectives}
                  onChange={(e) => setAiObjectives(e.target.value)}
                  rows={3}
                  placeholder="Understand non-blocking callbacks&#10;Master libuv thread pool&#10;Optimize microtasks vs macrotasks"
                  className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs text-white placeholder-muted focus:border-upto-blue focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAiModal(false)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={handleGenerateAiDraft} disabled={generatingAi} className="gap-1.5">
                {generatingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-upto-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-upto-blue">Student Learning Preview</span>
                <h3 className="font-bold text-white text-base">{course.title}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-gray-900 border border-gray-800 p-4 text-xs">
                <p className="font-bold text-white mb-1">AI Mentor Guidance</p>
                <p className="text-gray-300">{selectedMentor?.name || "AI Mentor"} ({selectedMentor?.subject || "Pedagogical Specialist"})</p>
                <p className="text-amber-300/80 text-[11px] mt-1">AI-generated mentor. Not the real person.</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-300 mb-2">Lesson Narration Script Preview:</h4>
                <div className="rounded-lg bg-gray-950 p-4 border border-gray-800 text-xs text-gray-200 leading-relaxed max-h-48 overflow-y-auto">
                  {editingLesson?.script || course.lessons[0]?.script || "No lesson script entered yet."}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-300 mb-2">Quiz Questions Preview ({editingLesson?.quizQuestions?.length || 0}):</h4>
                <div className="space-y-2">
                  {(editingLesson?.quizQuestions || []).map((q, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 text-xs">
                      <p className="font-semibold text-white">Q{idx + 1}: {q.question}</p>
                      <ul className="mt-2 space-y-1 pl-4 list-disc text-muted">
                        {(q.options || []).map((opt, oIdx) => (
                          <li key={oIdx} className={oIdx === q.correctAnswerIndex ? "text-green-400 font-semibold" : ""}>
                            {opt} {oIdx === q.correctAnswerIndex ? "✓ (Correct)" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated Lesson Editor Form (Script, Attachments, Quiz)
 */
function LessonDetailEditor({
  lesson,
  courseId,
  isNewCourse,
  onSave,
  onUploadAttachment,
  onDeleteAttachment,
  uploadingAttachment,
  onOpenAiModal,
}) {
  const [formData, setFormData] = useState({ ...lesson });

  useEffect(() => {
    setFormData({ ...lesson });
  }, [lesson]);

  // Quiz questions handler
  const handleAddQuestion = () => {
    const newQ = {
      id: Date.now(),
      question: "What is the primary function of this concept?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswerIndex: 0,
      explanation: "Explanation of why this answer is correct.",
    };
    setFormData({
      ...formData,
      quizQuestions: [...(formData.quizQuestions || []), newQ],
    });
  };

  const handleUpdateQuestion = (qIndex, field, value) => {
    const updated = [...(formData.quizQuestions || [])];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setFormData({ ...formData, quizQuestions: updated });
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = [...(formData.quizQuestions || [])];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = value;
    updated[qIndex].options = newOptions;
    setFormData({ ...formData, quizQuestions: updated });
  };

  const handleDeleteQuestion = (qIndex) => {
    const updated = (formData.quizQuestions || []).filter((_, idx) => idx !== qIndex);
    setFormData({ ...formData, quizQuestions: updated });
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-upto-blue">Lesson Studio</span>
          <h3 className="text-base font-bold text-white">{formData.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenAiModal} className="gap-1.5 text-xs text-purple-300 border-purple-500/30 hover:bg-purple-500/10">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Generate draft with AI
          </Button>
          <Button variant="gradient" size="sm" onClick={() => onSave(formData)} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Lesson
          </Button>
        </div>
      </div>

      {/* Basic Lesson Metadata */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-gray-300">Lesson Title</label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="font-semibold text-gray-300">Estimated Duration</label>
          <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 18 min" className="mt-1" />
        </div>
      </div>

      {/* Script Narration Text */}
      <div className="text-xs">
        <div className="flex items-center justify-between mb-1">
          <label className="font-semibold text-gray-300">AI Mentor Script &amp; Narration</label>
          <span className="text-[11px] text-muted">Spoken aloud by the talking avatar &amp; audio player</span>
        </div>
        <textarea
          value={formData.script}
          onChange={(e) => setFormData({ ...formData, script: e.target.value })}
          rows={6}
          placeholder="Welcome to this lecture! Today we break down..."
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs text-white placeholder-muted focus:border-upto-blue focus:outline-none leading-relaxed font-mono"
        />
      </div>

      {/* Ground Truth Notes / Transcript */}
      <div className="text-xs">
        <label className="font-semibold text-gray-300">Study Notes &amp; Teaching Reference Material (PDF / RAG Context)</label>
        <textarea
          value={formData.text || formData.pdfNotes || ""}
          onChange={(e) => setFormData({ ...formData, text: e.target.value, pdfNotes: e.target.value })}
          rows={4}
          placeholder="Detailed notes grounded for student Q&A..."
          className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs text-white placeholder-muted focus:border-upto-blue focus:outline-none"
        />
      </div>

      {/* File Attachments (Multer Upload outside web root) */}
      <div className="border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Paperclip className="h-4 w-4 text-upto-blue" />
              Lesson File Attachments ({formData.attachments?.length || 0})
            </h4>
            <p className="text-[11px] text-muted">PDF, TXT, DOCX, ZIP (Max 10MB each, securely stored outside web root).</p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-upto-card border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-white hover:border-upto-blue">
              {uploadingAttachment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload File
              <input type="file" onChange={onUploadAttachment} disabled={uploadingAttachment} className="hidden" />
            </label>
          </div>
        </div>

        {formData.attachments?.length === 0 ? (
          <p className="text-xs text-muted italic">No file attachments uploaded for this lesson.</p>
        ) : (
          <div className="space-y-2">
            {formData.attachments?.map((file, fIdx) => (
              <div key={file._id || file.filename || fIdx} className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] bg-gray-900/40 p-2.5 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-upto-blue shrink-0" />
                  <span className="text-white truncate font-medium">{file.originalName || file.filename}</span>
                  <span className="text-[10px] text-muted">({((file.size || 0) / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAttachment(file._id || file.filename)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Delete Attachment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Questions Editor */}
      <div className="border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-upto-orange" />
              Lesson Knowledge Check (Quizzes: {formData.quizQuestions?.length || 0})
            </h4>
            <p className="text-[11px] text-muted">Server-graded quiz questions presented after lesson completion.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddQuestion} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {(formData.quizQuestions || []).map((q, qIdx) => (
            <div key={q.id || qIdx} className="rounded-lg border border-[hsl(var(--border))] bg-gray-950/60 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Question {qIdx + 1}</span>
                <button type="button" onClick={() => handleDeleteQuestion(qIdx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <Input
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                  placeholder="Enter quiz question..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-400">Options (Select radio for correct answer):</label>
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correctAnswerIndex === optIdx}
                      onChange={() => handleUpdateQuestion(qIdx, "correctAnswerIndex", optIdx)}
                      className="text-upto-blue focus:ring-upto-blue"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 py-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400">Answer Explanation</label>
                <Input
                  value={q.explanation || ""}
                  onChange={(e) => handleUpdateQuestion(qIdx, "explanation", e.target.value)}
                  placeholder="Why is this answer correct?"
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
