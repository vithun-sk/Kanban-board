import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  openProjectConversation,
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
  findUserByEmail,
  removeUserMembershipsApi,
  updateProfileApi,
  updateUserRoleApi,
} from "@/services/membersService";
import {
  dismissNotificationApi,
  listNotifications,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "@/services/notificationsService";
import {
  acceptProjectInvitation as acceptProjectInvitationApi,
  declineProjectInvitation as declineProjectInvitationApi,
  listInvitations,
  sendProjectInvitation as sendProjectInvitationApi,
} from "@/services/invitationsService";
import {
  createConversationApi,
  listConversations,
  listMessagePage,
  listMessages,
  postMessage,
} from "@/services/messagesService";
import { realtimeClient } from "@/services/realtime";
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

/**
 * Merges messages by id and keeps them in chronological order. Messages can arrive both
 * from the API response and from the real-time broadcast, so duplicates are removed here.
 */
function mergeMessages(existing, incoming) {
  const byId = new Map((existing || []).map((message) => [message.id, message]));
  (incoming || []).forEach((message) => {
    if (message && message.id) byId.set(message.id, message);
  });
  return [...byId.values()].sort(
    (left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
  );
}

function mergeConversation(existing, incoming) {
  if (!incoming) return existing;
  const index = (existing || []).findIndex((conversation) => conversation.id === incoming.id);
  if (index === -1) return [incoming, ...(existing || [])];
  const next = [...existing];
  next[index] = { ...next[index], ...incoming };
  return next;
}

export function AppProvider({ children }) {
  const demo = isDemoMode();
  const [workspace, setWorkspace] = useState(getDemoState);
  const [session, setSession] = useState(() => getSession());
  const currentUser = session?.user || defaultUser;
  const [theme, setThemeState] = useState(() => readJSON(STORAGE_KEYS.THEME, "light"));
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const [apiError, setApiError] = useState(null);

  // API State when in real backend mode
  const [apiProjects, setApiProjects] = useState([]);
  const [apiTasks, setApiTasks] = useState([]);
  const [apiMembers, setApiMembers] = useState([]);
  const [apiNotifications, setApiNotifications] = useState([]);
  const [apiInvitations, setApiInvitations] = useState([]);
  const [apiConversations, setApiConversations] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const [apiMessagePages, setApiMessagePages] = useState({});
  const [apiMessageStatus, setApiMessageStatus] = useState({});
  const [apiActivity, setApiActivity] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState("idle");
  const [apiSettings, setApiSettings] = useState(() => ({
    notifyTaskAssigned: true,
    notifyDeadlines: true,
    notifyMessages: true,
  }));
  const apiLoadRequestRef = useRef(0);

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
    const requestId = ++apiLoadRequestRef.current;
    const currentSession = getSession();
    if (!currentSession?.token) {
      setApiProjects([]);
      setApiTasks([]);
      setApiNotifications([]);
      setApiInvitations([]);
      setApiConversations([]);
      setApiMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      // Every request is reported, a failing endpoint is never replaced by an empty list.
      const results = await Promise.allSettled([
        listProjects(),
        listTasks(),
        listNotifications(),
        listConversations(),
        listInvitations(),
      ]);

      const [
        projectsResult,
        tasksResult,
        notificationsResult,
        conversationsResult,
        invitationsResult,
      ] = results;
      if (requestId !== apiLoadRequestRef.current) return;
      const failure = results.find((result) => result.status === "rejected");

      if (projectsResult.status === "fulfilled") setApiProjects(projectsResult.value || []);
      if (tasksResult.status === "fulfilled") setApiTasks(tasksResult.value || []);
      if (notificationsResult.status === "fulfilled") setApiNotifications(notificationsResult.value || []);
      if (conversationsResult.status === "fulfilled") setApiConversations(conversationsResult.value || []);
      if (invitationsResult.status === "fulfilled") setApiInvitations(invitationsResult.value || []);

      if (failure) {
        setApiError(failure.reason?.message || "Failed to load workspace data from API.");
      }
    } catch (err) {
      if (requestId !== apiLoadRequestRef.current) return;
      setApiError(err.message || "Failed to load workspace data from API.");
    } finally {
      if (requestId === apiLoadRequestRef.current) setLoading(false);
    }
  }, [demo]);

  const sendInvitation = useCallback(
    async (projectId, inviteeId) => {
      const invitation = await sendProjectInvitationApi(projectId, inviteeId);
      return invitation;
    },
    []
  );

  const respondToInvitation = useCallback(
    async (invitationId, response) => {
      const updated = response === "accept"
        ? await acceptProjectInvitationApi(invitationId)
        : await declineProjectInvitationApi(invitationId);
      setApiInvitations((previous) =>
        previous.map((invitation) => invitation.id === updated.id ? updated : invitation)
      );
      if (response === "accept") await loadApiData();
      return updated;
    },
    [loadApiData]
  );

  useEffect(() => {
    if (!demo) void loadApiData();
  }, [demo, session?.token, loadApiData]);

  // Derive members from accessible projects (do not use global users list)
  useEffect(() => {
    if (demo) return;
    const membersMap = new Map();
    // Include current user
    if (currentUser?.id) {
      membersMap.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        initials: currentUser.initials,
        role: currentUser.role || "Member",
        title: currentUser.title || "",
      });
    }
    for (const project of apiProjects) {
      if (Array.isArray(project.memberList)) {
        for (const pm of project.memberList) {
          if (pm?.userId && !membersMap.has(pm.userId)) {
            membersMap.set(pm.userId, {
              id: pm.userId,
              name: pm.name,
              email: pm.email,
              initials: pm.initials,
              role: pm.role || "Member",
              title: pm.title || "",
            });
          } else if (pm?.userId && membersMap.has(pm.userId)) {
            const existing = membersMap.get(pm.userId);
            membersMap.set(pm.userId, { ...existing, name: existing.name || pm.name, email: existing.email || pm.email, initials: existing.initials || pm.initials, role: existing.role || pm.role });
          }
        }
      }
    }
    setApiMembers(Array.from(membersMap.values()));
  }, [demo, apiProjects, currentUser]);

  // Keep the real-time connection aligned with the signed in session.
  useEffect(() => {
    if (demo || !session?.token) {
      realtimeClient.disconnect();
      return undefined;
    }
    realtimeClient.connect(session.token);
    return undefined;
  }, [demo, session?.token]);

  // Surface the live connection state so the chat can report it honestly.
  useEffect(() => realtimeClient.onStatus(setRealtimeStatus), []);

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
    async (payload) => {
      const email = String(payload.email || "").trim();

      if (!demo) {
        // Only accounts that already exist in the users table can be added. The backend
        // rejects unknown addresses, so no account is ever created from the UI.
        const account = await findUserByEmail(email);
        const member = {
          id: account.id,
          name: account.name,
          email: account.email,
          initials: account.initials,
          role: payload.role || account.role || "Member",
          title: account.title || "Team member",
        };
        setApiMembers((prev) =>
          prev.some((existing) => existing.id === member.id) ? prev : [...prev, member]
        );
        return member;
      }

      const member = {
        id: createId("m"),
        name: payload.name.trim(),
        email,
        initials: getInitials(payload.name),
        role: payload.role || "Member",
        title: payload.title || "Team member",
      };

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
    async (id, payload) => {
      if (!demo) {
        if (payload.role) {
          const updated = await updateUserRoleApi(id, payload.role);
          setApiMembers((prev) =>
            prev.map((member) => (member.id === id ? { ...member, ...updated } : member))
          );
          return;
        }
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
    async (id) => {
      if (!demo) {
        // Remove the member from all projects they belong to
        await removeUserMembershipsApi(id);
        setApiMembers((prev) => prev.filter((member) => member.id !== id));
        setApiProjects((prev) =>
          prev.map((project) => {
            const memberList = (project.memberList || []).filter((member) => member.userId !== id);
            const removed = (project.memberList || []).find((member) => member.userId === id);
            return {
              ...project,
              memberList,
              memberIds: removed
                ? (project.memberIds || []).filter((memberId) => memberId !== id)
                : (project.memberIds || []).filter((memberId) => memberId !== id),
              members: memberList.length,
            };
          })
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
        // The state is only updated after the API confirmed the membership.
        setApiProjects((prev) =>
          prev.map((project) => {
            if (project.id !== projectId) return project;
            const memberList = project.memberList?.some((member) => member.id === added.id)
              ? project.memberList
              : [...(project.memberList || []), added];
            const memberIds = project.memberIds?.includes(added.userId)
              ? project.memberIds
              : [...(project.memberIds || []), added.userId];
            return {
              ...project,
              memberList,
              memberIds,
              members: memberList.length,
            };
          })
        );
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
        // The membership row is deleted by the API first. The local state is only
        // updated once the request succeeded, so a failed request keeps the member.
        await removeProjectMemberApi(projectId, memberId);
        setApiProjects((prev) =>
          prev.map((project) => {
            if (project.id !== projectId) return project;
            const removed = (project.memberList || []).find((member) => member.id === memberId);
            const memberList = (project.memberList || []).filter((member) => member.id !== memberId);
            const memberIds = removed
              ? (project.memberIds || []).filter((id) => id !== removed.userId)
              : project.memberIds;
            return {
              ...project,
              memberList,
              memberIds,
              members: Math.max((project.members || memberList.length) - 1, 0),
            };
          })
        );
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
  const loadMessages = useCallback(
    async (conversationId, page = 0) => {
      if (!demo) {
        setApiMessageStatus((prev) => ({
          ...prev,
          [conversationId]: { ...(prev[conversationId] || {}), loading: true, error: null },
        }));
        try {
          const result = await listMessagePage(conversationId, page);
          const items = result?.items || [];
          setApiMessages((prev) => mergeMessages(prev, items));
          setApiMessagePages((prev) => ({
            ...prev,
            [conversationId]: {
              page: result?.page ?? page,
              size: result?.size ?? items.length,
              totalElements: result?.totalElements ?? items.length,
              totalPages: result?.totalPages ?? 1,
              hasNewer: result?.hasNewer ?? false,
              hasOlder: result?.hasOlder ?? false,
            },
          }));
          setApiMessageStatus((prev) => ({
            ...prev,
            [conversationId]: { ...(prev[conversationId] || {}), loading: false, error: null },
          }));
          return result;
        } catch (err) {
          setApiMessageStatus((prev) => ({
            ...prev,
            [conversationId]: {
              ...(prev[conversationId] || {}),
              loading: false,
              error: err.message || "Failed to load messages.",
            },
          }));
          throw err;
        }
      }

      const messages = await listMessages(conversationId);
      setApiMessages((prev) => mergeMessages(prev, messages));
      return { items: messages, page: 0, totalElements: messages.length, hasOlder: false };
    },
    [demo]
  );

  const openTeamConversation = useCallback(
    async (projectId) => {
      if (demo) {
        const project = workspace.projects.find((item) => item.id === projectId);
        const existing = workspace.conversations.find(
          (conversation) => conversation.projectId === projectId
        );
        if (existing) return existing;
        const conversation = {
          id: createId("c"),
          title: `${project?.name || "Project"} team chat`,
          memberIds: project?.memberIds || [CURRENT_USER_ID],
          projectId,
          updatedAt: new Date().toISOString(),
        };
        updateDemoState((state) => ({
          ...state,
          conversations: [conversation, ...state.conversations],
        }));
        return conversation;
      }

      const conversation = await openProjectConversation(projectId);
      setApiConversations((prev) => mergeConversation(prev, conversation));
      await loadMessages(conversation.id);
      return conversation;
    },
    [demo, loadMessages, workspace]
  );

  const sendMessage = useCallback(
    async (conversationId, body) => {
      if (!demo) {
        const sent = await postMessage(conversationId, body.trim());
        setApiMessages((prev) => mergeMessages(prev, [sent]));
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

  const subscribeToConversation = useCallback((conversationId, handler) => {
    if (!conversationId) return () => {};
    return realtimeClient.subscribe(conversationId, (message) => {
      setApiMessages((prev) => mergeMessages(prev, [message]));
      setApiConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, updatedAt: message.createdAt || conversation.updatedAt }
            : conversation
        )
      );
      listNotifications()
        .then((items) => setApiNotifications(items || []))
        .catch((err) => {
            setApiError(err.message || "Failed to refresh message notifications.");
        });
      handler?.(message);
    });
  }, []);

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
      invitations: apiInvitations,
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
    apiInvitations,
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
  const invitations = useMemo(
    () => currentWorkspace.invitations || [],
    [currentWorkspace.invitations]
  );

  const value = useMemo(
    () => ({
      workspace: currentWorkspace,
      projects,
      tasks,
      members: currentWorkspace.members,
      notifications: currentWorkspace.notifications,
      invitations,
      conversations: currentWorkspace.conversations,
      messages: currentWorkspace.messages,
      messageStatus: apiMessageStatus,
      messagePages: apiMessagePages,
      realtimeStatus,
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
      pendingInvitationCount: invitations.filter(
        (invitation) => invitation.status === "PENDING",
      ).length,
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
      sendInvitation,
      respondToInvitation,
      sendMessage,
      createConversation,
      loadMessages,
      openTeamConversation,
      subscribeToConversation,
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
      apiMessageStatus,
      apiMessagePages,
      realtimeStatus,
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
      sendInvitation,
      respondToInvitation,
      invitations,
      sendMessage,
      createConversation,
      loadMessages,
      openTeamConversation,
      subscribeToConversation,
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
