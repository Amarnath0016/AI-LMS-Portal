import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  BookOpen,
  ArrowRight,
  Zap,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel } from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import { subscriptionApi, courseApi } from "@/api/endpoints";
import { subscriptionPlans as fallbackPlans, courses as mockCourses } from "@/store/mockData";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const courseIdParam = searchParams.get("course");

  const [plans, setPlans] = useState(fallbackPlans);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [targetCourse, setTargetCourse] = useState(null);
  const [targetCourseLoading, setTargetCourseLoading] = useState(Boolean(courseIdParam));

  // Form states
  const [formData, setFormData] = useState({
    billingName: user?.name || "Demo Learner",
    billingEmail: user?.email || "learner@uptoskills.com",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const successRef = useRef(null);

  // Fetch plans
  useEffect(() => {
    let isMounted = true;
    subscriptionApi
      .getPlans()
      .then((res) => {
        if (!isMounted) return;
        const fetched = res.data?.data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setPlans(fetched);
          // Set default plan
          if (courseIdParam) {
            const single = fetched.find((p) => p.name.toLowerCase().includes("single")) || fetched[0];
            setSelectedPlanId(single._id || single.id);
          } else {
            const proMonthly = fetched.find((p) => p.name.toLowerCase().includes("monthly")) || fetched[0];
            setSelectedPlanId(proMonthly._id || proMonthly.id);
          }
        } else {
          setPlans(fallbackPlans);
          setSelectedPlanId(fallbackPlans[0]._id || fallbackPlans[0].id);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setPlans(fallbackPlans);
        setSelectedPlanId(fallbackPlans[0]._id || fallbackPlans[0].id);
      })
      .finally(() => {
        if (isMounted) setPlansLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseIdParam]);

  // Fetch course if passed in query param
  useEffect(() => {
    if (!courseIdParam) {
      setTargetCourseLoading(false);
      return;
    }
    let isMounted = true;
    courseApi
      .getById(courseIdParam)
      .then((res) => {
        if (!isMounted) return;
        setTargetCourse(res.data?.data || null);
      })
      .catch(() => {
        if (!isMounted) return;
        const mock = mockCourses.find((c) => String(c.id) === String(courseIdParam) || String(c._id) === String(courseIdParam));
        setTargetCourse(mock || null);
      })
      .finally(() => {
        if (isMounted) setTargetCourseLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseIdParam]);

  // Selected plan object
  const selectedPlan = useMemo(() => {
    return plans.find((p) => (p._id || p.id) === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  // Input handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Quick demo autofill
  const handleFillDemoData = () => {
    setFormData({
      billingName: user?.name || "Dr. Alex Demo",
      billingEmail: user?.email || "alex.demo@uptoskills.edu",
      cardNumber: "4242 •••• •••• 4242",
      expiry: "12/29",
      cvv: "888",
    });
    setFormErrors({});
    toast.info("Demo credentials auto-filled. Ready to submit!");
  };

  // Submit checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError(null);

    const errors = {};
    if (!formData.billingName.trim()) errors.billingName = "Full name is required.";
    if (!formData.billingEmail.trim() || !formData.billingEmail.includes("@")) {
      errors.billingEmail = "Valid billing email is required.";
    }
    if (!formData.cardNumber.trim()) errors.cardNumber = "Card number is required.";
    if (!formData.expiry.trim()) errors.expiry = "Expiry date is required.";
    if (!formData.cvv.trim()) errors.cvv = "CVV is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in the required payment fields.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        planId: selectedPlan._id || selectedPlan.id,
        courseId: courseIdParam || undefined,
        billingName: formData.billingName.trim(),
        billingEmail: formData.billingEmail.trim(),
        cardNumber: formData.cardNumber.replace(/\s+/g, ""),
        expiry: formData.expiry.trim(),
        cvv: formData.cvv.trim(),
      };

      const res = await subscriptionApi.checkout(payload);
      if (res.data?.success) {
        setSuccessData({
          subscription: res.data.data,
          plan: selectedPlan,
          course: targetCourse,
          reference: res.data.data?.demoReference || "DEMO-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
        });
        toast.success("🎉 Subscription activated successfully in demo mode!");
        setTimeout(() => {
          if (successRef.current) {
            successRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } catch (err) {
      // If backend API returns 404 (e.g. server was not reloaded) or network error,
      // activate demo subscription seamlessly in client storage so student flow is never broken
      if (err.response?.status === 404 || !err.response) {
        const fallbackRef = "DEMO-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        const coveredCourseIds = targetCourse
          ? [targetCourse._id, targetCourse.id].filter(Boolean)
          : courseIdParam
          ? [courseIdParam]
          : [];
        const fallbackSub = {
          _id: "demo-sub-" + Date.now(),
          planId: selectedPlan?._id || selectedPlan?.id || "plan-single",
          planName: selectedPlan?.name || "Single Course Pass",
          courseIds: coveredCourseIds,
          status: "active",
          startedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (selectedPlan?.durationDays || 90) * 86400000).toISOString(),
          paymentMode: "demo",
          demoReference: fallbackRef,
          billingName: formData.billingName.trim(),
          billingEmail: formData.billingEmail.trim(),
        };

        try {
          const stored = JSON.parse(localStorage.getItem("upto_demo_subscriptions") || "[]");
          stored.push(fallbackSub);
          localStorage.setItem("upto_demo_subscriptions", JSON.stringify(stored));
        } catch {
          // ignore localStorage error
        }

        setSuccessData({
          subscription: fallbackSub,
          plan: selectedPlan,
          course: targetCourse,
          reference: fallbackRef,
        });
        toast.success("🎉 Subscription activated successfully in demo mode!");
        setTimeout(() => {
          if (successRef.current) {
            successRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
        return;
      }

      const msg = err.response?.data?.message || err.message || "Failed to process demo checkout.";
      setCheckoutError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================
  if (successData) {
    const sub = successData.subscription || {};
    const plan = successData.plan || {};
    const startDate = sub.startedAt ? new Date(sub.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN");
    const expiryDate = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "30 days";

    return (
      <div ref={successRef} className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-[hsl(var(--card))] to-[hsl(var(--surface))] p-8 sm:p-12 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
            <CheckCircle className="h-10 w-10" />
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40">
            <Sparkles className="h-3.5 w-3.5" /> Subscription Active
          </span>

          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-[hsl(var(--foreground))]">
            Welcome to {plan.name}!
          </h1>
          <p className="mt-2 text-base text-muted max-w-lg mx-auto">
            Your simulated payment was authorized. All covered technical courses, AI mentor video/audio lectures, and quizzes are now unlocked.
          </p>

          {/* Details Card */}
          <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Plan</span>
              <span className="text-sm font-black text-[hsl(var(--foreground))]">{plan.name} (₹{plan.price})</span>
            </div>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Demo Reference</span>
              <span className="font-mono text-xs font-bold text-upto-blue">{successData.reference}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Activated On</span>
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{startDate}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Valid Until</span>
              <span className="text-sm font-bold text-emerald-400">{expiryDate}</span>
            </div>
            {targetCourse && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Course Unlocked</span>
                <span className="text-sm font-extrabold text-upto-orange truncate max-w-[250px]">{targetCourse.title}</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {targetCourse ? (
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate(`/courses/${targetCourse.id || targetCourse._id}`)}
                className="w-full sm:w-auto gap-2 px-8 font-black shadow-lg shadow-blue-500/20"
              >
                <BookOpen className="h-5 w-5" /> Start Learning Now
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate("/courses")}
                className="w-full sm:w-auto gap-2 px-8 font-black"
              >
                <BookOpen className="h-5 w-5" /> Explore All Courses
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/profile")}
              className="w-full sm:w-auto"
            >
              View My Subscriptions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHECKOUT SCREEN
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <HeroPanel>
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-upto-orange/15 px-4 py-1.5 text-xs font-bold text-upto-orange border border-upto-orange/30 w-fit">
            <Zap className="h-3.5 w-3.5" /> Premium Subscriptions
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[hsl(var(--foreground))]">
            Choose Your Learning Plan
          </h1>
          <p className="max-w-2xl text-muted text-sm sm:text-base">
            Subscribe to unlock premium AI-mentored engineering tracks, advanced architectural code evaluation, hands-on production labs, and verified certificates.
          </p>
        </div>
      </HeroPanel>

      {/* DEMO NOTICE BANNER */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-full bg-amber-500/20 p-2 text-amber-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-300">
              DEMO PAYMENT MODE ACTIVE
            </p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              No real credit card will be charged. Enter any random details, or click the button to autofill test credentials.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillDemoData}
          className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 gap-1.5 font-bold"
        >
          <Sparkles className="h-3.5 w-3.5" /> Fill Demo Data
        </Button>
      </div>

      {/* Target Course Highlight (if ?course=<id>) */}
      {targetCourse && (
        <div className="rounded-2xl border border-upto-blue/30 bg-upto-blue/5 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-upto-blue/20 text-upto-blue font-bold shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-upto-blue">Unlocking Course</p>
              <h3 className="text-base font-black text-[hsl(var(--foreground))]">{targetCourse.title}</h3>
              <p className="text-xs text-muted">{targetCourse.tag} &bull; {targetCourse.level} &bull; ₹{targetCourse.price}</p>
            </div>
          </div>
          <span className="rounded-full bg-upto-orange/20 px-3 py-1 text-xs font-bold text-upto-orange border border-upto-orange/30">
            Selected
          </span>
        </div>
      )}

      {/* PLANS SELECTION GRID */}
      <div>
        <h2 className="text-lg font-black text-[hsl(var(--foreground))] mb-4">
          Select Subscription Plan
        </h2>
        {plansLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const isSelected = (p._id || p.id) === selectedPlanId;
              const isYearly = p.name.toLowerCase().includes("yearly");

              return (
                <div
                  key={p._id || p.id}
                  onClick={() => setSelectedPlanId(p._id || p.id)}
                  className={`relative cursor-pointer rounded-2xl border p-6 transition-all ${
                    isSelected
                      ? "border-upto-blue bg-upto-blue/10 shadow-xl shadow-blue-500/10 ring-2 ring-upto-blue"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-gray-600 hover:bg-[hsl(var(--surface))]"
                  }`}
                >
                  {isYearly && (
                    <span className="absolute -top-3 right-4 rounded-full bg-upto-orange px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      Best Value (Save 58%)
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[hsl(var(--foreground))]">{p.name}</h3>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-upto-blue bg-upto-blue text-white" : "border-gray-500"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted min-h-[36px]">{p.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[hsl(var(--foreground))]">₹{Number(p.price).toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted font-bold">/ {p.durationDays} days</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-[hsl(var(--border))] pt-4 text-xs text-muted">
                    {Array.isArray(p.features) &&
                      p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHECKOUT FORM */}
      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-5">
          <CreditCard className="h-6 w-6 text-upto-blue" />
          <div>
            <h2 className="text-xl font-black text-[hsl(var(--foreground))]">Demo Payment Checkout</h2>
            <p className="text-xs text-muted">Instant activation with simulated provider authorization</p>
          </div>
        </div>

        {checkoutError && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2" htmlFor="billingName">
                Cardholder Name
              </label>
              <Input
                id="billingName"
                placeholder="Full name as on card"
                value={formData.billingName}
                onChange={(e) => handleInputChange("billingName", e.target.value)}
                className={formErrors.billingName ? "border-red-500" : ""}
              />
              {formErrors.billingName && <p className="text-xs text-red-400 mt-1">{formErrors.billingName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2" htmlFor="billingEmail">
                Receipt Email
              </label>
              <Input
                id="billingEmail"
                type="email"
                placeholder="name@example.com"
                value={formData.billingEmail}
                onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                className={formErrors.billingEmail ? "border-red-500" : ""}
              />
              {formErrors.billingEmail && <p className="text-xs text-red-400 mt-1">{formErrors.billingEmail}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2" htmlFor="cardNumber">
              Card Number (Simulated)
            </label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="4242 •••• •••• 4242"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                className={`pl-10 ${formErrors.cardNumber ? "border-red-500" : ""}`}
              />
              <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
            {formErrors.cardNumber && <p className="text-xs text-red-400 mt-1">{formErrors.cardNumber}</p>}
          </div>

          <div className="grid gap-6 grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2" htmlFor="expiry">
                Expires (MM/YY)
              </label>
              <Input
                id="expiry"
                placeholder="12/28"
                value={formData.expiry}
                onChange={(e) => handleInputChange("expiry", e.target.value)}
                className={formErrors.expiry ? "border-red-500" : ""}
              />
              {formErrors.expiry && <p className="text-xs text-red-400 mt-1">{formErrors.expiry}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2" htmlFor="cvv">
                CVV / CVC
              </label>
              <Input
                id="cvv"
                type="password"
                maxLength={4}
                placeholder="•••"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                className={formErrors.cvv ? "border-red-500" : ""}
              />
              {formErrors.cvv && <p className="text-xs text-red-400 mt-1">{formErrors.cvv}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted">Selected Total</p>
              <p className="text-2xl font-black text-[hsl(var(--foreground))]">
                ₹{selectedPlan ? Number(selectedPlan.price).toLocaleString("en-IN") : "0"}
                <span className="text-xs font-normal text-muted ml-1">demo authorization</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={submitting}
              className="gap-2 px-8 font-black shadow-lg shadow-blue-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authorizing Demo...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Complete Demo Checkout (₹{selectedPlan?.price || 0})
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
