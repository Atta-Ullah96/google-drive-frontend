"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminFiles, adminUsers } from "@/lib/admin/adminMockData";
import { Badge, ConfirmModal, DataTable, FilterDropdown, formatBytes, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

export default function FilesPage() {
  const [files, setFiles] = useState(adminFiles);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [owner, setOwner] = useState("all");
  const [sort, setSort] = useState("size");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const results = useMemo(() => files.filter((file) => (!query || file.name.toLowerCase().includes(query.toLowerCase())) && (type === "all" || file.type === type) && (owner === "all" || file.ownerId === owner)).sort((a,b) => sort === "size" ? b.size-a.size : b.uploadedAt.localeCompare(a.uploadedAt)), [files, query, type, owner, sort]);
  const columns = [
    { key:"name",label:"File",render:(file)=><div><p className="font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-400">{file.mimeType}</p></div> },
    { key:"type",label:"Type",render:(file)=><Badge tone="blue">{file.type}</Badge> }, { key:"size",label:"Size",render:(file)=>formatBytes(file.size) },
    { key:"owner",label:"Owner",render:(file)=><Link href={`/admin/users/${file.ownerId}`} className="font-medium text-blue-600">{file.owner}</Link> },
    { key:"folder",label:"Folder / path" }, { key:"uploadedAt",label:"Uploaded" },
    { key:"status",label:"Status",render:(file)=><Badge tone={file.status === "ready" ? "green" : file.status === "failed" ? "red" : "amber"}>{file.status}</Badge> },
    { key:"actions",label:"Actions",render:(file)=><div className="flex gap-2 whitespace-nowrap"><button type="button" onClick={()=>setNotice(`Preview UI opened for ${file.name}. Connect the existing preview URL when the admin API is available.`)} className="font-semibold text-blue-600">Preview</button><button type="button" onClick={()=>navigator.clipboard?.writeText(file.name).then(()=>setNotice("File reference copied."))} className="font-medium text-gray-600">Copy URL</button><button type="button" onClick={()=>setSelected(file)} className="font-medium text-red-600">Delete</button></div> },
  ];
  return <><PageHeader eyebrow="File administration" title="Files" description="Inspect content, owners, storage paths, upload status, and large-file usage." actions={<button type="button" className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700">Export report</button>} />
    {notice && <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700"><span>{notice}</span><button type="button" onClick={()=>setNotice("")} className="font-semibold">Dismiss</button></div>}
    <Section title="Platform files" description={`${results.length} files in this view`}><div className="mb-4 flex flex-col gap-2 xl:flex-row"><SearchInput value={query} onChange={setQuery} placeholder="Search files" /><FilterDropdown label="File type" value={type} onChange={setType} options={[{value:"all",label:"All file types"},...[...new Set(files.map((file)=>file.type))].map((value)=>({value,label:value}))]} /><FilterDropdown label="Owner" value={owner} onChange={setOwner} options={[{value:"all",label:"All users"},...adminUsers.map((user)=>({value:user.id,label:user.name}))]} /><FilterDropdown label="Upload date" value="all" onChange={()=>{}} options={[{value:"all",label:"Any upload date"},{value:"today",label:"Today"},{value:"week",label:"This week"}]} /><FilterDropdown label="Sort" value={sort} onChange={setSort} options={[{value:"size",label:"Largest first"},{value:"date",label:"Newest first"}]} /></div><DataTable columns={columns} rows={results} emptyMessage="No files match these filters." /><Pagination /></Section>
    <ConfirmModal open={Boolean(selected)} title="Delete this file?" description={`Delete ${selected?.name || "this file"} from Storix? This UI action remains local until the admin file endpoint is connected.`} confirmLabel="Delete file" onClose={()=>setSelected(null)} onConfirm={()=>{setFiles((items)=>items.filter((item)=>item.id!==selected.id));setSelected(null);}} />
  </>;
}
