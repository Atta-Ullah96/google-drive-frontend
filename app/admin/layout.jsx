import AdminShell from "@/components/admin/admin-shell";
import AdminGuard from "@/components/admin/admin-guard";

export const metadata = { title: "Storix Admin" };

export default function AdminLayout({ children }) {
  return <AdminGuard><AdminShell>{children}</AdminShell></AdminGuard>;
}
