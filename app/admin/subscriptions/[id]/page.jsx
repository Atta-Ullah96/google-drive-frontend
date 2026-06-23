import SubscriptionDetailPage from "@/components/admin/pages/subscription-detail-page";

export const metadata = { title: "Subscription Detail | Storix Admin" };

export default async function AdminSubscriptionDetailRoute({ params }) {
  const { id } = await params;
  return <SubscriptionDetailPage subscriptionId={id} />;
}
