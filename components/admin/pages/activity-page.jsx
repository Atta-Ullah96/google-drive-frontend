"use client";

import { useCallback, useEffect, useState } from "react";
import { getActivityLogs, getAdminUsers } from "@/lib/api/admin";
import { getAdminData, normalizeActivity, normalizeAdminUser, normalizePagination } from "@/lib/admin/adminData";
import { Badge, DataTable, ErrorState, FilterDropdown, LoadingState, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

const actions = ["user_status_updated", "user_role_updated", "user_storage_limit_updated", "user_deleted", "file_deleted", "settings_updated", "file_uploaded", "file_downloaded", "user_login", "user_logout"];

const getDateRange = (range) => {
  if (range === "all") return {};
  const from = new Date();
  if (range === "today") from.setHours(0, 0, 0, 0);
  else from.setDate(from.getDate() - 7);
  return { from: from.toISOString(), to: new Date().toISOString() };
};

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [query,setQuery]=useState(""); const [action,setAction]=useState("all"); const [status,setStatus]=useState("all"); const [user,setUser]=useState("all"); const [date,setDate]=useState("all");
  const [pagination,setPagination]=useState(normalizePagination()); const [loading,setLoading]=useState(true); const [error,setError]=useState("");

  const loadActivity = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await getActivityLogs({ page:pagination.page, limit:20, search:query.trim()||undefined, action:action==="all"?undefined:action, user:user==="all"?undefined:user, status:status==="all"?undefined:status, ...getDateRange(date) });
      const data=getAdminData(response); setLogs((data.activity||[]).map(normalizeActivity)); setPagination(normalizePagination(data.pagination));
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  },[action,date,pagination.page,query,status,user]);

  useEffect(()=>{getAdminUsers({limit:100}).then((response)=>setUsers((getAdminData(response).users||[]).map(normalizeAdminUser))).catch(()=>setUsers([]));},[]);
  useEffect(()=>{const timer=setTimeout(loadActivity,query?300:0);return()=>clearTimeout(timer);},[loadActivity,query]);

  const columns=[{key:"action",label:"Action",render:(log)=><div><p className="font-medium capitalize text-gray-900">{log.action.replaceAll("_"," ")}</p><p className="max-w-xs truncate text-xs text-gray-400">{log.detailsText}</p></div>},{key:"user",label:"User",render:(log)=><div><p>{log.userName}</p><p className="text-xs text-gray-400">{log.email}</p></div>},{key:"status",label:"Status",render:(log)=><Badge tone={log.status==="success"?"green":"red"}>{log.status}</Badge>},{key:"ip",label:"IP address",render:(log)=>log.ip||"Unknown"},{key:"device",label:"Device / service"},{key:"date",label:"Date and time"}];
  const resetPage=(setter)=>(value)=>{setter(value);setPagination((item)=>({...item,page:1}));};

  return <><PageHeader eyebrow="Audit trail" title="Activity logs" description="Review authentication, content operations, quota events, failures, and administrator actions." actions={<button type="button" onClick={loadActivity} className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700">Refresh</button>} />
    {error&&<ErrorState message={error} />}
    <Section title="Event stream" description={`${pagination.total} matching events`}><div className="mb-4 flex flex-col gap-2 xl:flex-row"><SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search logs or details" /><FilterDropdown label="Action" value={action} onChange={resetPage(setAction)} options={[{value:"all",label:"All actions"},...actions.map((value)=>({value,label:value.replaceAll("_"," ")}))]} /><FilterDropdown label="User" value={user} onChange={resetPage(setUser)} options={[{value:"all",label:"All users"},...users.map((item)=>({value:item.id,label:item.name}))]} /><FilterDropdown label="Date" value={date} onChange={resetPage(setDate)} options={[{value:"all",label:"Any date"},{value:"today",label:"Today"},{value:"week",label:"Last 7 days"}]} /><FilterDropdown label="Status" value={status} onChange={resetPage(setStatus)} options={[{value:"all",label:"All statuses"},{value:"success",label:"Success"},{value:"failed",label:"Failed"}]} /></div>{loading?<LoadingState />:<DataTable columns={columns} rows={logs} emptyMessage="No activity matches these filters." />}<Pagination page={pagination.page} pages={pagination.totalPages} onChange={(page)=>setPagination((item)=>({...item,page}))} /></Section>
  </>;
}
