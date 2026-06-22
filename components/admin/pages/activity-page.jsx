"use client";

import { useMemo, useState } from "react";
import { activityLogs, adminUsers } from "@/lib/admin/adminMockData";
import { Badge, DataTable, FilterDropdown, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

export default function ActivityPage() {
  const [query,setQuery]=useState(""); const [action,setAction]=useState("all"); const [severity,setSeverity]=useState("all"); const [user,setUser]=useState("all");
  const results=useMemo(()=>activityLogs.filter((log)=>(!query||`${log.action} ${log.details} ${log.email}`.toLowerCase().includes(query.toLowerCase()))&&(action==="all"||log.action===action)&&(severity==="all"||log.severity===severity)&&(user==="all"||log.email===user)),[query,action,severity,user]);
  const columns=[{key:"action",label:"Action",render:(log)=><div><p className="font-medium text-gray-900">{log.action}</p><p className="max-w-xs truncate text-xs text-gray-400">{log.details}</p></div>},{key:"user",label:"User",render:(log)=><div><p>{log.user}</p><p className="text-xs text-gray-400">{log.email}</p></div>},{key:"status",label:"Status",render:(log)=><Badge tone={log.status==="success"?"green":log.status==="failed"?"red":"amber"}>{log.status}</Badge>},{key:"ip",label:"IP address"},{key:"device",label:"Device / service"},{key:"date",label:"Date and time"}];
  return <><PageHeader eyebrow="Audit trail" title="Activity logs" description="Review authentication, content operations, quota events, failures, and administrator actions." />
    <Section title="Event stream" description={`${results.length} matching events`}><div className="mb-4 flex flex-col gap-2 xl:flex-row"><SearchInput value={query} onChange={setQuery} placeholder="Search logs or details" /><FilterDropdown label="Action" value={action} onChange={setAction} options={[{value:"all",label:"All actions"},...[...new Set(activityLogs.map((log)=>log.action))].map((value)=>({value,label:value}))]} /><FilterDropdown label="User" value={user} onChange={setUser} options={[{value:"all",label:"All users"},...adminUsers.map((item)=>({value:item.email,label:item.name}))]} /><FilterDropdown label="Date" value="all" onChange={()=>{}} options={[{value:"all",label:"Any date"},{value:"today",label:"Today"},{value:"week",label:"Last 7 days"}]} /><FilterDropdown label="Severity" value={severity} onChange={setSeverity} options={[{value:"all",label:"All severity"},{value:"info",label:"Information"},{value:"warning",label:"Warning"},{value:"error",label:"Error"}]} /></div><DataTable columns={columns} rows={results} emptyMessage="No activity matches these filters." /><Pagination /></Section>
  </>;
}
