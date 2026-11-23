import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthContext } from "@/store/AuthContext";
import { courseApi } from "@/api/endpoints";
import { courses as mockCourses } from "@/store/mockData";
import { toast } from "sonner";

export default function MySubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { subscriptions, plans, loading, cancel, refetch } = useSubscription();

  const [allCourses, setAllCourses] = useState(mockCourses);
  const [cancellingId, setCancellingId] = useState(null);
  const [copiedRef, setCopiedRef] = useState(null);

  // Fetch all courses to resolve covered course details
  useEffect(() => {
    let isMounted = true;
    courseApi
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setAllCourses(list);
        }
      })
      .catch(() => {
        // keep mockCourses fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeSubscriptions = useMemo(() => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      if (sub.expiresAt && new Date(sub.expiresAt) <= now) return false;
      return true;
    });
  }, [subscriptions]);

  const pastSubscriptions = useMemo(() => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      if (sub.status !== "active") return true;
      if (sub.expiresAt && new Date(sub.expiresAt) <= now) return true;
      return false;
    });
  }, [subscriptions]);

  // Helper to find courses covered by a subscription
  const getCoveredCourses = (sub) => {
    const isSingleCourse =
      (sub.planId?.name || sub.planName || "").toLowerCase().includes("single") ||
      (Array.isArray(sub.courseIds) && sub.courseIds.length > 0);

    if (Array.isArray(sub.courseIds) && sub.courseIds.length > 0) {
      return allCourses.filter((c) =>
        sub.courseIds.some(
          (id) =>
            String(id) === String(c._id) ||
            String(id) === String(c.id) ||
            (c.id !== undefined && String(id) === String(c.id))
        )
      );
    }

    if (!isSingleCourse) {
      // All-access pass covers all paid courses
      return allCourses.filter(
        (c) => c.accessType === "paid" || (c.price && c.price > 0)
      );
    }

    return [];
  };

  const handleCopy = (ref) => {
    if (!ref) return;
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    toast.success("Reference ID copied to clipboard!");
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleCancel = async (subId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription? You will retain access until the end of your billing cycle.")) {
      return;
    }
    try {
      setCancellingId(subId);
      await cancel(subId);
      toast.success("Subscription cancelled successfully.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to cancel subscription.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* HERO PANEL */}
      <HeroPanel>
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-upto-blue/15 px-4 py-1.5 text-xs font-bold text-upto-blue border border-upto-blue/30 w-fit">
            <CreditCard className="h-3.5 w-3.5" /> Billing & Subscriptions
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[hsl(var(--foreground))]">
            My Subscriptions
          </h1>
          <p className="max-w-2xl text-muted text-sm sm:text-base">
            Track your active course passes, view remaining validity, manage premium AI mentor access, and explore upgrade options.
          </p>
        </div>
      </HeroPanel>

      {/* QUICK STATS METRICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Active Passes</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[hsl(var(--foreground))]">
              {activeSubscriptions.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {activeSubscriptions.length > 0 ? "Active & Verified" : "No active passes"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Subscribed Courses</span>
            <BookOpen className="h-4 w-4 text-upto-blue" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[hsl(var(--foreground))]">
              {activeSubscriptions.reduce((acc, sub) => acc + getCoveredCourses(sub).length, 0)}
            </span>
            <span className="text-xs text-muted font-medium">courses unlocked</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Payment Mode</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-400">Demo Mode</span>
            <span className="text-xs text-muted font-medium">(Simulated Instant)</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SUBSCRIPTIONS */}
      <SectionCard
        title="Active Subscriptions"
        subtitle="Courses and platform benefits unlocked for your account"
      >
        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-upto-blue" />
          </div>
        ) : activeSubscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))]/40 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-upto-blue/15 text-upto-blue">
              <CreditCard className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-black text-[hsl(var(--foreground))]">
              No Active Subscriptions Yet
            </h3>
            <p className="mt-2 text-xs text-muted max-w-md mx-auto">
              Most of our courses are completely FREE! When you subscribe to a specific premium course or all-access pass, your active pass details will appear here.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate("/subscribe")}
                className="gap-2 font-bold"
              >
                <Zap className="h-4 w-4" /> View Subscription Plans
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/courses")}
              >
                Explore Course Catalog
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeSubscriptions.map((sub) => {
              const plan = sub.planId || {};
              const planName = plan.name || sub.planName || "Course Pass";
              const price = plan.price || (planName.includes("Single") ? 999 : 1999);
              const coveredCourses = getCoveredCourses(sub);
              const daysLeft = sub.expiresAt
                ? Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
                : 90;

              return (
                <div
                  key={sub._id || sub.demoReference}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-6 shadow-md transition-all hover:border-upto-blue/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-[hsl(var(--foreground))]">
                          {planName}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Simulated authorization &bull; ₹{Number(price).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 font-mono text-xs text-muted">
                        <span className="font-bold text-upto-blue">{sub.demoReference || "DEMO-ACTIVE"}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(sub.demoReference)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Copy reference"
                        >
                          {copiedRef === sub.demoReference ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === sub._id}
                        onClick={() => handleCancel(sub._id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Cancel Pass
                      </Button>
                    </div>
                  </div>

                  {/* Dates & Validity Progress */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
                    <div>
                      <span className="text-muted uppercase tracking-wider block font-bold mb-1">
                        Activated Date
                      </span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {sub.startedAt ? new Date(sub.startedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Today"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted uppercase tracking-wider block font-bold mb-1">
                        Valid Until
                      </span>
                      <span className="font-bold text-emerald-400">
                        {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "90 days"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted uppercase tracking-wider block font-bold mb-1">
                        Time Remaining
                      </span>
                      <span className="font-black text-upto-orange">
                        {daysLeft} days remaining
                      </span>
                    </div>
                  </div>

                  {/* COVERED COURSES */}
                  <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-upto-blue" />
                      Covered Courses ({coveredCourses.length})
                    </p>

                    {coveredCourses.length === 0 ? (
                      <p className="text-xs text-muted italic">
                        No specific course restriction (Covers all platform courses)
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {coveredCourses.map((c) => (
                          <div
                            key={c._id || c.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 transition-all hover:border-upto-blue/50"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-upto-orange">
                                {c.league || "Technical Track"}
                              </span>
                              <h4 className="text-sm font-bold text-[hsl(var(--foreground))] truncate">
                                {c.title}
                              </h4>
                              <p className="text-xs text-muted truncate">
                                {c.level} &bull; {c.duration || "Self-paced"}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/courses/${c.id || c._id}`)}
                              className="shrink-0 gap-1.5 text-xs font-bold hover:bg-upto-blue hover:text-white"
                            >
                              Go to Course <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* PAST OR EXPIRED SUBSCRIPTIONS */}
      {pastSubscriptions.length > 0 && (
        <SectionCard
          title="Past & Expired Subscriptions"
          subtitle="Historic passes and expired enrollments"
        >
          <div className="space-y-3">
            {pastSubscriptions.map((sub) => (
              <div
                key={sub._id || sub.demoReference}
                className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/40 p-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-[hsl(var(--foreground))]">
                    {sub.planId?.name || sub.planName || "Course Pass"}
                  </h4>
                  <p className="text-muted mt-0.5">
                    Ref: {sub.demoReference} &bull; Expired on {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "Expired"}
                  </p>
                </div>
                <span className="rounded-full bg-gray-700/50 px-3 py-1 font-bold text-gray-400 capitalize">
                  {sub.status || "Expired"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* EXPLORE MORE PLANS CTA */}
      <div className="rounded-3xl border border-upto-blue/30 bg-gradient-to-r from-upto-blue/10 via-purple-500/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-upto-orange uppercase tracking-wider">
            <Zap className="h-4 w-4" /> Expand Your Learning
          </span>
          <h3 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))]">
            Need an All-Access Pass or Another Course?
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted max-w-xl">
            Upgrade to Pro Monthly or Pro Yearly to unlock all technical tracks, interactive AI celebrity audio streams, and verified career certificates.
          </p>
        </div>

        <Button
          variant="gradient"
          size="lg"
          onClick={() => navigate("/subscribe")}
          className="shrink-0 gap-2 font-black shadow-lg shadow-blue-500/20"
        >
          <Sparkles className="h-4 w-4" /> Browse Subscription Plans
        </Button>
      </div>
    </div>
  );
}
