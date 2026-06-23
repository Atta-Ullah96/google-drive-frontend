"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscription, createPortalSession, getMySubscription, resumeSubscription } from "@/lib/api/billing";
import { getCurrentUser } from "@/lib/api/auth";
import { formatBytes, getResponseData, normalizeMySubscription } from "@/lib/billing/billingData";

function UsageBar({ used, limit, percent }) {
  const color = percent >= 100 ? "bg-red-600" : percent >= 85 ? "bg-amber-500" : "bg-blue-600";
  return <div><div className="mb-2 flex justify-between text-sm text-gray-600"><span>{formatBytes(used)} used</span><span>{formatBytes(limit)} limit</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div><p className="mt-2 text-xs text-gray-500">{percent}% of storage used</p></div>;
}

export default function BillingPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await getCurrentUser();
      const response = await getMySubscription();
      setSubscription(normalizeMySubscription(getResponseData(response)));
    } catch (requestError) {
      if (requestError.message.includes("Unable to get current user")) {
        router.replace(`/auth/login?redirect=${encodeURIComponent("/dashboard/billing")}`);
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(loadSubscription, 0);
    return () => clearTimeout(timer);
  }, [loadSubscription]);

  const openPortal = async () => {
    setActionLoading("portal");
    setError("");
    try {
      const response = await createPortalSession();
      const url = getResponseData(response).url || response?.url;
      if (!url) throw new Error("The backend did not return a Stripe portal URL.");
      window.location.href = url;
    } catch (requestError) {
      setError(requestError.message);
      setActionLoading("");
    }
  };

  const updateCancellation = async (action) => {
    setActionLoading(action);
    setError("");
    try {
      if (action === "cancel") await cancelSubscription();
      if (action === "resume") await resumeSubscription();
      await loadSubscription();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <main className="flex-1 bg-[#f7f9fc] px-4 py-10 sm:px-6"><div className="mx-auto max-w-5xl space-y-4"><div className="h-10 w-60 animate-pulse rounded bg-gray-200" /><div className="h-60 animate-pulse rounded-lg bg-white" /></div></main>;

  return <main className="flex-1 bg-[#f7f9fc] px-4 py-10 sm:px-6"><div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase text-blue-600">Billing</p><h1 className="mt-1 text-3xl font-semibold text-gray-950">Subscription and storage</h1><p className="mt-2 max-w-2xl text-sm text-gray-600">Manage your Storix plan, Stripe billing portal, and storage quota.</p></div><Link href="/pricing" className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm">View pricing</Link></div>
    {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {subscription && <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]"><section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{subscription.status}</span><h2 className="mt-4 text-2xl font-semibold text-gray-950">{subscription.planName} plan</h2><p className="mt-1 text-sm text-gray-500">{subscription.plan.priceLabel} with {subscription.plan.storage} storage</p></div><div className="flex flex-wrap gap-2">{subscription.planKey === "free" ? <Link href="/pricing" className="flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white">Upgrade plan</Link> : <button type="button" onClick={openPortal} disabled={Boolean(actionLoading)} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60">{actionLoading === "portal" ? "Opening..." : "Manage billing"}</button>}</div></div><div className="mt-8"><UsageBar used={subscription.storageUsed} limit={subscription.storageLimit} percent={subscription.usagePercent} />{subscription.storageUsed > subscription.storageLimit && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Your account is above its storage limit. Uploads may be blocked until you free space or upgrade.</p>}</div></section>
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-sm font-semibold text-gray-950">Plan details</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-gray-500">Current period end</span><strong className="text-right text-gray-900">{subscription.currentPeriodEndLabel}</strong></div><div className="flex justify-between gap-4"><span className="text-gray-500">Cancel at period end</span><strong className="text-right text-gray-900">{subscription.cancelAtPeriodEnd ? "Yes" : "No"}</strong></div><div className="flex justify-between gap-4"><span className="text-gray-500">Storage limit</span><strong className="text-right text-gray-900">{formatBytes(subscription.storageLimit)}</strong></div></div>{subscription.cancelAtPeriodEnd && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Your plan will remain active until the end of the billing period.</p>}<div className="mt-5 flex flex-col gap-2">{subscription.planKey !== "free" && !subscription.cancelAtPeriodEnd && <button type="button" onClick={() => updateCancellation("cancel")} disabled={Boolean(actionLoading)} className="h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-600 disabled:opacity-60">{actionLoading === "cancel" ? "Cancelling..." : "Cancel subscription"}</button>}{subscription.cancelAtPeriodEnd && <button type="button" onClick={() => updateCancellation("resume")} disabled={Boolean(actionLoading)} className="h-10 rounded-md border border-emerald-200 px-4 text-sm font-semibold text-emerald-700 disabled:opacity-60">{actionLoading === "resume" ? "Resuming..." : "Resume subscription"}</button>}</div></section></div>}
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-sm font-semibold text-gray-950">Payment history</h2>{subscription?.invoices?.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500"><th className="py-2">Invoice</th><th>Status</th><th>Amount</th><th>Date</th><th></th></tr></thead><tbody>{subscription.invoices.map((invoice) => <tr key={invoice.id || invoice._id || invoice.invoiceUrl} className="border-b border-gray-50"><td className="py-3">{invoice.number || invoice.id || "Invoice"}</td><td className="capitalize">{invoice.status || "unknown"}</td><td>{invoice.amountPaid || invoice.amount || ""}</td><td>{invoice.createdAt || invoice.paidAt || ""}</td><td>{invoice.hostedInvoiceUrl && <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Open</a>}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-gray-500">No invoices are available yet.</p>}</section></div></main>;
}
