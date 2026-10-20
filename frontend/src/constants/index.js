export const TASK_STATUS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const TASK_STATUS_LIST = Object.values(TASK_STATUS);

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_LIST = Object.values(TASK_PRIORITY);

export const PRIORITY_RANK = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const PROJECT_STATUS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

export const PROJECT_STATUS_LIST = Object.values(PROJECT_STATUS);

export const PROJECT_VISIBILITY = {
  TEAM: "Team",
  PRIVATE: "Private",
};

export const MEMBER_ROLES = ["Owner", "Admin", "Developer", "Designer", "QA", "Member"];

export const CURRENT_USER_ID = "m1";

export const STORAGE_KEYS = {
  WORKSPACE: "flowsync.demo.workspace.v1",
  SESSION: "flowsync.demo.session.v1",
  THEME: "flowsync.theme",
};

export const STORE_VERSION = 1;

export const LABEL_OPTIONS = [
  "Frontend",
  "Backend",
  "UI/UX",
  "API",
  "Database",
  "Bug",
  "Design",
  "Docs",
  "QA",
];
