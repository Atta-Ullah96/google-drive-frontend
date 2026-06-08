import api from "./api.jsx";

export const requestUpload = async (file, currentFolderId) => {
  const response = await api.post("file/request-upload", {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    folderId: currentFolderId || null,
  });

  return response.data;
};


export const uploadToS3 = async (uploadUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error("Failed to upload file to S3"));
    };

    xhr.onerror = () => reject(new Error("Failed to upload file to S3"));
    xhr.send(file);
  });
};

export const completeUpload = async (fileId) => {
  const response = await api.post("file/complete-upload", {
    fileId,
  });

  return response.data;
};

export const getFiles = async (currentFolderId = null) => {
  try {
    const query = currentFolderId ? `?folderId=${currentFolderId}` : "";

    const response = await api.get(`file/${query}`);

    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Unable to fetch files."
    );
  }
};


export const renameFile = async (fileId, name) => {
  try {
    const response = await api.patch(`file/${fileId}/rename`, {
      name,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Unable to rename file."
    );
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await api.delete(`file/${fileId}`);

    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Unable to delete file."
    );
  }
};

export const downloadFile = async (fileId) => {
  try {
    const response = await api.get(`file/${fileId}/download?redirect=true`, {
      responseType: "blob",
    });

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Unable to download file."
    );
  }
};


export const getPreviewUrl = async (fileId) => {
  const response = await api.get(`file/${fileId}/preview`);
  return response.data.file;
};
