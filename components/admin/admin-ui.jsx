import AdminIcon from "./admin-icons";

export const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 2 ? 1 : 0)} ${units[index]}`;
};

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-xs font-semibold uppercase text-blue-600">{eyebrow}</p><h1 className="text-2xl font-semibold text-gray-950 sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p></div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, detail, tone = "blue", icon = "overview" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700", violet: "bg-violet-50 text-violet-700" };
  return <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p></div><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}><AdminIcon name={icon} className="h-4 w-4" /></div></div>{detail && <p className="mt-2 text-xs text-gray-500">{detail}</p>}</div>;
}

export function Section({ title, description, action, children, className = "" }) {
  return <section className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}><div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5"><div><h2 className="text-sm font-semibold text-gray-900">{title}</h2>{description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}</div>{action}</div><div className="p-4">{children}</div></section>;
}

export function StorageProgressBar({ used, limit, showLabel = true }) {
  const percentage = limit ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const color = percentage >= 90 ? "bg-red-500" : percentage >= 80 ? "bg-amber-500" : "bg-blue-600";
  return <div className="min-w-28">{showLabel && <div className="mb-1.5 flex justify-between text-xs text-gray-500"><span>{formatBytes(used)}</span><span>{percentage}%</span></div>}<div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>;
}

export function Badge({ children, tone = "gray" }) {
  const tones = { gray: "bg-gray-100 text-gray-700", green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", red: "bg-red-50 text-red-700 ring-red-600/20", amber: "bg-amber-50 text-amber-700 ring-amber-600/20", blue: "bg-blue-50 text-blue-700 ring-blue-600/20", violet: "bg-violet-50 text-violet-700 ring-violet-600/20" };
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

export const UserStatusBadge = ({ status }) => <Badge tone={status === "active" ? "green" : "red"}>{status}</Badge>;
export const RoleBadge = ({ role }) => <Badge tone={role === "admin" ? "violet" : "gray"}>{role}</Badge>;

export function UserCell({ user, subtitle = true }) {
  return <div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">{user.avatar || user.name?.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900">{user.name}</p>{subtitle && <p className="truncate text-xs text-gray-500">{user.email}</p>}</div></div>;
}

export function SearchInput({ value, onChange, placeholder = "Search" }) {
  return <label className="relative block min-w-0 flex-1 sm:max-w-xs"><span className="sr-only">{placeholder}</span><AdminIcon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>;
}

export function FilterDropdown({ label, value, onChange, options }) {
  return <label className="min-w-32"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function DataTable({ columns, rows, emptyMessage = "No results found." }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-gray-200">{columns.map((column) => <th key={column.key} className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-500 ${column.className || ""}`}>{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-b border-gray-100 transition hover:bg-gray-50/80">{columns.map((column) => <td key={column.key} className={`px-3 py-3 text-sm text-gray-700 ${column.cellClassName || ""}`}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-gray-500">{emptyMessage}</td></tr>}</tbody></table></div>;
}

export function Pagination({ page = 1, pages = 1, onChange = () => {} }) {
  return <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500"><span>Page {page} of {pages}</span><div className="flex gap-1"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-8 rounded-md border border-gray-200 px-3 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="h-8 rounded-md border border-gray-200 px-3 disabled:opacity-40">Next</button></div></div>;
}

export function ConfirmModal({ open, title, description, confirmLabel = "Confirm", tone = "danger", onClose, onConfirm }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${tone === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}><AdminIcon name="alert" /></div><h2 className="text-lg font-semibold text-gray-950">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{description}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-9 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700">Cancel</button><button type="button" onClick={onConfirm} className={`h-9 rounded-md px-4 text-sm font-semibold text-white ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>{confirmLabel}</button></div></div></div>;
}

export function LoadingState() { return <div className="space-y-3" aria-label="Loading"><div className="h-10 animate-pulse rounded bg-gray-100" />{[1,2,3,4].map((item) => <div key={item} className="h-14 animate-pulse rounded bg-gray-50" />)}</div>; }
export function EmptyState({ title = "Nothing here yet", description = "Try adjusting your filters." }) { return <div className="py-14 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"><AdminIcon name="files" /></div><h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3><p className="mt-1 text-xs text-gray-500">{description}</p></div>; }
export function ErrorState({ message = "Something went wrong." }) { return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }

export function MiniBarChart({ values, color = "bg-blue-600", labels = [] }) {
  return <div className="flex h-44 items-end gap-2 pt-3">{values.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2"><div className={`w-full rounded-t-sm ${color}`} style={{ height: `${value}%`, opacity: 0.45 + index * 0.04 }} title={`${value}%`} />{labels[index] && <span className="text-center text-[10px] text-gray-400">{labels[index]}</span>}</div>)}</div>;
}

export function Toggle({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-blue-600" : "bg-gray-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} /></button>;
}
