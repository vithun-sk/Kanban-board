import { TASK_STATUS } from "@/constants";
import { isOverdue } from "@/lib/dates";

export function getMember(state, id) {
  return state.members.find((member) => member.id === id) || null;
}

export function getProject(state, id) {
  return state.projects.find((project) => project.id === id) || null;
}

export function getTask(state, id) {
  return state.tasks.find((task) => task.id === id) || null;
}

export function tasksForProject(state, projectId) {
  return state.tasks.filter((task) => task.projectId === projectId);
}

export function projectProgress(state, projectId) {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === TASK_STATUS.DONE).length;
  return Math.round((done / tasks.length) * 100);
}

export function decorateProject(state, project) {
  const tasks = state.tasks.filter((task) => task.projectId === project.id);
  const members = project.memberIds
    .map((id) => getMember(state, id))
    .filter(Boolean);
  return {
    ...project,
    members: members.length,
    memberList: members,
    tasks: tasks.length,
    progress: projectProgress(state, project.id),
  };
}

export function decorateTask(state, task) {
  const assignee = getMember(state, task.assigneeId);
  const project = getProject(state, task.projectId);
  return {
    ...task,
    assignee: assignee?.name || "Unassigned",
    assigneeInitials: assignee?.initials || "?",
    projectName: project?.name || "Unknown project",
    overdue: isOverdue(task.dueDate, task.status),
    labels: Array.isArray(task.labels) ? task.labels : [],
  };
}

export function dashboardMetrics(state, userId) {
  const tasks = state.tasks;
  const mine = tasks.filter((task) => task.assigneeId === userId);
  return {
    totalProjects: state.projects.length,
    totalTasks: tasks.length,
    inProgress: tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length,
    completed: tasks.filter((task) => task.status === TASK_STATUS.DONE).length,
    overdue: tasks.filter((task) => isOverdue(task.dueDate, task.status)).length,
    inReview: tasks.filter((task) => task.status === TASK_STATUS.IN_REVIEW).length,
    todo: tasks.filter((task) => task.status === TASK_STATUS.TODO).length,
    myTasks: mine.length,
    myOverdue: mine.filter((task) => isOverdue(task.dueDate, task.status)).length,
  };
}
