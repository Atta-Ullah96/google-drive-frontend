const GB = 1024 ** 3;

export const adminUsers = [
  { id: "usr_01", name: "Maya Chen", email: "maya@northstar.co", role: "admin", status: "active", storageUsed: 12.8 * GB, storageLimit: 20 * GB, files: 482, folders: 38, createdAt: "2025-08-12", lastActive: "2 min ago", avatar: "MC" },
  { id: "usr_02", name: "Ethan Williams", email: "ethan@pixelcraft.dev", role: "user", status: "active", storageUsed: 7.4 * GB, storageLimit: 10 * GB, files: 219, folders: 24, createdAt: "2025-10-03", lastActive: "18 min ago", avatar: "EW" },
  { id: "usr_03", name: "Sofia Patel", email: "sofia@kinetic.io", role: "user", status: "active", storageUsed: 8.9 * GB, storageLimit: 10 * GB, files: 365, folders: 41, createdAt: "2025-11-19", lastActive: "1 hour ago", avatar: "SP" },
  { id: "usr_04", name: "Noah Brooks", email: "noah@atlas.agency", role: "user", status: "blocked", storageUsed: 4.1 * GB, storageLimit: 8 * GB, files: 127, folders: 18, createdAt: "2026-01-08", lastActive: "8 days ago", avatar: "NB" },
  { id: "usr_05", name: "Ava Martinez", email: "ava@studioform.com", role: "user", status: "active", storageUsed: 6.2 * GB, storageLimit: 8 * GB, files: 188, folders: 29, createdAt: "2026-02-14", lastActive: "3 hours ago", avatar: "AM" },
  { id: "usr_06", name: "Liam Okafor", email: "liam@cobalt.ai", role: "admin", status: "active", storageUsed: 5.6 * GB, storageLimit: 15 * GB, files: 156, folders: 17, createdAt: "2026-03-01", lastActive: "Yesterday", avatar: "LO" },
  { id: "usr_07", name: "Isla Jensen", email: "isla@monohaus.dk", role: "user", status: "blocked", storageUsed: 1.8 * GB, storageLimit: 8 * GB, files: 73, folders: 11, createdAt: "2026-03-22", lastActive: "12 days ago", avatar: "IJ" },
  { id: "usr_08", name: "Owen Kim", email: "owen@fieldnote.app", role: "user", status: "active", storageUsed: 7.9 * GB, storageLimit: 8 * GB, files: 301, folders: 35, createdAt: "2026-04-09", lastActive: "5 hours ago", avatar: "OK" },
];

export const adminFiles = [
  { id: "file_01", name: "Q2 product launch.mp4", type: "Video", mimeType: "video/mp4", size: 2.4 * GB, owner: "Maya Chen", ownerId: "usr_01", folder: "/Campaigns/Q2", uploadedAt: "Jun 15, 2026", status: "ready" },
  { id: "file_02", name: "research-archive.zip", type: "Archive", mimeType: "application/zip", size: 1.8 * GB, owner: "Sofia Patel", ownerId: "usr_03", folder: "/Research", uploadedAt: "Jun 15, 2026", status: "ready" },
  { id: "file_03", name: "brand-library.psd", type: "Design", mimeType: "image/vnd.adobe.photoshop", size: 940 * 1024 ** 2, owner: "Ethan Williams", ownerId: "usr_02", folder: "/Design/Brand", uploadedAt: "Jun 14, 2026", status: "ready" },
  { id: "file_04", name: "customer-export.csv", type: "Document", mimeType: "text/csv", size: 318 * 1024 ** 2, owner: "Ava Martinez", ownerId: "usr_05", folder: "/Exports", uploadedAt: "Jun 14, 2026", status: "processing" },
  { id: "file_05", name: "onboarding-v3.pdf", type: "PDF", mimeType: "application/pdf", size: 86 * 1024 ** 2, owner: "Liam Okafor", ownerId: "usr_06", folder: "/Team/Docs", uploadedAt: "Jun 13, 2026", status: "ready" },
  { id: "file_06", name: "interview-audio.wav", type: "Audio", mimeType: "audio/wav", size: 612 * 1024 ** 2, owner: "Owen Kim", ownerId: "usr_08", folder: "/Interviews", uploadedAt: "Jun 12, 2026", status: "failed" },
];

