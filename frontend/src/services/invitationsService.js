import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";

export async function listInvitations() {
  if (isDemoMode()) return [];
  return apiRequest(endpoints.invitations);
}

export async function listProjectInvitations(projectId) {
  if (isDemoMode()) return [];
  return apiRequest(endpoints.projectInvitations(projectId));
}

export async function sendProjectInvitation(projectId, inviteeId) {
  if (isDemoMode()) throw new Error("Project invitations require a connected account.");
  return apiRequest(endpoints.projectInvitations(projectId), {
    method: "POST",
    body: { inviteeId },
  });
}

export async function acceptProjectInvitation(invitationId) {
  if (isDemoMode()) throw new Error("Project invitations require a connected account.");
  return apiRequest(endpoints.invitationAccept(invitationId), { method: "POST" });
}

export async function declineProjectInvitation(invitationId) {
  if (isDemoMode()) throw new Error("Project invitations require a connected account.");
  return apiRequest(endpoints.invitationDecline(invitationId), { method: "POST" });
}

export async function cancelProjectInvitation(projectId, invitationId) {
  if (isDemoMode()) throw new Error("Project invitations require a connected account.");
  return apiRequest(endpoints.invitationCancel(projectId, invitationId), { method: "POST" });
}
