import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listConversations() {
  if (isDemoMode()) return getDemoState().conversations;
  return apiRequest(endpoints.conversations);
}

export async function listMessages(conversationId) {
  if (isDemoMode()) {
    return getDemoState().messages.filter((message) => message.conversationId === conversationId);
  }
  return apiRequest(endpoints.messages(conversationId));
}

export async function postMessage(conversationId, body) {
  if (isDemoMode()) return { demo: true, conversationId, body };
  return apiRequest(endpoints.messages(conversationId), { method: "POST", body: { body } });
}
