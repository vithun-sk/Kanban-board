import { API_BASE_URL } from "@/config/env";
import { STORAGE_KEYS } from "@/constants";
import { readJSON } from "@/lib/storage";

export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getStoredToken() {
  const session = readJSON(STORAGE_KEYS.SESSION, null);
  return session?.token || null;
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not configured.", { status: 0 });
  }

  const effectiveToken = token !== undefined ? token : getStoredToken();

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (effectiveToken) {
    headers.Authorization = `Bearer ${effectiveToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the API server. Please check your network connection or server status.", {
      status: 0,
    });
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    let details = null;

    if (payload && typeof payload === "object") {
      message = payload.error || payload.message || message;
      details = payload.details || null;
    } else if (typeof payload === "string" && payload.trim()) {
      message = payload.trim();
    }

    if (response.status === 401) {
      message = message || "Session expired or unauthenticated. Please sign in again.";
    } else if (response.status === 403) {
      message = message || "You do not have permission to perform this action.";
    }

    throw new ApiError(message, { status: response.status, details });
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
}
