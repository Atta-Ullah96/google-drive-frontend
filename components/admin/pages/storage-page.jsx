import Link from "next/link";
import { adminFiles, adminUsers, fileTypeUsage, storageData } from "@/lib/admin/adminMockData";
import { Badge, DataTable, formatBytes, MiniBarChart, PageHeader, Section, StatCard, StorageProgressBar, UserCell } from "@/components/admin/admin-ui";

export default function StoragePage() {
  const totalUsed = adminUsers.reduce((sum, user) => sum + user.storageUsed, 0);
  const totalLimit = adminUsers.reduce((sum, user) => sum + user.storageLimit, 0);
  const closeToQuota = adminUsers.filter((user) => user.storageUsed / user.storageLimit >= .8);
  const userColumns = [
    { key: "user", label: "User", render: (user) => <UserCell user={user} /> },
    { key: "used", label: "Storage used", render: (user) => formatBytes(user.storageUsed) },
    { key: "limit", label: "Limit", render: (user) => formatBytes(user.storageLimit) },
    { key: "usage", label: "Usage", render: (user) => <StorageProgressBar used={user.storageUsed} limit={user.storageLimit} /> },
    { key: "files", label: "Files" },
    { key: "actions", label: "", render: (user) => <Link href={`/admin/users/${user.id}`} className="font-semibold text-blue-600">View</Link> },
  ];
  const fileColumns = [
    { key: "name", label: "File", render: (file) => <div><p className="font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-400">{file.type}</p></div> },
    { key: "owner", label: "Owner" }, { key: "size", label: "Size", render: (file) => formatBytes(file.size) },
    { key: "folder", label: "Path" }, { key: "uploadedAt", label: "Uploaded" },
  ];
  return <><PageHeader eyebrow="Storage analytics" title="Capacity and utilization" description="Understand how assigned quota is consumed across users and file types." />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"><StatCard label="Used storage" value={formatBytes(totalUsed)} icon="storage" /><StatCard label="Remaining" value={formatBytes(totalLimit-totalUsed)} tone="green" icon="storage" /><StatCard label="Total files" value="48.2K" tone="violet" icon="files" /><StatCard label="Large files" value="186" tone="amber" icon="files" /><StatCard label="Top file type" value="Video" detail="38% of storage" icon="files" /><StatCard label="Near quota" value={closeToQuota.length} detail="Above 80%" tone="red" icon="alert" /></div>
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><Section title="Storage usage trend" description="Utilization during the last 12 months"><MiniBarChart values={storageData} color="bg-blue-600" labels={["Jul","","","Oct","","","Jan","","","Apr","","Jun"]} /></Section><Section title="Usage by file type"><div className="flex h-4 overflow-hidden rounded-full">{fileTypeUsage.map((type) => <div key={type.label} className={type.color} style={{ width: `${type.value}%` }} title={`${type.label}: ${type.value}%`} />)}</div><div className="mt-5 grid grid-cols-2 gap-3">{fileTypeUsage.map((type) => <div key={type.label} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-gray-600"><span className={`h-2 w-2 rounded-full ${type.color}`} />{type.label}</span><strong>{type.value}%</strong></div>)}</div><div className="mt-5 border-t border-gray-100 pt-4"><p className="text-xs font-semibold text-gray-700">Unused quota</p><p className="mt-1 text-2xl font-semibold text-gray-950">{formatBytes(totalLimit-totalUsed)}</p></div></Section></div>
    <Section title="Top storage users" description="Sorted by storage currently consumed"><DataTable columns={userColumns} rows={[...adminUsers].sort((a,b) => b.storageUsed-a.storageUsed)} /></Section>
    <Section title="Large files" description="Largest individual objects stored on the platform"><DataTable columns={fileColumns} rows={[...adminFiles].sort((a,b) => b.size-a.size)} /></Section>
  </>;
}
