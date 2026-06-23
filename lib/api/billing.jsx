import axios from "axios";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

const billingApi = axios.create({
  baseURL: `${apiOrigin}/api/billing`,
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

export const createCheckoutSession = (planKey) =>
  request(
    () => billingApi.post("/create-checkout-session", { planKey }),
    "Unable to create a Stripe checkout session."
  );

export const createPortalSession = () =>
  request(
    () => billingApi.post("/create-portal-session"),
    "Unable to open the Stripe billing portal."
  );

export const getMySubscription = () =>
  request(() => billingApi.get("/my-subscription"), "Unable to load your subscription.");

export const cancelSubscription = () =>
  request(
    () => billingApi.post("/cancel-subscription"),
    "Unable to cancel this subscription."
  );

export const resumeSubscription = () =>
  request(
    () => billingApi.post("/resume-subscription"),
    "Unable to resume this subscription."
  );

export default billingApi;
