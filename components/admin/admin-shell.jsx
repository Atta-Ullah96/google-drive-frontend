"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminIcon from "./admin-icons";

const links = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/storage", label: "Storage", icon: "storage" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "storage" },
  { href: "/admin/payments", label: "Payments", icon: "files" },
  { href: "/admin/files", label: "Files", icon: "files" },
  { href: "/admin/activity", label: "Activity Logs", icon: "activity" },
  { href: "/admin/health", label: "System Health", icon: "health" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = links.findLast((link) => pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`))) || links[0];
  return <div className="min-h-screen bg-[#f6f8fb] text-gray-900"><aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-[#161b22] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="flex h-16 items-center justify-between border-b border-white/10 px-5"><Link href="/admin" className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold">S</span><span><strong className="block text-sm">Storix</strong><small className="block text-[10px] uppercase text-gray-400">Admin console</small></span></Link><button type="button" onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close navigation"><AdminIcon name="close" /></button></div><nav className="flex-1 space-y-1 px-3 py-5">{links.map((link) => { const selected = link.href === active.href; return <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${selected ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-white/8 hover:text-white"}`}><AdminIcon name={link.icon} className="h-4 w-4" />{link.label}</Link>; })}</nav><div className="border-t border-white/10 p-4"><Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white"><AdminIcon name="arrow" className="h-4 w-4 rotate-180" />Back to My Drive</Link></div></aside>{open && <button type="button" aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden" onClick={() => setOpen(false)} />}<div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 lg:hidden" aria-label="Open navigation"><AdminIcon name="menu" /></button><div><p className="text-sm font-semibold text-gray-900">{active.label}</p><p className="hidden text-[11px] text-gray-400 sm:block">Platform administration and operations</p></div></div><div className="flex items-center gap-2"><span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:inline-flex">Live API</span><button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Notifications"><AdminIcon name="bell" className="h-4 w-4" /></button><div className="flex items-center gap-2 border-l border-gray-200 pl-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">AD</span><span className="hidden text-xs font-medium text-gray-700 sm:block">Administrator</span></div></div></header><main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
