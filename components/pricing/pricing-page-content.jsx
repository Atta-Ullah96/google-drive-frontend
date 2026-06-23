"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PricingCard from "@/components/pricing/pricing-card";
import PricingComparisonTable from "@/components/pricing/pricing-comparison-table";
import PricingFAQ from "@/components/pricing/pricing-faq";
import PricingCTA from "@/components/pricing/pricing-cta";
import UpgradePlanModal from "@/components/pricing/upgrade-plan-modal";
import { comparisonRows, pricingFaqs, pricingPlans } from "@/components/pricing/pricing-data";
import { createCheckoutSession, createPortalSession, getMySubscription } from "@/lib/api/billing";
import { getCurrentUser } from "@/lib/api/auth";
import { getResponseData, normalizeMySubscription } from "@/lib/billing/billingData";

const normalizeCurrentUser = (payload) => payload?.user || payload?.data?.user || payload?.data || payload || null;

export default function PricingPageContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadBillingState = async () => {
      try {
        const userResponse = await getCurrentUser();
        if (ignore) return;
        setCurrentUser(normalizeCurrentUser(userResponse));

        const subscriptionResponse = await getMySubscription();
        if (!ignore) setSubscription(normalizeMySubscription(getResponseData(subscriptionResponse)));
      } catch {
        if (!ignore) {
          setCurrentUser(null);
          setSubscription(null);
        }
      }
    };

    loadBillingState();
    return () => {
      ignore = true;
    };
  }, []);

  const currentPlanKey = subscription?.planKey || "free";
  const isPaid = currentPlanKey !== "free";

  const buttonState = useMemo(() => {
    const states = {};
    for (const plan of pricingPlans) {
      if (currentUser && plan.planKey === currentPlanKey) {
        states[plan.planKey] = "Current Plan";
      } else if (currentUser && plan.planKey === "free" && isPaid) {
        states[plan.planKey] = "Manage Billing";
      } else if (plan.planKey === "free") {
        states[plan.planKey] = currentUser ? "Current Plan" : "Get Started";
      } else {
        states[plan.planKey] = `Upgrade to ${plan.name}`;
      }
    }
    return states;
  }, [currentPlanKey, currentUser, isPaid]);

  const redirectToPortal = async (planKey) => {
    setLoadingPlan(planKey);
    setError("");
    try {
      const response = await createPortalSession();
      const url = getResponseData(response).url || response?.url;
      if (!url) throw new Error("The backend did not return a Stripe portal URL.");
      window.location.href = url;
    } catch (requestError) {
      setError(requestError.message);
      setLoadingPlan("");
    }
  };

  const handlePlanSelect = async (plan) => {
    if (!currentUser) {
      const target = plan.planKey === "free" ? "/auth/signup" : `/auth/login?redirect=${encodeURIComponent("/pricing")}`;
      router.push(target);
      return;
    }

    if (plan.planKey === currentPlanKey) return;

    if (plan.planKey === "free" || isPaid) {
      await redirectToPortal(plan.planKey);
      return;
    }

    setError("");
    setSelectedPlan(plan);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setLoadingPlan(selectedPlan.planKey);
    setError("");
    try {
      const response = await createCheckoutSession(selectedPlan.planKey);
      const url = getResponseData(response).url || response?.url;
      if (!url) throw new Error("The backend did not return a Stripe checkout URL.");
      window.location.href = url;
    } catch (requestError) {
      setError(requestError.message);
      setLoadingPlan("");
    }
  };

  return <main className="flex-1 bg-white">
    <section className="border-b border-gray-100 bg-[#f7f9fc] px-4 py-16 sm:px-6 sm:py-20"><div className="mx-auto max-w-4xl text-center"><span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Storix Pricing Plans</span><h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl">Simple, transparent pricing for secure cloud storage</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">Choose the plan that fits your storage needs. Start free and upgrade when you need more space.</p><div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-gray-600">{["No setup fees", "Upgrade anytime", "Secure file access"].map((item) => <span key={item} className="inline-flex items-center gap-2"><svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>{item}</span>)}</div></div></section>
    <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-6xl">{error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="grid items-stretch gap-5 lg:grid-cols-3">{pricingPlans.map((plan) => <PricingCard key={plan.name} plan={plan} buttonLabel={buttonState[plan.planKey]} loading={loadingPlan === plan.planKey} disabled={Boolean(loadingPlan) || (currentUser && plan.planKey === currentPlanKey)} onSelect={handlePlanSelect} />)}</div></div></section>
    <section className="border-y border-gray-100 bg-[#f7f9fc] px-4 py-16 sm:px-6"><div className="mx-auto max-w-6xl"><div className="mb-8 max-w-2xl"><p className="text-xs font-semibold uppercase text-blue-600">Compare plans</p><h2 className="mt-2 text-3xl font-semibold text-gray-950">Find the right level of storage</h2><p className="mt-3 text-sm leading-6 text-gray-600">Every plan includes secure account access and the core Storix file experience.</p></div><PricingComparisonTable rows={comparisonRows} /></div></section>
    <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-xs font-semibold uppercase text-blue-600">Pricing FAQ</p><h2 className="mt-2 text-3xl font-semibold text-gray-950">Questions before you choose?</h2><p className="mt-3 text-sm text-gray-600">The essentials about plans, limits, and upgrading.</p></div><PricingFAQ items={pricingFaqs} /></div></section>
    <PricingCTA />
    <UpgradePlanModal isOpen={Boolean(selectedPlan)} plan={selectedPlan} loading={Boolean(loadingPlan)} onClose={() => !loadingPlan && setSelectedPlan(null)} onConfirm={handleCheckout} />
  </main>;
}
