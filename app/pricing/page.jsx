import PricingCard from "@/components/pricing/pricing-card";
import PricingComparisonTable from "@/components/pricing/pricing-comparison-table";
import PricingFAQ from "@/components/pricing/pricing-faq";
import PricingCTA from "@/components/pricing/pricing-cta";
import { comparisonRows, pricingFaqs, pricingPlans } from "@/components/pricing/pricing-data";

export const metadata = {
  title: "Pricing | Storix",
  description: "Choose a Storix cloud storage plan for personal work, professional projects, or growing teams.",
};

export default function PricingPage() {
  return <main className="flex-1 bg-white">
    <section className="border-b border-gray-100 bg-[#f7f9fc] px-4 py-16 sm:px-6 sm:py-20"><div className="mx-auto max-w-4xl text-center"><span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Storix Pricing Plans</span><h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl">Simple, transparent pricing for secure cloud storage</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">Choose the plan that fits your storage needs. Start free and upgrade when you need more space.</p><div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-gray-600">{["No setup fees", "Upgrade anytime", "Secure file access"].map((item) => <span key={item} className="inline-flex items-center gap-2"><svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>{item}</span>)}</div></div></section>
    <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-6xl"><div className="grid items-stretch gap-5 lg:grid-cols-3">{pricingPlans.map((plan) => <PricingCard key={plan.name} plan={plan} />)}</div></div></section>
    <section className="border-y border-gray-100 bg-[#f7f9fc] px-4 py-16 sm:px-6"><div className="mx-auto max-w-6xl"><div className="mb-8 max-w-2xl"><p className="text-xs font-semibold uppercase text-blue-600">Compare plans</p><h2 className="mt-2 text-3xl font-semibold text-gray-950">Find the right level of storage</h2><p className="mt-3 text-sm leading-6 text-gray-600">Every plan includes secure account access and the core Storix file experience.</p></div><PricingComparisonTable rows={comparisonRows} /></div></section>
    <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-xs font-semibold uppercase text-blue-600">Pricing FAQ</p><h2 className="mt-2 text-3xl font-semibold text-gray-950">Questions before you choose?</h2><p className="mt-3 text-sm text-gray-600">The essentials about plans, limits, and upgrading.</p></div><PricingFAQ items={pricingFaqs} /></div></section>
    <PricingCTA />
  </main>;
}
