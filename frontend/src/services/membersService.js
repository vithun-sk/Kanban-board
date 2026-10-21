import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listMembers() {
  if (isDemoMode()) return getDemoState().members;
  return apiRequest(endpoints.users);
}

/**
 * Looks up a registered FlowSync account by email. The backend answers with 404 when no
 * account exists, so an unregistered email can never be turned into a member.
 */
export async function findUserByEmail(email) {
  if (isDemoMode()) {
    const match = getDemoState().members.find(
      (member) => member.email.toLowerCase() === String(email || "").trim().toLowerCase()
    );
    if (!match) {
      throw new Error("No registered FlowSync account found for that email.");
    }
    return match;
  }
  return apiRequest(endpoints.userByEmail(String(email || "").trim()));
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

/**
 * Removes a member from every project they belong to. The FlowSync account itself is kept.
 */
export async function removeUserMembershipsApi(userId) {
  if (isDemoMode()) return { demo: true, userId };
  return apiRequest(endpoints.userMemberships(userId), { method: "DELETE" });
}

export async function updateUserRoleApi(userId, role) {
  if (isDemoMode()) return { demo: true, userId, role };
  return apiRequest(endpoints.userRole(userId), {
    method: "PATCH",
    body: { role },
  });
}