export const activityLogs = [
  { id: 1, action: "File uploaded", user: "Maya Chen", email: "maya@northstar.co", status: "success", severity: "info", ip: "172.16.4.18", device: "Chrome / macOS", date: "Jun 15, 2026 14:32", details: "Q2 product launch.mp4 uploaded to Campaigns/Q2" },
  { id: 2, action: "Failed upload", user: "Owen Kim", email: "owen@fieldnote.app", status: "failed", severity: "error", ip: "10.0.0.42", device: "Safari / macOS", date: "Jun 15, 2026 14:06", details: "Upload interrupted after 78%" },
  { id: 3, action: "User login", user: "Sofia Patel", email: "sofia@kinetic.io", status: "success", severity: "info", ip: "192.168.1.34", device: "Edge / Windows", date: "Jun 15, 2026 13:48", details: "Authenticated with Google" },
  { id: 4, action: "Storage warning", user: "Owen Kim", email: "owen@fieldnote.app", status: "warning", severity: "warning", ip: "System", device: "Quota service", date: "Jun 15, 2026 12:20", details: "Storage usage reached 98.7%" },
  { id: 5, action: "Folder deleted", user: "Noah Brooks", email: "noah@atlas.agency", status: "success", severity: "warning", ip: "10.0.2.91", device: "Firefox / Windows", date: "Jun 15, 2026 11:55", details: "Deleted /Archive/2024" },
  { id: 6, action: "Admin action", user: "Liam Okafor", email: "liam@cobalt.ai", status: "success", severity: "info", ip: "172.16.4.22", device: "Chrome / Linux", date: "Jun 15, 2026 10:31", details: "Updated Ava Martinez storage limit to 8 GB" },
];

export const systemServices = [
  { name: "Backend API", status: "operational", response: "84 ms", uptime: "99.99%", checked: "20 sec ago" },
  { name: "MongoDB", status: "operational", response: "31 ms", uptime: "99.98%", checked: "20 sec ago" },
  { name: "Redis", status: "operational", response: "12 ms", uptime: "100%", checked: "20 sec ago" },
  { name: "AWS S3", status: "operational", response: "118 ms", uptime: "99.99%", checked: "40 sec ago" },
  { name: "CloudFront", status: "degraded", response: "246 ms", uptime: "99.91%", checked: "40 sec ago" },
  { name: "Auth & sessions", status: "operational", response: "56 ms", uptime: "99.97%", checked: "20 sec ago" },
  { name: "Upload service", status: "operational", response: "132 ms", uptime: "99.95%", checked: "40 sec ago" },
];

export const overviewStats = {
  totalUsers: 2484, activeUsers: 2206, blockedUsers: 18, newUsers: 184,
  totalFiles: 48210, totalFolders: 9842, storageUsed: 18.6 * 1024 * GB,
  storageQuota: 32 * 1024 * GB, averageStorage: 7.7 * GB,
  recentUploads: 1248, failedUploads: 14,
};

export const growthData = [42, 48, 46, 57, 61, 68, 64, 75, 82, 88, 94, 100];
export const storageData = [31, 35, 39, 43, 48, 52, 57, 63, 70, 76, 83, 88];
export const fileTypeUsage = [
  { label: "Video", value: 38, color: "bg-blue-500" },
  { label: "Images", value: 24, color: "bg-emerald-500" },
  { label: "Archives", value: 18, color: "bg-amber-500" },
  { label: "Documents", value: 14, color: "bg-violet-500" },
  { label: "Other", value: 6, color: "bg-gray-400" },
];

export const adminSettings = {
  defaultQuota: 8, maxUploadSize: 5,
  allowedTypes: "Images, video, audio, PDF, documents, archives",
  registrationEnabled: true, maintenanceMode: false,
  emailAlerts: true, failedUploadAlerts: true,
  warningThresholds: [80, 90, 100],
};
