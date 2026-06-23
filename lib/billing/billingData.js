export const BILLING_PLANS = {
  free: {
    planKey: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0/month",
    storage: "8 GB",
    storageBytes: 8 * 1024 ** 3,
  },
  pro: {
    planKey: "pro",
    name: "Pro",
    price: 9,
    priceLabel: "$9/month",
    storage: "100 GB",
    storageBytes: 100 * 1024 ** 3,
  },
  business: {
    planKey: "business",
    name: "Business",
    price: 29,
    priceLabel: "$29/month",
    storage: "1 TB",
    storageBytes: 1024 ** 4,
  },
};

export const getResponseData = (response) => response?.data || {};

export const getPlan = (planKey = "free") =>
  BILLING_PLANS[String(planKey).toLowerCase()] || BILLING_PLANS.free;

export const formatDate = (value, includeTime = false) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

export const formatBytes = (bytes = 0) => {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index > 2 ? 1 : 0)} ${units[index]}`;
};

export const formatMoney = (amount = 0, currency = "usd") => {
  const numeric = Number(amount || 0);
  const dollars = numeric > 0 && Number.isInteger(numeric) && numeric >= 100 ? numeric / 100 : numeric;
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: String(currency || "usd").toUpperCase(),
  }).format(dollars);
};

const getPlanKey = (item = {}) =>
  String(item.planKey || item.plan || item.planName || item.subscriptionPlan || "free").toLowerCase();

const getUser = (item = {}) => item.user || item.owner || item.customer || {};

export const normalizeSubscription = (subscription = {}) => {
  const plan = getPlan(getPlanKey(subscription));
  const user = getUser(subscription);
  const amount = subscription.amount ?? subscription.price ?? subscription.unitAmount ?? plan.price * 100;

  return {
    ...subscription,
    id: subscription._id || subscription.id,
    userId: user._id || user.id || subscription.userId || subscription.user,
    userName: user.name || subscription.userName || "Unknown user",
    userEmail: user.email || subscription.userEmail || "",
    planKey: plan.planKey,
    planName: plan.name,
    storageLabel: plan.storage,
    status: subscription.status || "active",
    amount,
    amountLabel: formatMoney(amount, subscription.currency),
    currency: String(subscription.currency || "usd").toUpperCase(),
    currentPeriodStart: formatDate(subscription.currentPeriodStart),
    currentPeriodEnd: formatDate(subscription.currentPeriodEnd),
    createdAt: formatDate(subscription.createdAt),
    cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
    stripeCustomerId: subscription.stripeCustomerId || subscription.customerId || "Not available",
    stripeSubscriptionId: subscription.stripeSubscriptionId || subscription.subscriptionId || "Not available",
  };
};

export const normalizePayment = (payment = {}) => {
  const user = getUser(payment);
  const plan = getPlan(getPlanKey(payment));
  return {
    ...payment,
    id: payment._id || payment.id || payment.stripeInvoiceId,
    userId: user._id || user.id || payment.userId || payment.user,
    userName: user.name || payment.userName || "Unknown user",
    userEmail: user.email || payment.userEmail || "",
    planKey: plan.planKey,
    planName: plan.name,
    amountPaidLabel: formatMoney(payment.amountPaid ?? payment.amount ?? 0, payment.currency),
    amountDueLabel: formatMoney(payment.amountDue ?? 0, payment.currency),
    currency: String(payment.currency || "usd").toUpperCase(),
    status: payment.status || "unknown",
    invoiceUrl: payment.hostedInvoiceUrl || payment.invoiceUrl || payment.url || "",
    invoicePdf: payment.invoicePdf || payment.invoicePdfUrl || "",
    paidAt: formatDate(payment.paidAt || payment.statusTransitions?.paidAt, true),
    createdAt: formatDate(payment.createdAt, true),
  };
};

export const normalizeSubscriptionStats = (stats = {}) => ({
  totalSubscribers: Number(stats.totalSubscribers || stats.total || 0),
  freeUsers: Number(stats.freeUsers || stats.free || 0),
  proSubscribers: Number(stats.proSubscribers || stats.pro || 0),
  businessSubscribers: Number(stats.businessSubscribers || stats.business || 0),
  activeSubscriptions: Number(stats.activeSubscriptions || stats.active || 0),
  canceledSubscriptions: Number(stats.canceledSubscriptions || stats.canceled || 0),
  pastDueSubscriptions: Number(stats.pastDueSubscriptions || stats.pastDue || 0),
  monthlyRecurringRevenue: Number(stats.monthlyRecurringRevenue || stats.mrr || 0),
  totalRevenue: Number(stats.totalRevenue || stats.revenue || 0),
  failedPayments: Number(stats.failedPayments || stats.failed || 0),
  recentPayments: (stats.recentPayments || []).map(normalizePayment),
});

export const normalizePagination = (pagination = {}) => ({
  page: Number(pagination.page || 1),
  limit: Number(pagination.limit || 20),
  total: Number(pagination.total || 0),
  totalPages: Math.max(Number(pagination.totalPages || pagination.pages || 1), 1),
});

export const normalizeMySubscription = (payload = {}) => {
  const subscription = payload.subscription || payload;
  const plan = getPlan(getPlanKey(subscription));
  const storageUsed = Number(payload.storageUsed ?? subscription.storageUsed ?? 0);
  const storageLimit = Number(payload.storageLimit ?? subscription.storageLimit ?? plan.storageBytes);

  return {
    ...subscription,
    plan,
    planKey: plan.planKey,
    planName: plan.name,
    status: subscription.status || (plan.planKey === "free" ? "free" : "active"),
    storageUsed,
    storageLimit,
    usagePercent: storageLimit ? Math.min(Math.round((storageUsed / storageLimit) * 100), 100) : 0,
    currentPeriodEnd: subscription.currentPeriodEnd,
    currentPeriodEndLabel: formatDate(subscription.currentPeriodEnd),
    cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
    invoices: payload.invoices || payload.payments || subscription.invoices || [],
  };
};
