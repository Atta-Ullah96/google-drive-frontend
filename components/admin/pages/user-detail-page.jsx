"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser, getAdminUserById, updateUserRole, updateUserStatus, updateUserStorageLimit } from "@/lib/api/admin";
import { getAdminData, normalizeActivity, normalizeAdminFile, normalizeAdminUser } from "@/lib/admin/adminData";
import { ConfirmModal, DataTable, ErrorState, formatBytes, LoadingState, PageHeader, RoleBadge, Section, StatCard, StorageProgressBar, UserStatusBadge } from "@/components/admin/admin-ui";

export default function UserDetailPage({ userId }) {
  const router = useRouter();
  const [details, setDetails] = useState(null);
  const [quota, setQuota] = useState(1);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminUserById(userId);
      const data = getAdminData(response);
      const storage = data.storage || {};
      const user = normalizeAdminUser(data.user, {
        storageUsed: storage.used,
        storageLimit: storage.limit,
        files: data.filesCount,
        folders: data.foldersCount,
      });
      setDetails({ ...data, user, storage });
      setQuota(Math.max(Number((storage.limit / 1024 ** 3).toFixed(2)), 1));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(loadUser, 0);
    return () => clearTimeout(timer);
  }, [loadUser]);

  const recentFiles = useMemo(() => (details?.recentFiles || []).map(normalizeAdminFile), [details]);
  const recentActivity = useMemo(() => (details?.recentActivity || []).map(normalizeActivity), [details]);

  const runMutation = async (operation, successMessage) => {
    setActionLoading(true);
    setError("");
    setNotice("");
    try {
      await operation();
      setModal(null);
      setNotice(successMessage);
      await loadUser();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !details) return <><PageHeader eyebrow="User details" title="Loading user" description="Retrieving account and storage information." /><LoadingState /></>;
  if (!details) return <><Link href="/admin/users" className="text-xs font-semibold text-blue-600">Back to users</Link><ErrorState message={error || "User not found."} /></>;

  const { user, storage } = details;
  const fileColumns = [{key:"name",label:"File"},{key:"type",label:"Type"},{key:"size",label:"Size",render:(file)=>formatBytes(file.size)},{key:"folder",label:"Folder"},{key:"uploadedAt",label:"Uploaded"}];

  const confirmAction = async () => {
    if (modal === "delete") {
      setActionLoading(true);
      setError("");
      try {
        await deleteUser(user.id);
        router.push("/admin/users");
        router.refresh();
      } catch (requestError) {
        setError(requestError.message);
        setActionLoading(false);
      }
      return;
    }
    const status = user.status === "active" ? "blocked" : "active";
    await runMutation(() => updateUserStatus(user.id, status), `User status changed to ${status}.`);
  };

  return <><div><Link href="/admin/users" className="text-xs font-semibold text-blue-600">Back to users</Link></div><PageHeader eyebrow="User details" title={user.name} description="Account profile, storage usage, recent content, and administrative controls." actions={<div className="flex gap-2"><UserStatusBadge status={user.status} /><RoleBadge role={user.role} /></div>} />
    {error && <ErrorState message={error} />}{notice && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">{notice}</div>}
    <div className="grid gap-4 xl:grid-cols-[.7fr_1.3fr]"><Section title="Profile summary"><div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">{user.avatar}</span><div><h2 className="text-lg font-semibold">{user.name}</h2><p className="text-sm text-gray-500">{user.email}</p><p className="mt-2 text-xs text-gray-400">Joined {user.createdAt} / Last active {user.lastActive}</p></div></div><dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4"><div><dt className="text-xs text-gray-500">Account ID</dt><dd className="mt-1 break-all text-sm font-medium">{user.id}</dd></div><div><dt className="text-xs text-gray-500">Authentication</dt><dd className="mt-1 text-sm font-medium capitalize">{user.provider || "local"}</dd></div></dl></Section><Section title="Storage summary" description={`${formatBytes(storage.used)} of ${formatBytes(storage.limit)} used`}><div className="mt-2"><StorageProgressBar used={storage.used} limit={storage.limit} /></div><div className="mt-6 grid grid-cols-3 gap-3"><div className="rounded-md bg-gray-50 p-3"><p className="text-xs text-gray-500">Used</p><p className="mt-1 font-semibold">{formatBytes(storage.used)}</p></div><div className="rounded-md bg-gray-50 p-3"><p className="text-xs text-gray-500">Available</p><p className="mt-1 font-semibold">{formatBytes(storage.remaining)}</p></div><div className="rounded-md bg-gray-50 p-3"><p className="text-xs text-gray-500">Limit</p><p className="mt-1 font-semibold">{formatBytes(storage.limit)}</p></div></div><div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-medium text-gray-600">Storage limit (GB)<input type="number" min="0.01" step="0.01" value={quota} onChange={(event) => setQuota(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500" /></label><button type="button" disabled={actionLoading} onClick={() => runMutation(() => updateUserStorageLimit(user.id, Number(quota) * 1024 ** 3), "Storage limit updated.")} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white disabled:opacity-50">Update quota</button></div></Section></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Files" value={user.files} icon="files" /><StatCard label="Folders" value={user.folders} tone="amber" icon="files" /><StatCard label="Storage used" value={formatBytes(storage.used)} tone="green" icon="storage" /><StatCard label="Quota usage" value={`${storage.usagePercentage || 0}%`} tone="violet" icon="activity" /></div>
    <Section title="Recent files" action={<Link href="/admin/files" className="text-xs font-semibold text-blue-600">View all files</Link>}><DataTable columns={fileColumns} rows={recentFiles} emptyMessage="This user has no files." /></Section>
    <div className="grid gap-4 xl:grid-cols-[1fr_.65fr]"><Section title="Activity timeline"><div className="space-y-4">{recentActivity.length ? recentActivity.map((item) => <div key={item.id} className="flex gap-3"><span className={`mt-1.5 h-2 w-2 rounded-full ${item.status === "failed" ? "bg-red-500" : "bg-blue-500"}`} /><div><p className="text-sm font-medium">{item.action.replaceAll("_", " ")}</p><p className="text-xs text-gray-500">{item.detailsText}</p><p className="mt-1 text-[10px] text-gray-400">{item.date}</p></div></div>) : <p className="text-sm text-gray-500">No recent activity.</p>}</div></Section><Section title="Admin actions" description="Changes here affect account access"><div className="space-y-2"><button type="button" disabled={actionLoading} onClick={() => runMutation(() => updateUserRole(user.id, user.role === "admin" ? "user" : "admin"), "User role updated.")} className="h-9 w-full rounded-md border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-50">Change role to {user.role === "admin" ? "user" : "admin"}</button><button type="button" onClick={() => setModal("status")} className="h-9 w-full rounded-md border border-amber-200 text-xs font-semibold text-amber-700">{user.status === "active" ? "Block account" : "Unblock account"}</button><button type="button" onClick={() => setModal("delete")} className="h-9 w-full rounded-md border border-red-200 text-xs font-semibold text-red-600">Delete account</button></div></Section></div>
    <ConfirmModal open={Boolean(modal)} title={modal === "delete" ? "Delete this account?" : `${user.status === "active" ? "Block" : "Unblock"} ${user.name}?`} description={modal === "delete" ? "This permanently removes the account, its files from S3, folders, and active sessions." : `This user will ${user.status === "active" ? "lose" : "regain"} access to Storix.`} confirmLabel={actionLoading ? "Working..." : modal === "delete" ? "Delete user" : user.status === "active" ? "Block user" : "Unblock user"} tone={modal === "delete" ? "danger" : "warning"} onClose={() => !actionLoading && setModal(null)} onConfirm={confirmAction} />
  </>;
}
