import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listNotifications() {
  if (isDemoMode()) return getDemoState().notifications;
  return apiRequest(endpoints.notifications);
}

export async function updateNotification(id, payload) {
  if (isDemoMode()) return { demo: true, id, payload };
  return apiRequest(endpoints.notification(id), { method: "PATCH", body: payload });
}
