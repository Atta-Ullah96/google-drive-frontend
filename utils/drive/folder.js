export const getCreatedFolder = (payload) => {
  return payload?.folder || payload?.data?.folder || payload?.data || payload || {};
};

export const getFoldersFromResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.folders)) return payload.folders;
  if (Array.isArray(payload?.data?.folders)) return payload.data.folders;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

export const normalizeFolder = (folder) => {
  const folderCount =
    folder.folderCount ??
    folder.childrenCount ??
    folder.childFolderCount ??
    folder.foldersCount ??
    folder.subFolderCount ??
    0;

  const fileCount = folder.fileCount ?? folder.filesCount ?? 0;

  const itemCount =
    folder.items ??
    folder.itemCount ??
    folder.itemsCount ??
    folder.totalItems ??
    folder.totalCount ??
    folderCount + fileCount;

  return {
    id: folder._id || folder.id,
    name: folder.name || folder.folderName || folder.title || "Untitled folder",
    color: folder.color || "#1a73e8",
    items: itemCount,
    modified: folder.modified || folder.updatedAt || folder.createdAt || "Just now",
    parentId: folder.parentId || folder.parentFolder || folder.parent || null,
  };
};

export const hasExplicitItemCount = (folder) => {
  return [
    folder.items,
    folder.itemCount,
    folder.itemsCount,
    folder.totalItems,
    folder.totalCount,
    folder.folderCount,
    folder.childrenCount,
    folder.childFolderCount,
    folder.foldersCount,
    folder.subFolderCount,
    folder.fileCount,
    folder.filesCount,
  ].some((value) => value !== undefined && value !== null);
};