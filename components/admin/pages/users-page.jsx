"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { deleteUser, getAdminUsers, updateUserStatus } from "@/lib/api/admin";
import { getAdminData, normalizeAdminUser, normalizePagination } from "@/lib/admin/adminData";
import { ConfirmModal, DataTable, ErrorState, FilterDropdown, LoadingState, PageHeader, Pagination, RoleBadge, SearchInput, Section, StorageProgressBar, UserCell, UserStatusBadge, formatBytes } from "@/components/admin/admin-ui";

const sortFields = { storage: "storageUsed", created: "createdAt", active: "lastActiveAt" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("storage");
  const [pagination, setPagination] = useState(normalizePagination());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminUsers({
        page: pagination.page,
        limit: 20,
        search: query.trim() || undefined,
        status: status === "all" ? undefined : status,
        role: role === "all" ? undefined : role,
        sort: sortFields[sort],
        order: "desc",
      });
      const data = getAdminData(response);
      setUsers((data.users || []).map(normalizeAdminUser));
      setPagination(normalizePagination(data.pagination));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, query, role, sort, status]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadUsers, query]);

  const runAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    setActionError("");
    try {
      if (pendingAction.type === "delete") {
        await deleteUser(pendingAction.user.id);
      } else {
        const nextStatus = pendingAction.user.status === "active" ? "blocked" : "active";
        await updateUserStatus(pendingAction.user.id, nextStatus);
      }
      setPendingAction(null);
      await loadUsers();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: "user", label: "User", render: (user) => <UserCell user={user} /> },
    { key: "role", label: "Role", render: (user) => <RoleBadge role={user.role} /> },
    { key: "status", label: "Status", render: (user) => <UserStatusBadge status={user.status} /> },
    { key: "storage", label: "Storage", render: (user) => <div className="w-36"><StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /><p className="mt-1 text-[10px] text-gray-400">of {formatBytes(user.storageLimit)}</p></div> },
    { key: "files", label: "Files / folders", render: (user) => <span>{user.files} / {user.folders}</span> },
    { key: "createdAt", label: "Joined" },
    { key: "lastActive", label: "Last active" },
    { key: "actions", label: "Actions", render: (user) => <div className="flex items-center gap-2 whitespace-nowrap"><Link href={`/admin/users/${user.id}`} className="font-semibold text-blue-600">View</Link><button type="button" onClick={() => { setActionError(""); setPendingAction({ user, type: "status" }); }} className="font-medium text-gray-600">{user.status === "active" ? "Block" : "Unblock"}</button><button type="button" onClick={() => { setActionError(""); setPendingAction({ user, type: "delete" }); }} className="font-medium text-red-600">Delete</button></div> },
  ];

  return <><PageHeader eyebrow="User management" title="Users" description="Manage access, account roles, storage allocation, and account status." />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Matching users</p><p className="mt-1 text-xl font-semibold">{pagination.total}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Active on page</p><p className="mt-1 text-xl font-semibold text-emerald-600">{users.filter((user) => user.status === "active").length}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Blocked on page</p><p className="mt-1 text-xl font-semibold text-red-600">{users.filter((user) => user.status === "blocked").length}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Admins on page</p><p className="mt-1 text-xl font-semibold text-violet-600">{users.filter((user) => user.role === "admin").length}</p></div></div>
    {error && <ErrorState message={error} />}
    <Section title="All accounts" description={`${pagination.total} matching users`}><div className="mb-4 flex flex-col gap-2 lg:flex-row"><SearchInput value={query} onChange={(value) => { setQuery(value); setPagination((item) => ({ ...item, page: 1 })); }} placeholder="Search name or email" /><FilterDropdown label="Status" value={status} onChange={(value) => { setStatus(value); setPagination((item) => ({ ...item, page: 1 })); }} options={[{value:"all",label:"All statuses"},{value:"active",label:"Active"},{value:"blocked",label:"Blocked"}]} /><FilterDropdown label="Role" value={role} onChange={(value) => { setRole(value); setPagination((item) => ({ ...item, page: 1 })); }} options={[{value:"all",label:"All roles"},{value:"user",label:"User"},{value:"admin",label:"Admin"}]} /><FilterDropdown label="Sort" value={sort} onChange={setSort} options={[{value:"storage",label:"Storage used"},{value:"created",label:"Created date"},{value:"active",label:"Last active"}]} /></div>{loading ? <LoadingState /> : <DataTable columns={columns} rows={users} emptyMessage="No users match these filters." />}<Pagination page={pagination.page} pages={pagination.totalPages} onChange={(page) => setPagination((item) => ({ ...item, page }))} /></Section>
    {actionError && <div className="fixed bottom-5 right-5 z-[90] max-w-sm rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-lg">{actionError}</div>}
    <ConfirmModal open={Boolean(pendingAction)} title={pendingAction?.type === "delete" ? "Delete this user?" : `${pendingAction?.user?.status === "active" ? "Block" : "Unblock"} this user?`} description={pendingAction?.type === "delete" ? `${pendingAction?.user?.name}'s account, files, folders, and sessions will be permanently removed.` : `${pendingAction?.user?.name} will ${pendingAction?.user?.status === "active" ? "lose access to Storix" : "regain access to Storix"}.`} confirmLabel={actionLoading ? "Working..." : pendingAction?.type === "delete" ? "Delete user" : pendingAction?.user?.status === "active" ? "Block user" : "Unblock user"} tone={pendingAction?.type === "delete" ? "danger" : "warning"} onClose={() => !actionLoading && setPendingAction(null)} onConfirm={runAction} />
  </>;
}
