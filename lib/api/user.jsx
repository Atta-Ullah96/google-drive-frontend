import api from "./api";

export const getStorageInfo = async () => {
  const response = await api.get("user/storage");
  return response.data;
};