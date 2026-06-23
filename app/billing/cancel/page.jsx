import Link from "next/link";

export const metadata = {
  title: "Checkout Cancelled | Storix",
};

export default function BillingCancelPage() {
  return <main className="flex flex-1 items-center justify-center bg-[#f7f9fc] px-4 py-16"><section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg></div><h1 className="mt-5 text-2xl font-semibold text-gray-950">Checkout was cancelled</h1><p className="mt-3 text-sm leading-6 text-gray-600">No payment was completed and your current Storix plan has not changed.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/pricing" className="flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white">Back to pricing</Link><Link href="/" className="flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700">Go to dashboard</Link></div></section></main>;
}
