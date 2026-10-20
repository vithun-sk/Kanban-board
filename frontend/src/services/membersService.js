import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listMembers() {
  if (isDemoMode()) return getDemoState().members;
  return apiRequest(endpoints.users);
}

export async function updateProfileApi(payload) {
  if (isDemoMode()) return { demo: true, payload };
  return apiRequest(endpoints.profile, {
    method: "PATCH",
    body: payload,
  });
}

export async function changePasswordApi(currentPassword, newPassword) {
  if (isDemoMode()) {
    throw new Error("Password changes require a backend account service and are not available in demo mode.");
  }
  return apiRequest(endpoints.changePassword, {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}
