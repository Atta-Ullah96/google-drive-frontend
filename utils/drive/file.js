export const getReadableFileSize = (size) => {
  if (!size || Number.isNaN(Number(size))) return "0 KB";

  return size > 1048576
    ? `${(size / 1048576).toFixed(1)} MB`
    : `${Math.round(size / 1024)} KB`;
};

export const getFilesFromResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.files)) return payload.files;
  if (Array.isArray(payload?.data?.files)) return payload.data.files;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

export const getUploadDetails = (payload) => {
  const data = payload?.data || payload;

  return {
    fileId:
      data?.fileId ||
      data?.file?._id ||
      data?.file?.id ||
      data?._id ||
      data?.id,

    uploadUrl:
      data?.uploadUrl ||
      data?.url ||
      data?.signedUrl ||
      data?.presignedUrl,
  };
};

export const getCompletedFile = (payload) => {
  return payload?.file || payload?.data?.file || payload?.data || payload || {};
};

export const normalizeFile = (file) => {
  const fileName =
    file.name ||
    file.fileName ||
    file.originalName ||
    "Untitled file";

  const fileSize = file.size || file.fileSize || 0;

  return {
    id: file._id || file.id,
    name: fileName,
    ext: file.ext || file.extension || fileName.split(".").pop(),
    size: typeof fileSize === "number" ? getReadableFileSize(fileSize) : fileSize,
    modified: file.modified || file.updatedAt || file.createdAt || "Just now",
    owner: file.owner || "me",
    url: file.url || file.fileUrl || file.publicUrl,
  };
};

export const getPreviewUrlFromResponse = (payload) => {
  return (
    payload?.previewUrl ||
    payload?.url ||
    payload?.data?.previewUrl ||
    payload?.data?.url ||
    payload?.data?.signedUrl ||
    payload?.signedUrl ||
    null
  );
};