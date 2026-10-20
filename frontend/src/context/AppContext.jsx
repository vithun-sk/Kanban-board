import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isDemoMode } from "@/config/env";
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
  addProjectMemberApi,
  createProjectApi,
  listProjects,
  removeProject,
  removeProjectMemberApi,
  updateProjectApi,
} from "@/services/projectsService";
import {
  changeTaskStatus,
  createTaskApi,
  listTasks,
  removeTask,
  updateTaskApi,
} from "@/services/tasksService";
import {
  listMembers,
  updateProfileApi,
} from "@/services/membersService";
import {
  dismissNotificationApi,
  listNotifications,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "@/services/notificationsService";
import {
  createConversationApi,
  listConversations,
  listMessages,
  postMessage,
} from "@/services/messagesService";
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

function pushActivity(list, message) {
  return [
    { id: createId("act"), message, createdAt: new Date().toISOString() },
    ...(list || []),
  ].slice(0, 40);
}

export function AppProvider({ children }) {
  const demo = isDemoMode();
  const [workspace, setWorkspace] = useState(getDemoState);
  const [session, setSession] = useState(() => getSession());
  const [theme, setThemeState] = useState(() => readJSON(STORAGE_KEYS.THEME, "light"));
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const [apiError, setApiError] = useState(null);

  // API State when in real backend mode
  const [apiProjects, setApiProjects] = useState([]);
  const [apiTasks, setApiTasks] = useState([]);
  const [apiMembers, setApiMembers] = useState([]);
  const [apiNotifications, setApiNotifications] = useState([]);
  const [apiConversations, setApiConversations] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const [apiActivity, setApiActivity] = useState([]);
  const [apiSettings, setApiSettings] = useState(() => ({
    notifyTaskAssigned: true,
    notifyDeadlines: true,
    notifyMessages: true,
  }));

  // Sync demo state changes when in demo mode
  useEffect(() => {
    if (demo) {
      return subscribeDemo(setWorkspace);
    }
  }, [demo]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Load backend data when in API mode
  const loadApiData = useCallback(async () => {
    if (demo) return;
    const currentSession = getSession();
    if (!currentSession?.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      const [projectsData, tasksData, membersData, notificationsData, conversationsData] =
        await Promise.all([
          listProjects().catch(() => []),
          listTasks().catch(() => []),
          listMembers().catch(() => []),
          listNotifications().catch(() => []),
          listConversations().catch(() => []),
        ]);

      setApiProjects(projectsData || []);
      setApiTasks(tasksData || []);
      setApiMembers(membersData || []);
      setApiNotifications(notificationsData || []);
      setApiConversations(conversationsData || []);

      if (conversationsData && conversationsData.length > 0) {
        const firstConvId = conversationsData[0].id;
        const messagesData = await listMessages(firstConvId).catch(() => []);
        setApiMessages(messagesData || []);
      }
    } catch (err) {
      setApiError(err.message || "Failed to load workspace data from API.");
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    if (!demo && session?.token) {
      loadApiData();
    }
  }, [demo, session?.token, loadApiData]);

  const currentUser = session?.user || defaultUser;

  const refreshSession = useCallback(() => {
    const s = getSession();
    setSession(s);
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

  // Project Actions
  const createProject = useCallback(
    async (payload) => {
      return withSubmit(async () => {
        if (!demo) {
          const created = await createProjectApi({
            name: payload.name.trim(),
            description: payload.description?.trim() || "",
            status: payload.status,
            visibility: payload.visibility,
            color: payload.color || "#4f46e5",
            startDate: payload.startDate || null,
            dueDate: payload.deadline || payload.dueDate || null,
            memberIds: payload.memberIds || [],
          });
          setApiProjects((prev) => [created, ...prev]);
          setApiActivity((prev) => pushActivity(prev, `${currentUser.name} created project ${created.name}.`));
          return created;
        }

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
          activity: pushActivity(state.activity, `${currentUser.name} created project ${project.name}.`),
          notifications: [
            {
              id: createId("n"),
              read: false,
              createdAt: new Date().toISOString(),
              type: "project",
              title: "Project created",
              message: `${project.name} was added to the demo workspace.`,
              relatedType: "project",
              relatedId: project.id,
            },
            ...state.notifications,
          ],
        }));
        return project;
      });
    },
    [demo, currentUser.name, withSubmit]
  );

  const updateProject = useCallback(
    async (id, payload) => {
      if (!demo) {
        const updated = await updateProjectApi(id, {
          name: payload.name?.trim(),
          description: payload.description?.trim(),
          status: payload.status,
          visibility: payload.visibility,
          color: payload.color,
          startDate: payload.startDate || null,
          dueDate: payload.deadline || payload.dueDate || null,
        });
        setApiProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        setApiActivity((prev) => pushActivity(prev, `${currentUser.name} updated project ${updated.name || ""}.`));
        return updated;
      }

      updateDemoState((state) => ({
        ...state,
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...payload, updatedAt: new Date().toISOString() } : project
        ),
        activity: pushActivity(state.activity, `${currentUser.name} updated a project.`),
      }));
    },
    [demo, currentUser.name]
  );

  const deleteProject = useCallback(
    async (id) => {
      if (!demo) {
        await removeProject(id);
        setApiProjects((prev) => prev.filter((p) => p.id !== id));
        setApiTasks((prev) => prev.filter((t) => t.projectId !== id));
        setApiActivity((prev) => pushActivity(prev, `${currentUser.name} deleted a project.`));
        return;
      }

      updateDemoState((state) => ({
        ...state,
        projects: state.projects.filter((project) => project.id !== id),
        tasks: state.tasks.filter((task) => task.projectId !== id),
        activity: pushActivity(state.activity, `${currentUser.name} deleted a project.`),
      }));
    },
    [demo, currentUser.name]
  );

  // Task Actions
  const createTask = useCallback(
    async (payload) => {
      return withSubmit(async () => {
        if (!demo) {
          const created = await createTaskApi({
            projectId: payload.projectId,
            title: payload.title.trim(),
            description: payload.description?.trim() || "",
            status: payload.status || TASK_STATUS.TODO,
            priority: payload.priority || "Medium",
            assigneeId: payload.assigneeId || null,
            labels: payload.labels || [],
            startDate: payload.startDate || null,
            dueDate: payload.dueDate || null,
          });
          setApiTasks((prev) => [created, ...prev]);
          setApiActivity((prev) => pushActivity(prev, `${currentUser.name} created task ${created.title}.`));
          return created;
        }

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
          activity: pushActivity(state.activity, `${currentUser.name} created task ${task.title}.`),
          notifications: [
            {
              id: createId("n"),
              read: false,
              createdAt: new Date().toISOString(),
              type: "task",
              title: "Task created",
              message: `${task.title} was added${project ? ` to ${project.name}` : ""}.`,
              relatedType: "task",
              relatedId: task.id,
            },
            ...state.notifications,
          ],
        }));
        return task;
      });
    },
    [demo, currentUser.name, withSubmit]
  );

  const updateTask = useCallback(
    async (id, payload) => {
      if (!demo) {
        let updated;
        if (payload.status && Object.keys(payload).length === 1) {
          updated = await changeTaskStatus(id, payload.status);
        } else {
          updated = await updateTaskApi(id, payload);
        }
        setApiTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
        setApiActivity((prev) => pushActivity(prev, `${currentUser.name} updated a task.`));
        return updated;
      }

      updateDemoState((state) => {
        const previous = state.tasks.find((task) => task.id === id);
        const nextTasks = state.tasks.map((task) =>
          task.id === id ? { ...task, ...payload, updatedAt: new Date().toISOString() } : task
        );
        let notifications = state.notifications;
        if (payload.status && previous && payload.status !== previous.status) {
          notifications = [
            {
              id: createId("n"),
              read: false,
              createdAt: new Date().toISOString(),
              type: "task",
              title: "Task status updated",
              message: `${previous.title} moved to ${payload.status}.`,
              relatedType: "task",
              relatedId: id,
            },
            ...state.notifications,
          ];
        }
        return {
          ...state,
          tasks: nextTasks,
          notifications,
          activity: pushActivity(state.activity, `${currentUser.name} updated a task.`),
        };
      });
    },
    [demo, currentUser.name]
  );

  const deleteTask = useCallback(
    async (id) => {
      if (!demo) {
        await removeTask(id);
        setApiTasks((prev) => prev.filter((t) => t.id !== id));
        setApiActivity((prev) => pushActivity(prev, `${currentUser.name} deleted a task.`));
        return;
      }

      updateDemoState((state) => ({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id),
        activity: pushActivity(state.activity, `${currentUser.name} deleted a task.`),
      }));
    },
    [demo, currentUser.name]
  );

  // Members Actions
  const addMember = useCallback(
    (payload) => {
      const member = {
        id: createId("m"),
        name: payload.name.trim(),
        email: payload.email.trim(),
        initials: getInitials(payload.name),
        role: payload.role || "Member",
        title: payload.title || "Team member",
      };

      if (!demo) {
        setApiMembers((prev) => [...prev, member]);
        return member;
      }

      updateDemoState((state) => ({
        ...state,
        members: [...state.members, member],
        notifications: [
          {
            id: createId("n"),
            read: false,
            createdAt: new Date().toISOString(),
            type: "team",
            title: "Member added (demo)",
            message: `${member.name} was added locally. No invitation email was sent.`,
            relatedType: "member",
            relatedId: member.id,
          },
          ...state.notifications,
        ],
      }));
      return member;
    },
    [demo]
  );

  const updateMember = useCallback(
    (id, payload) => {
      if (!demo) {
        setApiMembers((prev) =>
          prev.map((member) => (member.id === id ? { ...member, ...payload } : member))
        );
        return;
      }

      updateDemoState((state) => ({
        ...state,
        members: state.members.map((member) =>
          member.id === id ? { ...member, ...payload } : member
        ),
      }));
    },
    [demo]
  );

  const removeMember = useCallback(
    (id) => {
      if (!demo) {
        setApiMembers((prev) => prev.filter((member) => member.id !== id));
        setApiTasks((prev) =>
          prev.map((task) => (task.assigneeId === id ? { ...task, assigneeId: null } : task))
        );
        return;
      }

      updateDemoState((state) => ({
        ...state,
        members: state.members.filter((member) => member.id !== id),
        tasks: state.tasks.map((task) =>
          task.assigneeId === id ? { ...task, assigneeId: null } : task
        ),
        projects: state.projects.map((project) => ({
          ...project,
          memberIds: (project.memberIds || []).filter((memberId) => memberId !== id),
        })),
      }));
    },
    [demo]
  );

  const addProjectMember = useCallback(
    async (projectId, payload) => {
      if (!demo) {
        const added = await addProjectMemberApi(projectId, payload);
        const freshProjects = await listProjects();
        setApiProjects(freshProjects);
        setApiActivity((prev) =>
          pushActivity(prev, `${currentUser.name} added ${added.name || "a member"} to a project.`)
        );
        return added;
      }

      updateDemoState((state) => {
        const memberId = payload.userId || payload.id;
        return {
          ...state,
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, memberIds: Array.from(new Set([...(p.memberIds || []), memberId])) }
              : p
          ),
          activity: pushActivity(state.activity, `${currentUser.name} added a member to a project.`),
        };
      });
    },
    [demo, currentUser.name]
  );

  const removeProjectMember = useCallback(
    async (projectId, memberId) => {
      if (!demo) {
        await removeProjectMemberApi(projectId, memberId);
        const freshProjects = await listProjects();
        setApiProjects(freshProjects);
        setApiActivity((prev) =>
          pushActivity(prev, `${currentUser.name} removed a member from a project.`)
        );
        return;
      }

      updateDemoState((state) => ({
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, memberIds: (p.memberIds || []).filter((id) => id !== memberId) }
            : p
        ),
        activity: pushActivity(state.activity, `${currentUser.name} removed a member from a project.`),
      }));
    },
    [demo, currentUser.name]
  );

  // Notification Actions
  const markNotificationRead = useCallback(
    async (id) => {
      if (!demo) {
        await markNotificationReadApi(id);
        setApiNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, read: true } : item))
        );
        return;
      }

      updateDemoState((state) => ({
        ...state,
        notifications: state.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item
        ),
      }));
    },
    [demo]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!demo) {
      await markAllNotificationsReadApi();
      setApiNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      return;
    }

    updateDemoState((state) => ({
      ...state,
      notifications: state.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, [demo]);

  const dismissNotification = useCallback(
    async (id) => {
      if (!demo) {
        await dismissNotificationApi(id);
        setApiNotifications((prev) => prev.filter((item) => item.id !== id));
        return;
      }

      updateDemoState((state) => ({
        ...state,
        notifications: state.notifications.filter((item) => item.id !== id),
      }));
    },
    [demo]
  );

  // Messages Actions
  const sendMessage = useCallback(
    async (conversationId, body) => {
      if (!demo) {
        const sent = await postMessage(conversationId, body.trim());
        setApiMessages((prev) => [...prev, sent]);
        setApiConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, updatedAt: sent.createdAt } : c))
        );
        return sent;
      }

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
            : conversation
        ),
      }));
      return message;
    },
    [demo, currentUser.id]
  );

  const createConversation = useCallback(
    async (memberId) => {
      if (!demo) {
        const created = await createConversationApi([memberId]);
        setApiConversations((prev) => [created, ...prev]);
        return created;
      }

      const existing = workspace.conversations.find(
        (conversation) =>
          conversation.memberIds.length === 2 &&
          conversation.memberIds.includes(CURRENT_USER_ID) &&
          conversation.memberIds.includes(memberId)
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
    },
    [demo, workspace]
  );

  // Profile and Settings Actions
  const updateSettings = useCallback(
    (payload) => {
      if (!demo) {
        setApiSettings((prev) => ({ ...prev, ...payload }));
        return;
      }
      updateDemoState((state) => ({
        ...state,
        settings: { ...state.settings, ...payload },
      }));
    },
    [demo]
  );

  const updateProfile = useCallback(
    async (payload) => {
      if (!demo) {
        const updated = await updateProfileApi(payload);
        const nextUser = {
          ...currentUser,
          ...updated,
          initials: getInitials(updated.name || currentUser.name),
        };
        const sessionData = getSession();
        if (sessionData) {
          writeJSON(STORAGE_KEYS.SESSION, { ...sessionData, user: nextUser });
          setSession({ ...sessionData, user: nextUser });
        }
        return nextUser;
      }

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
              : member
          ),
        }));
      }
      return nextUser;
    },
    [demo, currentUser]
  );

  const resetWorkspace = useCallback(() => {
    if (demo) {
      resetDemoState();
    } else {
      loadApiData();
    }
  }, [demo, loadApiData]);

  // Unified State & Selectors
  const currentWorkspace = useMemo(() => {
    if (demo) return workspace;
    return {
      projects: apiProjects,
      tasks: apiTasks,
      members: apiMembers,
      notifications: apiNotifications,
      conversations: apiConversations,
      messages: apiMessages,
      activity: apiActivity,
      settings: apiSettings,
    };
  }, [
    demo,
    workspace,
    apiProjects,
    apiTasks,
    apiMembers,
    apiNotifications,
    apiConversations,
    apiMessages,
    apiActivity,
    apiSettings,
  ]);

  const projects = useMemo(
    () => currentWorkspace.projects.map((project) => decorateProject(currentWorkspace, project)),
    [currentWorkspace]
  );

  const tasks = useMemo(
    () => currentWorkspace.tasks.map((task) => decorateTask(currentWorkspace, task)),
    [currentWorkspace]
  );

  const metrics = useMemo(
    () =>
      dashboardMetrics(
        currentWorkspace,
        demo && currentUser.id === "demo-user" ? CURRENT_USER_ID : currentUser.id
      ),
    [currentWorkspace, demo, currentUser.id]
  );

  const unreadCount = useMemo(
    () => currentWorkspace.notifications.filter((item) => !item.read).length,
    [currentWorkspace.notifications]
  );

  const value = useMemo(
    () => ({
      workspace: currentWorkspace,
      projects,
      tasks,
      members: currentWorkspace.members,
      notifications: currentWorkspace.notifications,
      conversations: currentWorkspace.conversations,
      messages: currentWorkspace.messages,
      activity: currentWorkspace.activity,
      settings: currentWorkspace.settings,
      currentUser,
      session,
      theme,
      submitting,
      loading,
      apiError,
      isDemoMode: demo,
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
      addProjectMember,
      removeProjectMember,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      sendMessage,
      createConversation,
      updateSettings,
      updateProfile,
      resetWorkspace,
      loadApiData,
    }),
    [
      currentWorkspace,
      projects,
      tasks,
      currentUser,
      session,
      theme,
      submitting,
      loading,
      apiError,
      demo,
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
      addProjectMember,
      removeProjectMember,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      sendMessage,
      createConversation,
      updateSettings,
      updateProfile,
      resetWorkspace,
      loadApiData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
