import api from "./api.jsx";

const getApiErrorMessage = (error, fallbackMessage) => {
  if (!error.response) {
    return "Cannot connect to the backend. Please make sure your backend server is running and NEXT_PUBLIC_API_URL is correct.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallbackMessage
  );
};

export const createFolder = async (data) => {
  try {
    const response = await api.post("folder/create", data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create folder."));
  }
};

export const getFolders = async (parentId = null) => {
  try {
    const response = await api.get("folder", {
      params: parentId
        ? {
            parentId,
            parentFolder: parentId,
            parent: parentId,
          }
        : {},
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load folders."));
  }
};

export const renameFolder = async (folderId, data) => {
  try {
    const response = await api.patch(`folder/${folderId}/rename`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to rename folder."));
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const response = await api.delete(`folder/${folderId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete folder."));
  }
};

export const CreateFolder = createFolder;
export const GetFolders = getFolders;
export const RenameFolder = renameFolder;
export const DeleteFolder = deleteFolder;
