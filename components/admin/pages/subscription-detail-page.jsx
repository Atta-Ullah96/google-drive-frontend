"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminSubscriptionById } from "@/lib/api/admin";
import { formatBytes, getResponseData, normalizePayment, normalizeSubscription } from "@/lib/billing/billingData";
import { Badge, DataTable, ErrorState, LoadingState, PageHeader, Section, StatCard, StorageProgressBar, UserCell } from "@/components/admin/admin-ui";

export default function SubscriptionDetailPage({ subscriptionId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminSubscriptionById(subscriptionId);
      setDetails(getResponseData(response));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    const timer = setTimeout(loadDetails, 0);
    return () => clearTimeout(timer);
  }, [loadDetails]);

  const subscription = useMemo(() => normalizeSubscription(details?.subscription || details), [details]);
  const payments = useMemo(() => (details?.payments || details?.invoices || []).map(normalizePayment), [details]);
  const storage = details?.storage || {};
  const user = details?.user || details?.subscription?.user || {};

  if (loading) return <><PageHeader eyebrow="Billing admin" title="Subscription detail" description="Loading subscription information." /><LoadingState /></>;
  if (error) return <><PageHeader eyebrow="Billing admin" title="Subscription detail" description="Inspect one subscription and its payment history." /><ErrorState message={error} /></>;

  const paymentColumns = [
    { key: "createdAt", label: "Created" },
    { key: "status", label: "Status", render: (payment) => <Badge tone={payment.status === "paid" ? "green" : payment.status === "open" ? "amber" : "gray"}>{payment.status}</Badge> },
    { key: "amountPaid", label: "Paid", render: (payment) => payment.amountPaidLabel },
    { key: "amountDue", label: "Due", render: (payment) => payment.amountDueLabel },
    { key: "actions", label: "", render: (payment) => <div className="flex gap-3">{payment.invoiceUrl && <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Invoice</a>}{payment.invoicePdf && <a href={payment.invoicePdf} target="_blank" rel="noreferrer" className="font-semibold text-gray-600">PDF</a>}</div> },
  ];

  return <><PageHeader eyebrow="Billing admin" title={`${subscription.planName} subscription`} description={`${subscription.userName} / ${subscription.userEmail}`} actions={<Link href="/admin/subscriptions" className="h-9 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Back</Link>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Plan" value={subscription.planName} icon="storage" /><StatCard label="Status" value={subscription.status} tone={subscription.status === "active" ? "green" : "amber"} icon="activity" /><StatCard label="Amount" value={subscription.amountLabel} tone="blue" icon="files" /><StatCard label="Period end" value={subscription.currentPeriodEnd} tone="violet" icon="activity" /></div>
    <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]"><Section title="User information">{user?._id || user?.id ? <UserCell user={{ ...user, id: user._id || user.id, avatar: user.name?.slice(0,2)?.toUpperCase() }} /> : <p className="text-sm text-gray-500">No user information returned.</p>}<div className="mt-4 space-y-2 text-sm"><p><span className="text-gray-500">Customer:</span> {subscription.stripeCustomerId}</p><p><span className="text-gray-500">Subscription:</span> {subscription.stripeSubscriptionId}</p><p><span className="text-gray-500">Cancel at period end:</span> {subscription.cancelAtPeriodEnd ? "Yes" : "No"}</p>{subscription.userId && <Link href={`/admin/users/${subscription.userId}`} className="inline-flex pt-2 text-xs font-semibold text-blue-600">Open user profile</Link>}</div></Section><Section title="Storage summary"><div className="flex items-end justify-between"><div><p className="text-2xl font-semibold text-gray-950">{formatBytes(storage.used || storage.storageUsed || 0)}</p><p className="text-xs text-gray-500">of {formatBytes(storage.limit || storage.storageLimit || 0)}</p></div></div><div className="mt-5"><StorageProgressBar used={storage.used || storage.storageUsed || 0} limit={storage.limit || storage.storageLimit || 0} /></div></Section></div>
    <Section title="Payment history" description="Recent invoices and payments for this subscription"><DataTable columns={paymentColumns} rows={payments} emptyMessage="No payments returned for this subscription." /></Section></>;
}
