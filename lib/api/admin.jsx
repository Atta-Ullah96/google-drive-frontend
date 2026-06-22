import api from "./api";
import { activityLogs, adminFiles, adminSettings, adminUsers, overviewStats, systemServices } from "@/lib/admin/adminMockData";

export const ADMIN_USES_MOCK_DATA = true;
const mock = (data) => Promise.resolve({ data });

export const getAdminOverview = () => ADMIN_USES_MOCK_DATA ? mock(overviewStats) : api.get("admin/overview");
export const getAdminUsers = (params = {}) => ADMIN_USES_MOCK_DATA ? mock(adminUsers) : api.get("admin/users", { params });
export const getAdminUserById = (userId) => ADMIN_USES_MOCK_DATA ? mock(adminUsers.find((user) => user.id === userId)) : api.get(`admin/users/${userId}`);
export const updateUserStatus = (userId, status) => ADMIN_USES_MOCK_DATA ? mock({ userId, status }) : api.patch(`admin/users/${userId}/status`, { status });
export const updateUserRole = (userId, role) => ADMIN_USES_MOCK_DATA ? mock({ userId, role }) : api.patch(`admin/users/${userId}/role`, { role });
export const updateUserStorageLimit = (userId, storageLimit) => ADMIN_USES_MOCK_DATA ? mock({ userId, storageLimit }) : api.patch(`admin/users/${userId}/storage-limit`, { storageLimit });
export const deleteUser = (userId) => ADMIN_USES_MOCK_DATA ? mock({ userId }) : api.delete(`admin/users/${userId}`);
export const getStorageAnalytics = () => ADMIN_USES_MOCK_DATA ? mock({ users: adminUsers, files: adminFiles }) : api.get("admin/storage");
export const getAdminFiles = (params = {}) => ADMIN_USES_MOCK_DATA ? mock(adminFiles) : api.get("admin/files", { params });
export const deleteAdminFile = (fileId) => ADMIN_USES_MOCK_DATA ? mock({ fileId }) : api.delete(`admin/files/${fileId}`);
export const getActivityLogs = (params = {}) => ADMIN_USES_MOCK_DATA ? mock(activityLogs) : api.get("admin/activity", { params });
export const getSystemHealth = () => ADMIN_USES_MOCK_DATA ? mock(systemServices) : api.get("admin/health");
export const getAdminSettings = () => ADMIN_USES_MOCK_DATA ? mock(adminSettings) : api.get("admin/settings");
export const updateAdminSettings = (payload) => ADMIN_USES_MOCK_DATA ? mock(payload) : api.patch("admin/settings", payload);
