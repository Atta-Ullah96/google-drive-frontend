import api from "./api.jsx";

const notifyAuthChange = (authenticated) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("auth-change", {
      detail: { authenticated },
    })
  );
};

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

export const register = async (data) => {
  try {
    const response = await api.post("auth/register", data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create your account."));
  }
};

export const login = async (data) => {
  try {
    const response = await api.post("auth/login", data);
    notifyAuthChange(true);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to login."));
  }
};

export const googleAuth = async (data) => {
  try {
    const response = await api.post("auth/google", data);
    notifyAuthChange(true);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to continue with Google."));
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to get current user."));
  }
};

export const logout = async () => {
  try {
    await api.post("auth/logout");
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.error(error);
    }
  } finally {
    notifyAuthChange(false);
  }
};

export const Register = register;
export const Login = login;
export const GoogleAuth = googleAuth;
export const CurrentUser = getCurrentUser;
export const Logout = logout;
