"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAdminSubscriptions } from "@/lib/api/admin";
import { getResponseData, normalizePagination, normalizeSubscription } from "@/lib/billing/billingData";
import { Badge, DataTable, ErrorState, FilterDropdown, LoadingState, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

const statusTone = (status) => {
  if (["active"].includes(status)) return "green";
  if (["trialing"].includes(status)) return "blue";
  if (["past_due", "unpaid"].includes(status)) return "red";
  if (["canceled", "cancelled"].includes(status)) return "gray";
  return "amber";
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [pagination, setPagination] = useState(normalizePagination());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminSubscriptions({
        page: pagination.page,
        limit: 20,
        search: query.trim() || undefined,
        plan: plan === "all" ? undefined : plan,
        status: status === "all" ? undefined : status,
        sort,
        order: "desc",
      });
      const data = getResponseData(response);
      setSubscriptions((data.subscriptions || data.items || []).map(normalizeSubscription));
      setPagination(normalizePagination(data.pagination));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, plan, query, sort, status]);

  useEffect(() => {
    const timer = setTimeout(loadSubscriptions, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadSubscriptions, query]);

  const columns = [
    { key: "user", label: "User", render: (item) => <div><p className="font-medium text-gray-900">{item.userName}</p><p className="text-xs text-gray-500">{item.userEmail}</p></div> },
    { key: "plan", label: "Plan", render: (item) => <Badge tone={item.planKey === "business" ? "violet" : item.planKey === "pro" ? "blue" : "gray"}>{item.planName}</Badge> },
    { key: "status", label: "Status", render: (item) => <Badge tone={statusTone(item.status)}>{item.status}</Badge> },
    { key: "amount", label: "Amount", render: (item) => item.amountLabel },
    { key: "period", label: "Period end", render: (item) => item.currentPeriodEnd },
    { key: "cancel", label: "Canceling", render: (item) => item.cancelAtPeriodEnd ? "Yes" : "No" },
    { key: "stripe", label: "Stripe IDs", render: (item) => <div className="max-w-48 space-y-1 text-[11px] text-gray-500"><p className="truncate">{item.stripeCustomerId}</p><p className="truncate">{item.stripeSubscriptionId}</p></div> },
    { key: "actions", label: "Actions", render: (item) => <div className="flex gap-3 whitespace-nowrap"><Link href={`/admin/subscriptions/${item.id}`} className="font-semibold text-blue-600">View</Link>{item.userId && <Link href={`/admin/users/${item.userId}`} className="font-semibold text-gray-600">User</Link>}</div> },
  ];

  return <><PageHeader eyebrow="Billing admin" title="Subscriptions" description="Search, filter, and inspect Storix subscriptions from Stripe-backed backend records." />
    {error && <ErrorState message={error} />}
    <Section title="All subscriptions" description={`${pagination.total} matching subscriptions`}><div className="mb-4 flex flex-col gap-2 lg:flex-row"><SearchInput value={query} onChange={(value) => { setQuery(value); setPagination((item) => ({ ...item, page: 1 })); }} placeholder="Search user or email" /><FilterDropdown label="Plan" value={plan} onChange={(value) => { setPlan(value); setPagination((item) => ({ ...item, page: 1 })); }} options={[{value:"all",label:"All plans"},{value:"free",label:"Free"},{value:"pro",label:"Pro"},{value:"business",label:"Business"}]} /><FilterDropdown label="Status" value={status} onChange={(value) => { setStatus(value); setPagination((item) => ({ ...item, page: 1 })); }} options={[{value:"all",label:"All statuses"},{value:"active",label:"Active"},{value:"trialing",label:"Trialing"},{value:"past_due",label:"Past due"},{value:"canceled",label:"Canceled"},{value:"unpaid",label:"Unpaid"}]} /><FilterDropdown label="Sort" value={sort} onChange={setSort} options={[{value:"createdAt",label:"Created date"},{value:"currentPeriodEnd",label:"Period end"},{value:"amount",label:"Amount"}]} /></div>{loading ? <LoadingState /> : <DataTable columns={columns} rows={subscriptions} emptyMessage="No subscriptions match these filters." />}<Pagination page={pagination.page} pages={pagination.totalPages} onChange={(page) => setPagination((item) => ({ ...item, page }))} /></Section></>;
}
