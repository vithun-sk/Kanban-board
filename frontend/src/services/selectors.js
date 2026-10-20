import { TASK_STATUS } from "@/constants";
import { isOverdue } from "@/lib/dates";

export function getMember(state, id) {
  return (state.members || []).find((member) => member.id === id || member.userId === id) || null;
}

export function getProject(state, id) {
  return (state.projects || []).find((project) => project.id === id) || null;
}

export function getTask(state, id) {
  return (state.tasks || []).find((task) => task.id === id) || null;
}

export function tasksForProject(state, projectId) {
  return (state.tasks || []).filter((task) => task.projectId === projectId);
}

export function projectProgress(state, projectId) {
  const tasks = (state.tasks || []).filter((task) => task.projectId === projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === TASK_STATUS.DONE || task.status === "Done" || task.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export function decorateProject(state, project) {
  const tasks = (state.tasks || []).filter((task) => task.projectId === project.id);
  const memberList = project.memberList && project.memberList.length > 0
    ? project.memberList
    : (project.memberIds || []).map((id) => getMember(state, id)).filter(Boolean);

  return {
    ...project,
    deadline: project.deadline || project.dueDate || "",
    members: project.members !== undefined ? project.members : memberList.length,
    memberList,
    tasks: project.tasks !== undefined ? project.tasks : tasks.length,
    progress: project.progress !== undefined ? project.progress : projectProgress(state, project.id),
  };
}

export function decorateTask(state, task) {
  const assignee = getMember(state, task.assigneeId);
  const project = getProject(state, task.projectId);
  const statusDone = task.status === TASK_STATUS.DONE || task.status === "Done" || task.status === "DONE";

  return {
    ...task,
    assignee: task.assignee && task.assignee !== "Unassigned" ? task.assignee : (assignee?.name || "Unassigned"),
    assigneeInitials: task.assigneeInitials && task.assigneeInitials !== "?" ? task.assigneeInitials : (assignee?.initials || "?"),
    projectName: task.projectName || project?.name || "Unknown project",
    overdue: task.overdue !== undefined ? task.overdue : isOverdue(task.dueDate, task.status),
    labels: Array.isArray(task.labels) ? task.labels : [],
    isDone: statusDone,
  };
}

export function dashboardMetrics(state, userId) {
  const tasks = state.tasks || [];
  const projects = state.projects || [];
  const mine = tasks.filter((task) => task.assigneeId === userId);

  return {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    inProgress: tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS || task.status === "In Progress" || task.status === "IN_PROGRESS").length,
    completed: tasks.filter((task) => task.status === TASK_STATUS.DONE || task.status === "Done" || task.status === "DONE").length,
    overdue: tasks.filter((task) => isOverdue(task.dueDate, task.status)).length,
    inReview: tasks.filter((task) => task.status === TASK_STATUS.IN_REVIEW || task.status === "In Review" || task.status === "IN_REVIEW").length,
    todo: tasks.filter((task) => task.status === TASK_STATUS.TODO || task.status === "To Do" || task.status === "TODO").length,
    myTasks: mine.length,
    myOverdue: mine.filter((task) => isOverdue(task.dueDate, task.status)).length,
  };
}
