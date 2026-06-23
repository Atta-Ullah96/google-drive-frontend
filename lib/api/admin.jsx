import axios from "axios";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

const adminApi = axios.create({
  baseURL: `${apiOrigin}/api/admin`,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const getErrorMessage = (error, fallback) => {
  if (!error.response) {
    return "Cannot connect to the backend. Check NEXT_PUBLIC_API_URL and make sure the API server is running.";
  }

  return error.response.data?.message || error.response.data?.error || fallback;
};

const request = async (operation, fallback) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const getAdminOverview = () =>
  request(() => adminApi.get("/overview"), "Unable to load the admin overview.");

export const getAdminUsers = (params = {}) =>
  request(() => adminApi.get("/users", { params }), "Unable to load users.");

export const getAdminUserById = (userId) =>
  request(() => adminApi.get(`/users/${userId}`), "Unable to load this user.");

export const updateUserStatus = (userId, status) =>
  request(
    () => adminApi.patch(`/users/${userId}/status`, { status }),
    "Unable to update the user status."
  );

export const updateUserRole = (userId, role) =>
  request(
    () => adminApi.patch(`/users/${userId}/role`, { role }),
    "Unable to update the user role."
  );

export const updateUserStorageLimit = (userId, storageLimit) =>
  request(
    () => adminApi.patch(`/users/${userId}/storage-limit`, { storageLimit }),
    "Unable to update the storage limit."
  );

export const deleteUser = (userId) =>
  request(() => adminApi.delete(`/users/${userId}`), "Unable to delete the user.");

export const getStorageAnalytics = () =>
  request(() => adminApi.get("/storage"), "Unable to load storage analytics.");

export const getAdminFiles = (params = {}) =>
  request(() => adminApi.get("/files", { params }), "Unable to load files.");

export const getAdminFileById = (fileId) =>
  request(() => adminApi.get(`/files/${fileId}`), "Unable to load this file.");

export const deleteAdminFile = (fileId) =>
  request(() => adminApi.delete(`/files/${fileId}`), "Unable to delete the file.");

export const getActivityLogs = (params = {}) =>
  request(() => adminApi.get("/activity", { params }), "Unable to load activity logs.");

export const getSystemHealth = () =>
  request(() => adminApi.get("/health"), "Unable to load system health.");

export const getAdminSettings = () =>
  request(() => adminApi.get("/settings"), "Unable to load admin settings.");

export const updateAdminSettings = (payload) =>
  request(() => adminApi.patch("/settings", payload), "Unable to save admin settings.");

export const getAdminSubscriptions = (params = {}) =>
  request(
    () => adminApi.get("/subscriptions", { params }),
    "Unable to load subscriptions."
  );

export const getAdminSubscriptionById = (subscriptionId) =>
  request(
    () => adminApi.get(`/subscriptions/${subscriptionId}`),
    "Unable to load this subscription."
  );

export const getAdminPayments = (params = {}) =>
  request(() => adminApi.get("/payments", { params }), "Unable to load payments.");

export const getAdminSubscriptionStats = () =>
  request(
    () => adminApi.get("/subscription-stats"),
    "Unable to load subscription stats."
  );

export default adminApi;
