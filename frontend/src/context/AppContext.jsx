import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENT_USER_ID, STORAGE_KEYS, TASK_STATUS } from "@/constants";
import { defaultUser } from "@/data/seed";
import { createId, getInitials } from "@/lib/ids";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSession } from "@/services/authService";
import {
  getDemoState,
  resetDemoState,
  subscribeDemo,
  updateDemoState,
} from "@/services/demoRepository";
import {
  dashboardMetrics,
  decorateProject,
  decorateTask,
  getMember,
  getProject,
} from "@/services/selectors";

const AppContext = createContext(null);

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  writeJSON(STORAGE_KEYS.THEME, theme);
}

function pushActivity(state, message) {
  return [
    { id: createId("act"), message, createdAt: new Date().toISOString() },
    ...state.activity,
  ].slice(0, 40);
}

function pushNotification(state, notification) {
  return [
    {
      id: createId("n"),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    },
    ...state.notifications,
  ];
}

export function AppProvider({ children }) {
  const [workspace, setWorkspace] = useState(getDemoState);
  const [session, setSession] = useState(() => getSession());
  const [theme, setThemeState] = useState(() => readJSON(STORAGE_KEYS.THEME, "light"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => subscribeDemo(setWorkspace), []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const currentUser = session?.user || defaultUser;

  const refreshSession = useCallback(() => {
    setSession(getSession());
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
  }, []);

  const withSubmit = useCallback(async (fn) => {
    if (submitting) return null;
    setSubmitting(true);
    try {
      return await fn();
    } finally {
      window.setTimeout(() => setSubmitting(false), 250);
    }
  }, [submitting]);

  const createProject = useCallback((payload) => {
    return withSubmit(() => {
      const project = {
        id: createId("p"),
        name: payload.name.trim(),
        description: payload.description.trim(),
        status: payload.status,
        visibility: payload.visibility,
        color: payload.color || "#4f46e5",
        startDate: payload.startDate || "",
        deadline: payload.deadline || "",
        memberIds: payload.memberIds?.length ? payload.memberIds : [CURRENT_USER_ID],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateDemoState((state) => ({
        ...state,
        projects: [project, ...state.projects],
        activity: pushActivity(state, `${currentUser.name} created project ${project.name}.`),
        notifications: pushNotification(state, {
          type: "project",
          title: "Project created",
          message: `${project.name} was added to the demo workspace.`,
          relatedType: "project",
          relatedId: project.id,
        }),
      }));
      return project;
    });
  }, [currentUser.name, withSubmit]);

  const updateProject = useCallback((id, payload) => {
    updateDemoState((state) => ({
      ...state,
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...payload, updatedAt: new Date().toISOString() }
          : project,
      ),
      activity: pushActivity(state, `${currentUser.name} updated a project.`),
    }));
  }, [currentUser.name]);

  const deleteProject = useCallback((id) => {
    updateDemoState((state) => ({
      ...state,
      projects: state.projects.filter((project) => project.id !== id),
      tasks: state.tasks.filter((task) => task.projectId !== id),
      activity: pushActivity(state, `${currentUser.name} deleted a project.`),
    }));
  }, [currentUser.name]);

  const createTask = useCallback((payload) => {
    return withSubmit(() => {
      const task = {
        id: createId("t"),
        projectId: payload.projectId,
        title: payload.title.trim(),
        description: payload.description.trim(),
        status: payload.status || TASK_STATUS.TODO,
        priority: payload.priority,
        assigneeId: payload.assigneeId || null,
        labels: payload.labels || [],
        startDate: payload.startDate || "",
        dueDate: payload.dueDate || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const project = getProject(getDemoState(), task.projectId);
      updateDemoState((state) => ({
        ...state,
        tasks: [task, ...state.tasks],
        activity: pushActivity(state, `${currentUser.name} created task ${task.title}.`),
        notifications: pushNotification(state, {
          type: "task",
          title: "Task created",
          message: `${task.title} was added${project ? ` to ${project.name}` : ""}.`,
          relatedType: "task",
          relatedId: task.id,
        }),
      }));
      return task;
    });
  }, [currentUser.name, withSubmit]);

  const updateTask = useCallback((id, payload) => {
    updateDemoState((state) => {
      const previous = state.tasks.find((task) => task.id === id);
      const nextTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...payload, updatedAt: new Date().toISOString() } : task,
      );
      let notifications = state.notifications;
      if (payload.status && previous && payload.status !== previous.status) {
        notifications = pushNotification(state, {
          type: "task",
          title: "Task status updated",
          message: `${previous.title} moved to ${payload.status}.`,
          relatedType: "task",
          relatedId: id,
        });
      }
      return {
        ...state,
        tasks: nextTasks,
        notifications,
        activity: pushActivity(state, `${currentUser.name} updated a task.`),
      };
    });
  }, [currentUser.name]);

  const deleteTask = useCallback((id) => {
    updateDemoState((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== id),
      activity: pushActivity(state, `${currentUser.name} deleted a task.`),
    }));
  }, [currentUser.name]);

  const addMember = useCallback((payload) => {
    const member = {
      id: createId("m"),
      name: payload.name.trim(),
      email: payload.email.trim(),
      initials: getInitials(payload.name),
      role: payload.role || "Member",
      title: payload.title || "Team member",
    };
    updateDemoState((state) => ({
      ...state,
      members: [...state.members, member],
      notifications: pushNotification(state, {
        type: "team",
        title: "Member added (demo)",
        message: `${member.name} was added locally. No invitation email was sent.`,
        relatedType: "member",
        relatedId: member.id,
      }),
    }));
    return member;
  }, []);

  const updateMember = useCallback((id, payload) => {
    updateDemoState((state) => ({
      ...state,
      members: state.members.map((member) =>
        member.id === id ? { ...member, ...payload } : member,
      ),
    }));
  }, []);

  const removeMember = useCallback((id) => {
    updateDemoState((state) => ({
      ...state,
      members: state.members.filter((member) => member.id !== id),
      tasks: state.tasks.map((task) =>
        task.assigneeId === id ? { ...task, assigneeId: null } : task,
      ),
      projects: state.projects.map((project) => ({
        ...project,
        memberIds: project.memberIds.filter((memberId) => memberId !== id),
      })),
    }));
  }, []);

  const markNotificationRead = useCallback((id) => {
    updateDemoState((state) => ({
      ...state,
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    updateDemoState((state) => ({
      ...state,
      notifications: state.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const dismissNotification = useCallback((id) => {
    updateDemoState((state) => ({
      ...state,
      notifications: state.notifications.filter((item) => item.id !== id),
    }));
  }, []);

  const sendMessage = useCallback((conversationId, body) => {
    const message = {
      id: createId("msg"),
      conversationId,
      senderId: currentUser.id === "demo-user" ? CURRENT_USER_ID : currentUser.id,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    updateDemoState((state) => ({
      ...state,
      messages: [...state.messages, message],
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, updatedAt: message.createdAt }
          : conversation,
      ),
    }));
    return message;
  }, [currentUser.id]);

  const createConversation = useCallback((memberId) => {
    const existing = workspace.conversations.find(
      (conversation) =>
        conversation.memberIds.length === 2 &&
        conversation.memberIds.includes(CURRENT_USER_ID) &&
        conversation.memberIds.includes(memberId),
    );
    if (existing) return existing;
    const member = getMember(workspace, memberId);
    const conversation = {
      id: createId("c"),
      title: member?.name || "Conversation",
      memberIds: [CURRENT_USER_ID, memberId],
      updatedAt: new Date().toISOString(),
    };
    updateDemoState((state) => ({
      ...state,
      conversations: [conversation, ...state.conversations],
    }));
    return conversation;
  }, [workspace]);

  const updateSettings = useCallback((payload) => {
    updateDemoState((state) => ({
      ...state,
      settings: { ...state.settings, ...payload },
    }));
  }, []);

  const updateProfile = useCallback((payload) => {
    const nextUser = {
      ...currentUser,
      ...payload,
      initials: getInitials(payload.name || currentUser.name),
    };
    const sessionData = getSession();
    if (sessionData) {
      writeJSON(STORAGE_KEYS.SESSION, { ...sessionData, user: nextUser });
      setSession({ ...sessionData, user: nextUser });
    }
    if (nextUser.id && nextUser.id !== "demo-user") {
      updateDemoState((state) => ({
        ...state,
        members: state.members.map((member) =>
          member.id === nextUser.id
            ? { ...member, name: nextUser.name, email: nextUser.email, initials: nextUser.initials }
            : member,
        ),
      }));
    }
  }, [currentUser]);

  const resetWorkspace = useCallback(() => {
    resetDemoState();
  }, []);

  const projects = useMemo(
    () => workspace.projects.map((project) => decorateProject(workspace, project)),
    [workspace],
  );
  const tasks = useMemo(
    () => workspace.tasks.map((task) => decorateTask(workspace, task)),
    [workspace],
  );
  const metrics = useMemo(
    () => dashboardMetrics(workspace, currentUser.id === "demo-user" ? CURRENT_USER_ID : currentUser.id),
    [workspace, currentUser.id],
  );
  const unreadCount = workspace.notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      workspace,
      projects,
      tasks,
      members: workspace.members,
      notifications: workspace.notifications,
      conversations: workspace.conversations,
      messages: workspace.messages,
      activity: workspace.activity,
      settings: workspace.settings,
      currentUser,
      session,
      theme,
      submitting,
      metrics,
      unreadCount,
      refreshSession,
      setTheme,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      addMember,
      updateMember,
      removeMember,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      sendMessage,
      createConversation,
      updateSettings,
      updateProfile,
      resetWorkspace,
    }),
    [
      workspace,
      projects,
      tasks,
      currentUser,
      session,
      theme,
      submitting,
      metrics,
      unreadCount,
      refreshSession,
      setTheme,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      addMember,
      updateMember,
      removeMember,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      sendMessage,
      createConversation,
      updateSettings,
      updateProfile,
      resetWorkspace,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
