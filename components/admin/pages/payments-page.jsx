"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAdminPayments } from "@/lib/api/admin";
import { getResponseData, normalizePagination, normalizePayment } from "@/lib/billing/billingData";
import { Badge, DataTable, ErrorState, FilterDropdown, LoadingState, PageHeader, Pagination, SearchInput, Section } from "@/components/admin/admin-ui";

const paymentTone = (status) => {
  if (["paid", "succeeded"].includes(status)) return "green";
  if (["open", "pending"].includes(status)) return "amber";
  if (["failed", "void", "uncollectible"].includes(status)) return "red";
  return "gray";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [pagination, setPagination] = useState(normalizePagination());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPayments({
        page: pagination.page,
        limit: 20,
        search: query.trim() || undefined,
        status: status === "all" ? undefined : status,
      });
      const data = getResponseData(response);
      setPayments((data.payments || data.invoices || data.items || []).map(normalizePayment));
      setPagination(normalizePagination(data.pagination));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, query, status]);

  useEffect(() => {
    const timer = setTimeout(loadPayments, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadPayments, query]);

  const columns = [
    { key: "user", label: "User", render: (payment) => <div><p className="font-medium text-gray-900">{payment.userName}</p><p className="text-xs text-gray-500">{payment.userEmail}</p></div> },
    { key: "plan", label: "Plan", render: (payment) => payment.planName },
    { key: "paid", label: "Amount paid", render: (payment) => payment.amountPaidLabel },
    { key: "due", label: "Amount due", render: (payment) => payment.amountDueLabel },
    { key: "currency", label: "Currency" },
    { key: "status", label: "Status", render: (payment) => <Badge tone={paymentTone(payment.status)}>{payment.status}</Badge> },
    { key: "paidAt", label: "Paid" },
    { key: "createdAt", label: "Created" },
    { key: "actions", label: "Actions", render: (payment) => <div className="flex gap-3 whitespace-nowrap">{payment.invoiceUrl && <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Invoice</a>}{payment.invoicePdf && <a href={payment.invoicePdf} target="_blank" rel="noreferrer" className="font-semibold text-gray-600">PDF</a>}{payment.userId && <Link href={`/admin/users/${payment.userId}`} className="font-semibold text-gray-600">User</Link>}</div> },
  ];

  return <><PageHeader eyebrow="Billing admin" title="Payments" description="Review Stripe invoices and payment records for Storix subscriptions." />
    {error && <ErrorState message={error} />}
    <Section title="Payment records" description={`${pagination.total} matching records`}><div className="mb-4 flex flex-col gap-2 sm:flex-row"><SearchInput value={query} onChange={(value) => { setQuery(value); setPagination((item) => ({ ...item, page: 1 })); }} placeholder="Search user or email" /><FilterDropdown label="Status" value={status} onChange={(value) => { setStatus(value); setPagination((item) => ({ ...item, page: 1 })); }} options={[{value:"all",label:"All statuses"},{value:"paid",label:"Paid"},{value:"open",label:"Open"},{value:"failed",label:"Failed"},{value:"void",label:"Void"},{value:"uncollectible",label:"Uncollectible"}]} /></div>{loading ? <LoadingState /> : <DataTable columns={columns} rows={payments} emptyMessage="No payments match these filters." />}<Pagination page={pagination.page} pages={pagination.totalPages} onChange={(page) => setPagination((item) => ({ ...item, page }))} /></Section></>;
}
