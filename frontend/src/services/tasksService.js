import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listTasks() {
  if (isDemoMode()) return getDemoState().tasks;
  return apiRequest(endpoints.tasks);
}

export async function listProjectTasks(projectId) {
  if (isDemoMode()) {
    return getDemoState().tasks.filter((task) => task.projectId === projectId);
  }
  return apiRequest(endpoints.projectTasks(projectId));
}

export async function getTaskById(id) {
  if (isDemoMode()) return getDemoState().tasks.find((task) => task.id === id) || null;
  return apiRequest(endpoints.task(id));
}

export async function saveTask(payload, id) {
  if (isDemoMode()) return { demo: true, payload, id };
  return apiRequest(id ? endpoints.task(id) : endpoints.tasks, {
    method: id ? "PATCH" : "POST",
    body: payload,
  });
}

export async function createTaskApi(payload) {
  if (isDemoMode()) return { demo: true, payload };
  return apiRequest(endpoints.tasks, {
    method: "POST",
    body: payload,
  });
}

export async function updateTaskApi(id, payload) {
  if (isDemoMode()) return { demo: true, id, payload };
  return apiRequest(endpoints.task(id), {
    method: "PATCH",
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

export async function fetchCalendarTasks(start, end) {
  if (isDemoMode()) return getDemoState().tasks;
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  const query = params.toString();
  return apiRequest(`${endpoints.calendar}${query ? `?${query}` : ""}`);
}
