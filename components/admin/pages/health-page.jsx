"use client";

import { useCallback, useEffect, useState } from "react";
import { getSystemHealth } from "@/lib/api/admin";
import { getAdminData, formatAdminDate } from "@/lib/admin/adminData";
import { Badge, ErrorState, formatBytes, LoadingState, PageHeader, Section, StatCard } from "@/components/admin/admin-ui";
import AdminIcon from "@/components/admin/admin-icons";

const healthyStatuses = ["operational", "connected", "configured"];
const formatUptime = (seconds = 0) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
};

export default function HealthPage() {
  const [health,setHealth]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const loadHealth=useCallback(async()=>{setLoading(true);setError("");try{const response=await getSystemHealth();setHealth(getAdminData(response));}catch(requestError){setError(requestError.message);}finally{setLoading(false);}},[]);
  useEffect(()=>{const timer=setTimeout(loadHealth,0);return()=>clearTimeout(timer);},[loadHealth]);

  if(loading&&!health)return <><PageHeader eyebrow="Infrastructure" title="System health" description="Checking backend services and process health." /><LoadingState /></>;
  if(!health)return <><PageHeader eyebrow="Infrastructure" title="System health" description="Backend health information is unavailable." /><ErrorState message={error} /></>;

  const services=Object.entries(health.services||{}); const online=services.filter(([,status])=>healthyStatuses.includes(status)).length; const memory=health.memory||{};
  return <><PageHeader eyebrow="Infrastructure" title="System health" description={`Live service and process status. Last checked ${formatAdminDate(health.timestamp,true)}.`} actions={<button type="button" onClick={loadHealth} className="flex h-9 items-center gap-2 rounded-md bg-gray-900 px-4 text-xs font-semibold text-white"><AdminIcon name="refresh" className="h-3.5 w-3.5" />Run checks</button>} />
    {error&&<ErrorState message={error} />}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Overall status" value={health.status||"unknown"} detail={`${online} of ${services.length} services ready`} tone={health.status==="operational"?"green":"red"} icon="health" /><StatCard label="API uptime" value={formatUptime(health.uptime)} detail={`${Math.round(health.uptime||0).toLocaleString()} seconds`} icon="activity" /><StatCard label="Heap used" value={formatBytes(memory.heapUsed)} detail={`of ${formatBytes(memory.heapTotal)}`} tone="amber" icon="storage" /><StatCard label="Process memory" value={formatBytes(memory.rss)} detail={`${formatBytes(memory.external)} external`} tone="violet" icon="storage" /></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{services.map(([name,status])=>{const healthy=healthyStatuses.includes(status);return <article key={name} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${healthy?"bg-emerald-50 text-emerald-600":"bg-red-50 text-red-600"}`}><AdminIcon name="health" className="h-4 w-4" /></div><Badge tone={healthy?"green":"red"}>{status}</Badge></div><h2 className="mt-4 text-sm font-semibold capitalize text-gray-900">{name}</h2><p className="mt-2 text-xs text-gray-500">Reported directly by the Storix backend health endpoint.</p></article>;})}</div>
    <Section title="Node process memory" description="Current memory allocation reported by the backend"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{label:"Resident set",value:memory.rss},{label:"Heap total",value:memory.heapTotal},{label:"Heap used",value:memory.heapUsed},{label:"External",value:memory.external}].map((item)=><div key={item.label} className="rounded-md bg-gray-50 p-4"><p className="text-xs text-gray-500">{item.label}</p><p className="mt-1 text-lg font-semibold text-gray-900">{formatBytes(item.value)}</p></div>)}</div></Section>
  </>;
}
