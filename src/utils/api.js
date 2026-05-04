import { apiUrl } from "../config/api";
import { clearStoredAuthSession } from "./authSession";

export const AUTH_SESSION_INVALID_EVENT = "storybook:auth-session-invalid";

const INVALID_AUTH_MESSAGES = new Set([
  "not authorized. token is invalid.",
  "not authorized. token is missing.",
  "not authorized. user not found.",
]);

function notifyInvalidAuthSession() {
  clearStoredAuthSession();
  window.dispatchEvent(new Event(AUTH_SESSION_INVALID_EVENT));
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest(
  path,
  { method = "GET", body, token, headers = {} } = {},
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const message = `${data?.message || data?.error || ""}`.trim();
    const isAuthSessionInvalid =
      response.status === 401 && INVALID_AUTH_MESSAGES.has(message.toLowerCase());

    if (isAuthSessionInvalid) {
      notifyInvalidAuthSession();
    }

    const error = new Error(
      message || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    error.payload = data;
    error.isAuthSessionInvalid = isAuthSessionInvalid;
    throw error;
  }

  return data;
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
