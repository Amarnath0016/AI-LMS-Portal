import { useState } from "react";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  Award,
  Shield,
  Layers,
  Code2,
  Cpu,
  Check,
  Send,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// High demand career roles database
const careerRoles = [
  {
    id: "cr-fullstack",
    title: "Full Stack Software Engineer",
    category: "Software Engineering",
    salary: "$115,000 - $165,000 / yr",
    growth: "+24% YoY Growth",
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
    description: "Architect end-to-end web applications using modern Frontend (React, Next.js) and Scalable Backend (Node, PostgreSQL, Cloud).",
    requiredSkills: ["React", "JavaScript", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
    topCompanies: ["Google", "Vercel", "Meta", "Stripe", "Airbnb"],
    roadmap: ["Frontend Mastery", "Database Architecture", "Microservices & DevOps", "System Design"],
    recommendedCourse: "Full Stack Web Development Masterclass",
  },
  {
    id: "cr-ai-engineer",
    title: "AI & Machine Learning Engineer",
    category: "AI & Data Science",
    salary: "$140,000 - $210,000 / yr",
    growth: "+38% YoY Growth",
    icon: Cpu,
    color: "from-purple-500 to-pink-600",
    description: "Design fine-tuned LLMs, neural networks, and RAG pipelines powered by PyTorch, CUDA, and AI Agent frameworks.",
    requiredSkills: ["Python", "PyTorch", "LangChain", "RAG Architecture", "Transformers", "SQL", "Docker"],
    topCompanies: ["OpenAI", "NVIDIA", "Anthropic", "Microsoft", "Google DeepMind"],
    roadmap: ["Python & Math Foundations", "Deep Learning Models", "LLM Fine-Tuning", "Production AI Ops"],
    recommendedCourse: "Generative AI & LLM Systems Engineering",
  },
  {
    id: "cr-devops",
    title: "Cloud & DevOps Architect",
    category: "Cloud & DevOps",
    salary: "$130,000 - $185,000 / yr",
    growth: "+28% YoY Growth",
    icon: Layers,
    color: "from-cyan-500 to-teal-600",
    description: "Manage resilient cloud infrastructure, Kubernetes clusters, and automated CI/CD pipelines across AWS and GCP.",
    requiredSkills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python"],
    topCompanies: ["AWS", "Datadog", "HashiCorp", "Netflix", "Cloudflare"],
    roadmap: ["Linux Systems Administration", "Container Orchestration", "Infrastructure as Code", "Multi-Cloud Security"],
    recommendedCourse: "AWS Cloud & Kubernetes Masterclass",
  },
  {
    id: "cr-cyber",
    title: "Cybersecurity & Security Operations Specialist",
    category: "Cybersecurity",
    salary: "$120,000 - $175,000 / yr",
    growth: "+32% YoY Growth",
    icon: Shield,
    color: "from-rose-500 to-red-600",
    description: "Protect enterprise infrastructure against zero-day threats, perform penetration testing, and build SOC threat detection.",
    requiredSkills: ["Network Security", "Penetration Testing", "Python", "Linux", "SIEM", "Cryptography"],
    topCompanies: ["CrowdStrike", "Palo Alto Networks", "Cloudflare", "Cisco"],
    roadmap: ["Network Fundamentals", "Ethical Hacking & CTF", "Threat Hunting & Incident Response", "Enterprise Security"],
    recommendedCourse: "Ethical Hacking & Cyber Defense League Track",
  },
];

// Featured Tech Jobs
const jobListings = [
  { id: 1, title: "Junior Full Stack Engineer", company: "Uptoskills Engineering", type: "Full-Time", location: "Remote / San Francisco", salary: "$95k - $120k", tags: ["React", "Node.js", "PostgreSQL"] },
  { id: 2, title: "AI Prompt & Fine-Tuning Intern", company: "NeuralNet AI Labs", type: "Internship", location: "Remote", salary: "$45 / hr", tags: ["Python", "PyTorch", "LLMs"] },
  { id: 3, title: "Cloud Systems Associate", company: "CloudScale Systems", type: "Full-Time", location: "Austin, TX / Remote", salary: "$105k - $135k", tags: ["AWS", "Docker", "Kubernetes"] },
];

export default function CareerOptionsPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSkills, setUserSkills] = useState(["React", "JavaScript", "Python", "REST APIs"]);
  const [showApplyModal, setShowApplyModal] = useState(null);

  const toggleSkill = (skill) => {
    if (userSkills.includes(skill)) {
      setUserSkills(userSkills.filter((s) => s !== skill));
    } else {
      setUserSkills([...userSkills, skill]);
    }
  };

  const calculateMatch = (requiredSkills) => {
    const matchedCount = requiredSkills.filter((s) => userSkills.includes(s)).length;
    return Math.round((matchedCount / requiredSkills.length) * 100);
  };

  const handleApplyJob = (jobTitle) => {
    setShowApplyModal(null);
    toast.success(`🎉 Application submitted for "${jobTitle}" using your Uptoskills verified profile!`);
  };

  const filteredRoles = careerRoles.filter((role) => {
    const matchesCategory = selectedCategory === "All" || role.category === selectedCategory;
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <HeroPanel className="relative overflow-hidden border-upto-blue/20 bg-gradient-to-r from-upto-blue/10 via-purple-500/5 to-emerald-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-upto-blue">
                <Briefcase className="h-4 w-4" /> Tech Career Pathways
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> High Demand Tech Roles 2026
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Career Options & AI Skill Gap Analyzer
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
              Discover high-paying technical career tracks, calculate your instant skill readiness match %, and follow step-by-step learning roadmaps to get hired.
            </p>
          </div>

          {/* Quick Metrics Box */}
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Avg Tech Salary
              </p>
              <p className="mt-1 text-xl font-black text-emerald-500">$135,000 / yr</p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Building2 className="h-4 w-4 text-upto-blue" /> Hiring Partners
              </p>
              <p className="mt-1 text-xl font-black text-upto-blue">500+ Companies</p>
            </div>
          </div>
        </div>
      </HeroPanel>

      {/* Interactive AI Skill Gap Analyzer Widget */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-upto-blue animate-pulse" />
            <span>Interactive AI Skill Readiness Analyzer</span>
          </div>
        }
        description="Select your current skills to calculate instant job readiness match % across target roles."
      >
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Select Your Current Skills:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "React",
              "JavaScript",
              "TypeScript",
              "Python",
              "Node.js",
              "PostgreSQL",
              "PyTorch",
              "AWS",
              "Docker",
              "Kubernetes",
              "REST APIs",
              "Network Security",
            ].map((skill) => {
              const isSelected = userSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-upto-blue text-white shadow-md shadow-blue-500/20"
                      : "border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span className="h-2 w-2 rounded-full bg-muted/40" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Career Roles Catalog */}
      <SectionCard
        title={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-upto-orange" />
              <span>Explore Career Pathways</span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Software Engineering", "AI & Data Science", "Cloud & DevOps", "Cybersecurity"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-upto-orange text-white shadow-sm"
                      : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {/* Search Input */}
        <div className="mb-6 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or technologies..."
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-upto-orange"
          />
        </div>

        {/* Roles List */}
        <div className="space-y-6">
          {filteredRoles.map((role) => {
            const Icon = role.icon;
            const matchScore = calculateMatch(role.requiredSkills);

            return (
              <div
                key={role.id}
                className="app-card rounded-2xl border border-[hsl(var(--border))] p-6 space-y-6 hover:border-upto-blue/40 transition-all shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted">{role.category}</span>
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-500">
                          {role.growth}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[hsl(var(--foreground))] mt-1">{role.title}</h3>
                      <p className="mt-1 text-xs text-muted leading-relaxed max-w-2xl">{role.description}</p>
                    </div>
                  </div>

                  {/* Readiness Match Score Meter */}
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-center shrink-0 min-w-[140px]">
                    <p className="text-[10px] font-extrabold uppercase text-muted">Skill Readiness</p>
                    <p className={`text-2xl font-black mt-0.5 ${matchScore >= 70 ? "text-emerald-500" : matchScore >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                      {matchScore}% Match
                    </p>
                  </div>
                </div>

                {/* Salary & Top Hiring Companies */}
                <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-[hsl(var(--surface))] p-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted">Salary Range:</span>
                    <span className="text-[hsl(var(--foreground))] font-extrabold">{role.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-upto-blue" />
                    <span className="text-muted">Top Hirers:</span>
                    <span className="text-[hsl(var(--foreground))]">{role.topCompanies.join(", ")}</span>
                  </div>
                </div>

                {/* Required Skills Checklist */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Required Skills Breakdown:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.requiredSkills.map((sk) => {
                      const hasSkill = userSkills.includes(sk);
                      return (
                        <span
                          key={sk}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            hasSkill
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[hsl(var(--surface))] text-muted border border-[hsl(var(--border))]"
                          }`}
                        >
                          {hasSkill ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />}
                          {sk}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Career Roadmap Timeline */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">4-Step Career Roadmap:</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {role.roadmap.map((step, idx) => (
                      <div key={idx} className="rounded-xl border border-[hsl(var(--border))] p-3 text-xs">
                        <span className="text-[10px] font-black uppercase text-upto-blue">Step {idx + 1}</span>
                        <p className="mt-1 font-extrabold text-[hsl(var(--foreground))]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between border-t border-[hsl(var(--border))] pt-4 gap-3">
                  <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-upto-blue" /> Recommended Track: <strong>{role.recommendedCourse}</strong>
                  </span>
                  <Button variant="gradient" size="sm" className="gap-2" onClick={() => navigate("/courses")}>
                    Enroll in Track <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Featured Jobs & Internships Bulletin Board */}
      <SectionCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              <span>Featured Opportunities & Internships</span>
            </div>
            <StatusBadge tone="green">Active Hiring</StatusBadge>
          </div>
        }
        description="Direct opportunities from industry partner companies matching your profile."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {jobListings.map((job) => (
            <div key={job.id} className="app-card rounded-2xl p-5 border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-upto-blue/15 px-2 py-0.5 text-[10px] font-bold text-upto-blue">{job.type}</span>
                <span className="text-xs font-extrabold text-emerald-500">{job.salary}</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-[hsl(var(--foreground))]">{job.title}</h4>
                <p className="text-xs text-muted mt-0.5">{job.company} &bull; {job.location}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((t) => (
                  <span key={t} className="rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-[10px] font-bold text-muted">
                    {t}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-1.5"
                onClick={() => setShowApplyModal(job)}
              >
                Apply Profile <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Job Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))]">Apply to {showApplyModal.company}</h3>
              <button onClick={() => setShowApplyModal(null)} className="text-muted font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-[hsl(var(--foreground))] text-sm">{showApplyModal.title}</p>
              <p className="text-muted">Location: {showApplyModal.location} &bull; Salary: {showApplyModal.salary}</p>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Verified Profile Ready
                </p>
                <p className="text-[11px] text-muted">
                  Your Uptoskills certifications, course badges, and project github links will be submitted directly to the recruiter!
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowApplyModal(null)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={() => handleApplyJob(showApplyModal.title)}>
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
