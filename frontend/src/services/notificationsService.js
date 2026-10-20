import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listNotifications() {
  if (isDemoMode()) return getDemoState().notifications;
  return apiRequest(endpoints.notifications);
}

export async function markNotificationReadApi(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.notificationRead(id), { method: "PATCH" });
}

export async function markAllNotificationsReadApi() {
  if (isDemoMode()) return { demo: true };
  return apiRequest(endpoints.notificationsReadAll, { method: "POST" });
}

export async function dismissNotificationApi(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.notification(id), { method: "DELETE" });
}
