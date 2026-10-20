import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listTasks() {
  if (isDemoMode()) return getDemoState().tasks;
  return apiRequest(endpoints.tasks);
}

export async function saveTask(payload, id) {
  if (isDemoMode()) return { demo: true, payload, id };
  return apiRequest(id ? endpoints.task(id) : endpoints.tasks, {
    method: id ? "PUT" : "POST",
    body: payload,
  });
}

export async function changeTaskStatus(id, status) {
  if (isDemoMode()) return { demo: true, id, status };
  return apiRequest(endpoints.taskStatus(id), { method: "PATCH", body: { status } });
}

export async function removeTask(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.task(id), { method: "DELETE" });
}
