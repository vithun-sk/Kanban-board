import { isDemoMode } from "@/config/env";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";
import { getDemoState } from "@/services/demoRepository";

export async function listProjects() {
  if (isDemoMode()) return getDemoState().projects;
  return apiRequest(endpoints.projects);
}

export async function getProjectById(id) {
  if (isDemoMode()) return getDemoState().projects.find((project) => project.id === id) || null;
  return apiRequest(endpoints.project(id));
}

export async function saveProject(payload, id) {
  if (isDemoMode()) return { demo: true, payload, id };
  return apiRequest(id ? endpoints.project(id) : endpoints.projects, {
    method: id ? "PUT" : "POST",
    body: payload,
  });
}

export async function removeProject(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.project(id), { method: "DELETE" });
}
