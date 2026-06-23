"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminOverview, getAdminSubscriptionStats } from "@/lib/api/admin";
import { getAdminData, normalizeAdminFile, normalizeAdminUser } from "@/lib/admin/adminData";
import { formatMoney, getResponseData, normalizeSubscriptionStats } from "@/lib/billing/billingData";
import { Badge, ErrorState, formatBytes, LoadingState, PageHeader, Section, StatCard, StorageProgressBar, UserCell } from "@/components/admin/admin-ui";
import AdminIcon from "@/components/admin/admin-icons";

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overviewResponse, statsResponse] = await Promise.all([
        getAdminOverview(),
        getAdminSubscriptionStats().catch(() => null),
      ]);
      setOverview(getAdminData(overviewResponse));
      setSubscriptionStats(statsResponse ? normalizeSubscriptionStats(getResponseData(statsResponse)) : null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadOverview, 0);
    return () => clearTimeout(timer);
  }, [loadOverview]);

  const topUsers = useMemo(() => (overview?.topStorageUsers || []).map(normalizeAdminUser), [overview]);
  const recentUsers = useMemo(() => (overview?.recentUsers || []).map(normalizeAdminUser), [overview]);
  const recentFiles = useMemo(() => (overview?.recentFiles || []).map(normalizeAdminFile), [overview]);
  const recentPayments = useMemo(() => subscriptionStats?.recentPayments || [], [subscriptionStats]);

  if (loading) return <><PageHeader eyebrow="Admin overview" title="Platform at a glance" description="Loading live platform metrics from Storix." /><LoadingState /></>;
  if (error) return <><PageHeader eyebrow="Admin overview" title="Platform at a glance" description="Monitor account growth, storage, and service health." /><ErrorState message={error} /><button type="button" onClick={loadOverview} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white">Try again</button></>;

  const storageUsed = Number(overview?.totalStorageUsed || 0);
  const storageLimit = Number(overview?.totalStorageLimit || 0);
  const usedPercent = storageLimit ? Math.round((storageUsed / storageLimit) * 100) : 0;
  const userTotal = Number(overview?.totalUsers || 0);
  const activePercent = userTotal ? Math.round((Number(overview.activeUsers || 0) / userTotal) * 100) : 0;
  const systemServices = Object.entries(overview?.systemStatus || {});

  return <><PageHeader eyebrow="Admin overview" title="Platform at a glance" description="Monitor account growth, storage consumption, uploads, and service health across Storix." actions={<button type="button" onClick={loadOverview} className="flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm"><AdminIcon name="refresh" className="h-3.5 w-3.5" />Refresh data</button>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"><StatCard label="Total users" value={userTotal.toLocaleString()} icon="users" /><StatCard label="Active users" value={Number(overview?.activeUsers || 0).toLocaleString()} detail={`${activePercent}% of accounts`} tone="green" icon="activity" /><StatCard label="Blocked users" value={Number(overview?.blockedUsers || 0).toLocaleString()} tone="red" icon="alert" /><StatCard label="New this month" value={Number(overview?.newUsersThisMonth || 0).toLocaleString()} tone="violet" icon="users" /><StatCard label="Total files" value={Number(overview?.totalFiles || 0).toLocaleString()} tone="amber" icon="files" /><StatCard label="Storage used" value={formatBytes(storageUsed)} detail={`${usedPercent}% of assigned quota`} icon="storage" /></div>
    {subscriptionStats && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6"><StatCard label="MRR" value={formatMoney(subscriptionStats.monthlyRecurringRevenue)} detail="Monthly recurring revenue" tone="green" icon="storage" /><StatCard label="Total revenue" value={formatMoney(subscriptionStats.totalRevenue)} tone="violet" icon="files" /><StatCard label="Active paid" value={subscriptionStats.activeSubscriptions.toLocaleString()} tone="blue" icon="activity" /><StatCard label="Pro users" value={subscriptionStats.proSubscribers.toLocaleString()} tone="blue" icon="users" /><StatCard label="Business users" value={subscriptionStats.businessSubscribers.toLocaleString()} tone="amber" icon="users" /><StatCard label="Failed payments" value={subscriptionStats.failedPayments.toLocaleString()} tone="red" icon="alert" /></div>}
    <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]"><Section title="Account distribution" description="Current platform access and role breakdown"><div className="mt-2 flex h-4 overflow-hidden rounded-full bg-gray-100"><div className="bg-emerald-500" style={{width:`${activePercent}%`}} /><div className="bg-red-500" style={{width:`${Math.max(100-activePercent,0)}%`}} /></div><div className="mt-5 grid grid-cols-3 gap-3"><div><p className="text-2xl font-semibold">{overview?.activeUsers || 0}</p><p className="text-xs text-gray-500">Active accounts</p></div><div><p className="text-2xl font-semibold">{overview?.blockedUsers || 0}</p><p className="text-xs text-gray-500">Blocked accounts</p></div><div><p className="text-2xl font-semibold">{overview?.adminUsers || 0}</p><p className="text-xs text-gray-500">Administrators</p></div></div></Section><Section title="Storage usage" description="Platform-wide assigned quota"><div className="flex items-end justify-between"><div><p className="text-3xl font-semibold text-gray-950">{formatBytes(storageUsed)}</p><p className="mt-1 text-xs text-gray-500">of {formatBytes(storageLimit)} assigned</p></div><span className="text-sm font-semibold text-blue-600">{usedPercent}%</span></div><div className="mt-6"><StorageProgressBar used={storageUsed} limit={storageLimit} showLabel={false} /></div><div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-center"><div><p className="text-sm font-semibold">{formatBytes(overview?.averageStoragePerUser || 0)}</p><p className="text-[10px] text-gray-500">Average per user</p></div><div><p className="text-sm font-semibold">{formatBytes(Math.max(storageLimit-storageUsed,0))}</p><p className="text-[10px] text-gray-500">Available quota</p></div></div></Section></div>
    <div className="grid gap-4 xl:grid-cols-2"><Section title="Top users by storage" action={<Link href="/admin/storage" className="text-xs font-semibold text-blue-600">View analytics</Link>}><div className="space-y-4">{topUsers.length ? topUsers.map((user) => <div key={user.id} className="grid grid-cols-[minmax(0,1fr)_minmax(110px,180px)] items-center gap-4"><UserCell user={user} /><StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /></div>) : <p className="text-sm text-gray-500">No storage usage recorded yet.</p>}</div></Section><Section title="Recently joined users" action={<Link href="/admin/users" className="text-xs font-semibold text-blue-600">Manage users</Link>}><div className="divide-y divide-gray-100">{recentUsers.map((user) => <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0"><UserCell user={user} /><div className="flex gap-2"><Badge tone={user.role === "admin" ? "violet" : "gray"}>{user.role}</Badge><Badge tone={user.status === "active" ? "green" : "red"}>{user.status}</Badge></div></div>)}</div></Section></div>
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><Section title="Recent uploads" action={<Link href="/admin/files" className="text-xs font-semibold text-blue-600">All files</Link>}><div className="divide-y divide-gray-100">{recentFiles.map((file) => <div key={file.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-xs font-semibold text-gray-800">{file.name}</p><p className="mt-1 text-[11px] text-gray-400">{file.owner} / {formatBytes(file.size)}</p></div><Badge tone={file.status === "completed" ? "green" : file.status === "failed" ? "red" : "amber"}>{file.status}</Badge></div>)}</div></Section><Section title="System status"><div className="space-y-3">{systemServices.map(([name,status]) => { const healthy = ["operational","connected","configured"].includes(status); return <div key={name} className="flex items-center justify-between gap-2"><span className="text-xs capitalize text-gray-600">{name}</span><Badge tone={healthy ? "green" : "red"}>{status}</Badge></div>; })}</div><Link href="/admin/health" className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-600">System health <AdminIcon name="arrow" className="h-3 w-3" /></Link></Section></div>
    {subscriptionStats && <Section title="Recent payments" description="Latest billing activity from subscription records" action={<Link href="/admin/payments" className="text-xs font-semibold text-blue-600">All payments</Link>}><div className="divide-y divide-gray-100">{recentPayments.length ? recentPayments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-xs font-semibold text-gray-800">{payment.userName}</p><p className="mt-1 text-[11px] text-gray-400">{payment.planName} / {payment.amountPaidLabel}</p></div><Badge tone={payment.status === "paid" ? "green" : payment.status === "failed" ? "red" : "amber"}>{payment.status}</Badge></div>) : <p className="text-sm text-gray-500">No recent payments returned yet.</p>}</div></Section>}
  </>;
}
