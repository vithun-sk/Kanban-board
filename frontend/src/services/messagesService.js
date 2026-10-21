import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listConversations() {
  if (isDemoMode()) return getDemoState().conversations;
  return apiRequest(endpoints.conversations);
}

export async function createConversationApi(participantIds, title) {
  if (isDemoMode()) return { demo: true, participantIds, title };
  return apiRequest(endpoints.conversations, {
    method: "POST",
    body: { participantIds, title },
  });
}

export async function listMessages(conversationId) {
  if (isDemoMode()) {
    return getDemoState().messages.filter((message) => message.conversationId === conversationId);
  }
  return apiRequest(endpoints.messages(conversationId));
}

/**
 * Paginated history. Page 0 holds the newest messages, older pages step backwards.
 * The backend returns the items already in chronological order.
 */
export async function listMessagePage(conversationId, page = 0, size = 50) {
  if (isDemoMode()) {
    const all = getDemoState().messages.filter((message) => message.conversationId === conversationId);
    const start = Math.max(all.length - (page + 1) * size, 0);
    return {
      items: all.slice(start, start + size),
      page,
      size,
      totalElements: all.length,
      totalPages: Math.ceil(all.length / size),
      hasNewer: page > 0,
      hasOlder: start > 0,
    };
  }
  return apiRequest(endpoints.messagePage(conversationId, page, size));
}

export async function postMessage(conversationId, body) {
  if (isDemoMode()) return { demo: true, conversationId, body };
  return apiRequest(endpoints.messages(conversationId), {
    method: "POST",
    body: { body },
  });
}
