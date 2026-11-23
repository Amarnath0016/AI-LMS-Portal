import { useState, useMemo } from "react";
import {
  CreditCard,
  Plus,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Field } from "@/components/ui/form";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { subscriptionApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function SubscriptionPlans() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 499,
    interval: "month",
    description: "",
    features: "Unlimited AI Mentors, Access to all courses, Verified Certificates",
  });

  const {
    data: plansData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => subscriptionApi.getPlans(), []);

  const plans = useMemo(() => {
    const list = Array.isArray(plansData) ? plansData : plansData?.data || [];
    if (list.length === 0) {
      return [
        {
          _id: "plan-free",
          name: "Free Explorer",
          price: 0,
          interval: "forever",
          description: "Access introductory lessons, basic leagues, and community forum.",
          features: ["Community Forum Access", "Basic Daily Challenges", "Introductory Lessons"],
          isPopular: false,
        },
        {
          _id: "plan-pro",
          name: "Pro Learner",
          price: 499,
          interval: "month",
          description: "Full access to all courses, unlimited AI mentorship, and certificates.",
          features: [
            "All Course Catalogs",
            "Unlimited AI Mentors",
            "Verified Certificates",
            "Priority Support",
          ],
          isPopular: true,
        },
        {
          _id: "plan-elite",
          name: "Elite Career Accelerator",
          price: 4999,
          interval: "year",
          description: "Annual all-inclusive pass with 1-on-1 mentor code reviews & placement support.",
          features: [
            "Everything in Pro",
            "Annual Cost Savings (2 Months Free)",
            "Mock Interviews with AI",
            "Direct Instructor Code Reviews",
          ],
          isPopular: false,
        },
      ];
    }
    return list;
  }, [plansData]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Plan name is required");

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        interval: formData.interval,
        description: formData.description,
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      };
      await subscriptionApi.createPlanAdmin(payload);
      toast.success("Subscription plan created successfully!");
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create plan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Revenue & Monetization
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Subscription Plans
            </h1>
            <p className="mt-1 text-sm text-muted">
              Configure membership tiers, pricing models, feature gates, and promotional offerings.
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => setModalOpen(true)}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </HeroPanel>

      {loading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading subscription plans...</p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan._id || plan.id || plan.name}
              className={`app-card relative flex flex-col justify-between rounded-2xl p-6 transition-all ${
                plan.isPopular
                  ? "border-upto-blue ring-2 ring-upto-blue/30 shadow-xl shadow-blue-500/10"
                  : ""
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 right-6 rounded-full bg-upto-blue px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-black text-[hsl(var(--foreground))]">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted min-h-[32px]">{plan.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[hsl(var(--foreground))]">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-muted">/{plan.interval}</span>
                </div>

                <ul className="mt-6 space-y-2.5 border-t border-[hsl(var(--border))] pt-4">
                  {(plan.features || []).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))]">
                      <Check className="h-4 w-4 text-upto-green shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                  Edit Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-black">Create Subscription Plan</h2>
            <form onSubmit={handleCreatePlan} className="mt-4 space-y-4">
              <Field
                id="name"
                label="Plan Name"
                placeholder="e.g. Masterclass Quarterly"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Field
                id="price"
                label="Price (INR)"
                type="number"
                placeholder="499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Field
                id="interval"
                label="Billing Interval"
                placeholder="month / year / quarter"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                required
              />
              <Field
                id="description"
                label="Description"
                placeholder="Brief summary of plan perks"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Field
                id="features"
                label="Features (comma-separated)"
                placeholder="Feature 1, Feature 2, Feature 3"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
