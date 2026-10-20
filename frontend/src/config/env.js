export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

export function isDemoMode() {
  return DEMO_MODE || !API_BASE_URL;
}
