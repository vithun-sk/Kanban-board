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
    method: id ? "PATCH" : "POST",
    body: payload,
  });
}

export async function createProjectApi(payload) {
  if (isDemoMode()) return { demo: true, payload };
  return apiRequest(endpoints.projects, {
    method: "POST",
    body: payload,
  });
}

export async function updateProjectApi(id, payload) {
  if (isDemoMode()) return { demo: true, id, payload };
  return apiRequest(endpoints.project(id), {
    method: "PATCH",
    body: payload,
  });
}

export async function removeProject(id) {
  if (isDemoMode()) return { demo: true, id };
  return apiRequest(endpoints.project(id), { method: "DELETE" });
}

export async function listProjectMembers(projectId) {
  if (isDemoMode()) return [];
  return apiRequest(endpoints.projectMembers(projectId));
}

export async function addProjectMemberApi(projectId, payload) {
  if (isDemoMode()) return { demo: true, projectId, payload };
  return apiRequest(endpoints.projectMembers(projectId), {
    method: "POST",
    body: payload,
  });
}

export async function updateProjectMemberRoleApi(projectId, memberId, role) {
  if (isDemoMode()) return { demo: true, projectId, memberId, role };
  return apiRequest(endpoints.projectMember(projectId, memberId), {
    method: "PATCH",
    body: { role },
  });
}

export async function removeProjectMemberApi(projectId, memberId) {
  if (isDemoMode()) return { demo: true, projectId, memberId };
  return apiRequest(endpoints.projectMember(projectId, memberId), {
    method: "DELETE",
  });
}
