import UserDetailPage from "@/components/admin/pages/user-detail-page";
export default async function AdminUserDetail({ params }) { const { id } = await params; return <UserDetailPage userId={id} />; }
