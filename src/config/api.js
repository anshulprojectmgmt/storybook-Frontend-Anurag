// const fallbackApiBaseUrl = "https://storybook-backend-payment.onrender.com";
const fallbackApiBaseUrl = "http://localhost:3000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || fallbackApiBaseUrl;

export const apiUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
