import Link from "next/link";

export const metadata = {
  title: "Payment Complete | Storix",
};

export default function BillingSuccessPage() {
  return <main className="flex flex-1 items-center justify-center bg-[#f7f9fc] px-4 py-16"><section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg></div><h1 className="mt-5 text-2xl font-semibold text-gray-950">Payment completed</h1><p className="mt-3 text-sm leading-6 text-gray-600">Your subscription is being activated. Stripe webhooks may take a few seconds to update your account.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard/billing" className="flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white">Go to billing</Link><Link href="/" className="flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700">Go to dashboard</Link></div></section></main>;
}
