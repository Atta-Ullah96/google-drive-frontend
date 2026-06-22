"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStorageAnalytics } from "@/lib/api/admin";
import { getAdminData, getFileType, normalizeAdminFile, normalizeAdminUser } from "@/lib/admin/adminData";
import { DataTable, ErrorState, formatBytes, LoadingState, PageHeader, Section, StatCard, StorageProgressBar, UserCell } from "@/components/admin/admin-ui";

const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-red-400", "bg-cyan-500", "bg-gray-400"];

export default function StoragePage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getStorageAnalytics();
      setAnalytics(getAdminData(response));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadAnalytics, 0);
    return () => clearTimeout(timer);
  }, [loadAnalytics]);

  const topUsers = useMemo(() => (analytics?.topStorageUsers || []).map(normalizeAdminUser), [analytics]);
  const nearQuota = useMemo(() => (analytics?.usersNearQuota || []).map(normalizeAdminUser), [analytics]);
  const largeFiles = useMemo(() => (analytics?.largeFiles || []).map(normalizeAdminFile), [analytics]);
  const typeUsage = useMemo(() => {
    const groups = new Map();
    for (const item of analytics?.fileTypeBreakdown || []) {
      const label = getFileType(item.mimeType);
      const current = groups.get(label) || { label, size: 0, files: 0 };
      current.size += Number(item.totalSize || 0);
      current.files += Number(item.filesCount || 0);
      groups.set(label, current);
    }
    return [...groups.values()].sort((a, b) => b.size - a.size).map((item, index) => ({ ...item, color: colors[index % colors.length] }));
  }, [analytics]);

  if (loading) return <><PageHeader eyebrow="Storage analytics" title="Capacity and utilization" description="Loading live storage information." /><LoadingState /></>;
  if (!analytics) return <><PageHeader eyebrow="Storage analytics" title="Capacity and utilization" description="Understand how assigned quota is consumed." /><ErrorState message={error} /></>;

  const totalUsed = Number(analytics.totalStorageUsed || 0);
  const totalLimit = Number(analytics.totalStorageLimit || 0);
  const topType = typeUsage[0];
  const userColumns = [
    { key: "user", label: "User", render: (user) => <UserCell user={user} /> },
    { key: "used", label: "Storage used", render: (user) => formatBytes(user.storageUsed) },
    { key: "limit", label: "Limit", render: (user) => formatBytes(user.storageLimit) },
    { key: "usage", label: "Usage", render: (user) => <StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /> },
    { key: "actions", label: "", render: (user) => <Link href={`/admin/users/${user.id}`} className="font-semibold text-blue-600">View</Link> },
  ];
  const fileColumns = [
    { key: "name", label: "File", render: (file) => <div><p className="font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-400">{file.mimeType}</p></div> },
    { key: "owner", label: "Owner" }, { key: "size", label: "Size", render: (file) => formatBytes(file.size) },
    { key: "folder", label: "Path" }, { key: "uploadedAt", label: "Uploaded" },
  ];

  return <><PageHeader eyebrow="Storage analytics" title="Capacity and utilization" description="Understand how assigned quota is consumed across users and file types." actions={<button type="button" onClick={loadAnalytics} className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700">Refresh</button>} />
    {error && <ErrorState message={error} />}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"><StatCard label="Used storage" value={formatBytes(totalUsed)} icon="storage" /><StatCard label="Remaining" value={formatBytes(Math.max(totalLimit-totalUsed,0))} tone="green" icon="storage" /><StatCard label="Total files" value={Number(analytics.totalFiles || 0).toLocaleString()} tone="violet" icon="files" /><StatCard label="Total folders" value={Number(analytics.totalFolders || 0).toLocaleString()} tone="amber" icon="files" /><StatCard label="Top file type" value={topType?.label || "None"} detail={topType ? formatBytes(topType.size) : "No files"} icon="files" /><StatCard label="Near quota" value={analytics.usersOver80Percent || 0} detail="Above 80%" tone="red" icon="alert" /></div>
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Section title="Users close to quota" description="Accounts currently using at least 80%"><div className="space-y-4">{nearQuota.length ? nearQuota.map((user) => <div key={user.id} className="grid grid-cols-[minmax(0,1fr)_minmax(120px,220px)] items-center gap-4"><UserCell user={user} /><StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /></div>) : <p className="text-sm text-gray-500">No users are currently close to their quota.</p>}</div></Section><Section title="Usage by file type"><div className="flex h-4 overflow-hidden rounded-full bg-gray-100">{typeUsage.map((type) => <div key={type.label} className={type.color} style={{ width: `${totalUsed ? (type.size / totalUsed) * 100 : 0}%` }} title={`${type.label}: ${formatBytes(type.size)}`} />)}</div><div className="mt-5 grid grid-cols-2 gap-3">{typeUsage.map((type) => <div key={type.label} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-gray-600"><span className={`h-2 w-2 rounded-full ${type.color}`} />{type.label}</span><strong>{formatBytes(type.size)}</strong></div>)}</div><div className="mt-5 border-t border-gray-100 pt-4"><p className="text-xs font-semibold text-gray-700">Average storage per user</p><p className="mt-1 text-2xl font-semibold text-gray-950">{formatBytes(analytics.averageStoragePerUser || 0)}</p></div></Section></div>
    <Section title="Top storage users" description="Sorted by storage currently consumed"><DataTable columns={userColumns} rows={topUsers} /></Section>
    <Section title="Large files" description="Largest individual objects stored on the platform"><DataTable columns={fileColumns} rows={largeFiles} /></Section>
  </>;
}
