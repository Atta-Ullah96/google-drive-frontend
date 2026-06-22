const initials = (name = "User") =>
  name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export const getAdminData = (response) => response?.data || {};

export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

export const normalizeAdminUser = (user = {}, extras = {}) => ({
  ...user,
  ...extras,
  id: user._id || user.id,
  avatar: initials(user.name),
  avatarUrl: user.avatar || null,
  storageUsed: Number(extras.storageUsed ?? user.storageUsed ?? 0),
  storageLimit: Number(extras.storageLimit ?? user.storageLimit ?? 0),
  files: Number(extras.files ?? user.filesCount ?? user.files ?? 0),
  folders: Number(extras.folders ?? user.foldersCount ?? user.folders ?? 0),
  createdAt: formatAdminDate(user.createdAt),
  lastActive: formatAdminDate(user.lastActiveAt, true),
});

export const getFileType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "Archive";
  if (mimeType.startsWith("text/") || mimeType.includes("document")) return "Document";
  return "Other";
};

export const normalizeAdminFile = (file = {}) => ({
  ...file,
  id: file._id || file.id,
  type: getFileType(file.mimeType),
  owner: file.owner?.name || file.ownerName || "Unknown user",
  ownerEmail: file.owner?.email || "",
  ownerId: file.owner?._id || file.owner?.id || file.owner || null,
  folder: file.folder?.name ? `/${file.folder.name}` : "/My Drive",
  uploadedAt: formatAdminDate(file.uploadedAt || file.createdAt),
});

export const normalizeActivity = (activity = {}) => ({
  ...activity,
  id: activity._id || activity.id,
  userName: activity.user?.name || "System",
  email: activity.user?.email || "",
  detailsText:
    activity.message ||
    (activity.details ? JSON.stringify(activity.details) : "No additional details"),
  device: activity.userAgent || "System service",
  date: formatAdminDate(activity.createdAt, true),
});

export const normalizePagination = (pagination = {}) => ({
  page: Number(pagination.page || 1),
  limit: Number(pagination.limit || 20),
  total: Number(pagination.total || 0),
  totalPages: Math.max(Number(pagination.totalPages || 1), 1),
});
