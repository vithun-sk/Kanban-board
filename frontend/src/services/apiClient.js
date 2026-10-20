import { API_BASE_URL } from "@/config/env";

export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not configured.", { status: 0 });
  }

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the API server.", { status: 0 });
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}.`;
    throw new ApiError(message, { status: response.status, details: payload });
  }

  return payload;
}
