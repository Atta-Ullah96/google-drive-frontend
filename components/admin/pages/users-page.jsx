"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminUsers } from "@/lib/admin/adminMockData";
import { ConfirmModal, DataTable, FilterDropdown, PageHeader, Pagination, RoleBadge, SearchInput, Section, StorageProgressBar, UserCell, UserStatusBadge, formatBytes } from "@/components/admin/admin-ui";

export default function UsersPage() {
  const [users, setUsers] = useState(adminUsers);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("storage");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState(null);
  const filteredUsers = useMemo(() => users.filter((user) => (!query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())) && (status === "all" || user.status === status) && (role === "all" || user.role === role)).sort((a,b) => sort === "storage" ? b.storageUsed-a.storageUsed : sort === "created" ? new Date(b.createdAt)-new Date(a.createdAt) : a.lastActive.localeCompare(b.lastActive)), [users, query, status, role, sort]);
  const update = (user, type) => {
    if (type === "delete") setUsers((items) => items.filter((item) => item.id !== user.id));
    if (type === "status") setUsers((items) => items.map((item) => item.id === user.id ? { ...item, status: item.status === "active" ? "blocked" : "active" } : item));
    setPendingAction(null);
  };
  const columns = [
    { key: "user", label: "User", render: (user) => <UserCell user={user} /> },
    { key: "role", label: "Role", render: (user) => <RoleBadge role={user.role} /> },
    { key: "status", label: "Status", render: (user) => <UserStatusBadge status={user.status} /> },
    { key: "storage", label: "Storage", render: (user) => <div className="w-36"><StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /><p className="mt-1 text-[10px] text-gray-400">of {formatBytes(user.storageLimit)}</p></div> },
    { key: "files", label: "Files / folders", render: (user) => <span>{user.files} / {user.folders}</span> },
    { key: "createdAt", label: "Joined" }, { key: "lastActive", label: "Last active" },
    { key: "actions", label: "Actions", render: (user) => <div className="flex items-center gap-2 whitespace-nowrap"><Link href={`/admin/users/${user.id}`} className="font-semibold text-blue-600">View</Link><button type="button" onClick={() => setPendingAction({ user, type: "status" })} className="font-medium text-gray-600">{user.status === "active" ? "Block" : "Unblock"}</button><button type="button" onClick={() => setPendingAction({ user, type: "delete" })} className="font-medium text-red-600">Delete</button></div> },
  ];
  return <><PageHeader eyebrow="User management" title="Users" description="Manage access, account roles, storage allocation, and account status." actions={<button type="button" className="h-9 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white">Export users</button>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">All users</p><p className="mt-1 text-xl font-semibold">{users.length}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Active</p><p className="mt-1 text-xl font-semibold text-emerald-600">{users.filter((user) => user.status === "active").length}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Blocked</p><p className="mt-1 text-xl font-semibold text-red-600">{users.filter((user) => user.status === "blocked").length}</p></div><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">Admins</p><p className="mt-1 text-xl font-semibold text-violet-600">{users.filter((user) => user.role === "admin").length}</p></div></div>
    <Section title="All accounts" description={`${filteredUsers.length} matching users`}><div className="mb-4 flex flex-col gap-2 lg:flex-row"><SearchInput value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search name or email" /><FilterDropdown label="Status" value={status} onChange={setStatus} options={[{value:"all",label:"All statuses"},{value:"active",label:"Active"},{value:"blocked",label:"Blocked"}]} /><FilterDropdown label="Role" value={role} onChange={setRole} options={[{value:"all",label:"All roles"},{value:"user",label:"User"},{value:"admin",label:"Admin"}]} /><FilterDropdown label="Sort" value={sort} onChange={setSort} options={[{value:"storage",label:"Storage used"},{value:"created",label:"Created date"},{value:"active",label:"Last active"}]} /></div><DataTable columns={columns} rows={filteredUsers} emptyMessage="No users match these filters." /><Pagination page={page} pages={1} onChange={setPage} /></Section>
    <ConfirmModal open={Boolean(pendingAction)} title={pendingAction?.type === "delete" ? "Delete this user?" : `${pendingAction?.user?.status === "active" ? "Block" : "Unblock"} this user?`} description={pendingAction?.type === "delete" ? `${pendingAction.user.name}'s account and access will be permanently removed. Their stored files require backend cleanup before this action is enabled.` : `${pendingAction?.user?.name} will ${pendingAction?.user?.status === "active" ? "lose access to Storix" : "regain access to Storix"}.`} confirmLabel={pendingAction?.type === "delete" ? "Delete user" : pendingAction?.user?.status === "active" ? "Block user" : "Unblock user"} tone={pendingAction?.type === "delete" ? "danger" : "warning"} onClose={() => setPendingAction(null)} onConfirm={() => update(pendingAction.user, pendingAction.type)} />
  </>;
}
