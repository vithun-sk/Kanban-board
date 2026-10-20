import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listMembers() {
  if (isDemoMode()) return getDemoState().members;
  return apiRequest(endpoints.members);
}

export async function saveMember(payload, id) {
  if (isDemoMode()) return { demo: true, payload, id };
  return apiRequest(id ? endpoints.member(id) : endpoints.members, {
    method: id ? "PUT" : "POST",
    body: payload,
  });
}

export async function removeMember(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.member(id), { method: "DELETE" });
}
