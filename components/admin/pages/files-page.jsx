"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { deleteAdminFile, getAdminFiles, getAdminUsers } from "@/lib/api/admin";
import { getAdminData, normalizeAdminFile, normalizeAdminUser, normalizePagination } from "@/lib/admin/adminData";
import { Badge, ConfirmModal, DataTable, ErrorState, FilterDropdown, formatBytes, LoadingState, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [owner, setOwner] = useState("all");
  const [sort, setSort] = useState("size");
  const [pagination, setPagination] = useState(normalizePagination());
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminFiles({ page: pagination.page, limit: 20, search: query.trim() || undefined, type: type === "all" ? undefined : type, user: owner === "all" ? undefined : owner, sort: sort === "size" ? "size" : "uploadedAt", order: "desc" });
      const data = getAdminData(response);
      setFiles((data.files || []).map(normalizeAdminFile));
      setPagination(normalizePagination(data.pagination));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [owner, pagination.page, query, sort, type]);

  useEffect(() => {
    getAdminUsers({ limit: 100, sort: "createdAt", order: "desc" }).then((response) => setOwners((getAdminData(response).users || []).map(normalizeAdminUser))).catch(() => setOwners([]));
  }, []);

  useEffect(() => { const timer = setTimeout(loadFiles, query ? 300 : 0); return () => clearTimeout(timer); }, [loadFiles, query]);

  const deleteFile = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteAdminFile(selected.id);
      setSelected(null);
      setNotice("File deleted successfully.");
      await loadFiles();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key:"name",label:"File",render:(file)=><div><p className="font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-400">{file.mimeType}</p></div> },
    { key:"type",label:"Type",render:(file)=><Badge tone="blue">{file.type}</Badge> }, { key:"size",label:"Size",render:(file)=>formatBytes(file.size) },
    { key:"owner",label:"Owner",render:(file)=>file.ownerId ? <Link href={`/admin/users/${file.ownerId}`} className="font-medium text-blue-600">{file.owner}</Link> : file.owner },
    { key:"folder",label:"Folder / path" }, { key:"uploadedAt",label:"Uploaded" },
    { key:"status",label:"Status",render:(file)=><Badge tone={file.status === "completed" ? "green" : file.status === "failed" ? "red" : "amber"}>{file.status}</Badge> },
    { key:"actions",label:"Actions",render:(file)=><div className="flex gap-2 whitespace-nowrap"><button type="button" onClick={()=>file.url ? window.open(file.url,"_blank","noopener,noreferrer") : setNotice("No preview URL is available for this file.")} className="font-semibold text-blue-600">Open</button><button type="button" onClick={async()=>{ if (!file.url) return setNotice("No file URL is available to copy."); await navigator.clipboard?.writeText(file.url); setNotice("File URL copied."); }} className="font-medium text-gray-600">Copy URL</button><button type="button" onClick={()=>setSelected(file)} className="font-medium text-red-600">Delete</button></div> },
  ];

  return <><PageHeader eyebrow="File administration" title="Files" description="Inspect content, owners, storage paths, upload status, and large-file usage." actions={<button type="button" onClick={loadFiles} className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700">Refresh</button>} />
    {error && <ErrorState message={error} />}{notice && <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700"><span>{notice}</span><button type="button" onClick={()=>setNotice("")} className="font-semibold">Dismiss</button></div>}
    <Section title="Platform files" description={`${pagination.total} matching files`}><div className="mb-4 flex flex-col gap-2 xl:flex-row"><SearchInput value={query} onChange={(value)=>{setQuery(value);setPagination((item)=>({...item,page:1}));}} placeholder="Search files" /><FilterDropdown label="File type" value={type} onChange={(value)=>{setType(value);setPagination((item)=>({...item,page:1}));}} options={[{value:"all",label:"All file types"},{value:"image/",label:"Images"},{value:"video/",label:"Videos"},{value:"audio/",label:"Audio"},{value:"application/pdf",label:"PDF"},{value:"text/",label:"Text"}]} /><FilterDropdown label="Owner" value={owner} onChange={(value)=>{setOwner(value);setPagination((item)=>({...item,page:1}));}} options={[{value:"all",label:"All users"},...owners.map((user)=>({value:user.id,label:user.name}))]} /><FilterDropdown label="Sort" value={sort} onChange={setSort} options={[{value:"size",label:"Largest first"},{value:"date",label:"Newest first"}]} /></div>{loading ? <LoadingState /> : <DataTable columns={columns} rows={files} emptyMessage="No files match these filters." />}<Pagination page={pagination.page} pages={pagination.totalPages} onChange={(page)=>setPagination((item)=>({...item,page}))} /></Section>
    <ConfirmModal open={Boolean(selected)} title="Delete this file?" description={`Delete ${selected?.name || "this file"} from Storix and its configured storage provider? This cannot be undone.`} confirmLabel={deleting ? "Deleting..." : "Delete file"} onClose={()=>!deleting&&setSelected(null)} onConfirm={deleteFile} />
  </>;
}
