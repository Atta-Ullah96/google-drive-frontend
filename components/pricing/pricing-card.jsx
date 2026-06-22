import Link from "next/link";

function CheckIcon({ available = true }) {
  return available ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
  );
}

export function PricingFeature({ children, available = true }) {
  return <li className={`flex items-start gap-2.5 text-sm ${available ? "text-gray-700" : "text-gray-400"}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${available ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}><CheckIcon available={available} /></span><span className="leading-5">{children}</span></li>;
}

export default function PricingCard({ plan }) {
  const buttonStyles = plan.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50";
  const storageStyles = { green: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-800" };
  const external = plan.href.startsWith("mailto:");

  return <article className={`relative flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${plan.popular ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"}`}>
    {plan.popular && <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">Most Popular</span>}
    <div className="pr-20"><h2 className="text-xl font-semibold text-gray-950">{plan.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">{plan.description}</p></div>
    <div className="mt-6 flex items-end gap-1"><span className="text-4xl font-semibold text-gray-950">${plan.price}</span><span className="pb-1 text-sm text-gray-500">/month</span></div>
    <div className={`mt-5 inline-flex w-fit items-center rounded-md px-3 py-2 text-sm font-semibold ${storageStyles[plan.tone]}`}><svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>{plan.storage} storage</div>
    <div className="my-6 h-px bg-gray-100" />
    <ul className="flex-1 space-y-3">{plan.features.map((feature) => <PricingFeature key={feature}>{feature}</PricingFeature>)}{plan.limitations?.map((limitation) => <PricingFeature key={limitation} available={false}>{limitation}</PricingFeature>)}</ul>
    <Link href={plan.href} target={external ? "_blank" : undefined} className={`mt-7 flex h-11 items-center justify-center rounded-md text-sm font-semibold transition ${buttonStyles}`}>{plan.cta}</Link>
  </article>;
}
