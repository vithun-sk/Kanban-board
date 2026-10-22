import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  configFile: "./vite.config.js",
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const load = async (path) => server.ssrLoadModule(path);

const tasksService = await load("/src/services/tasksService.js");
const membersService = await load("/src/services/membersService.js");
const messagesService = await load("/src/services/messagesService.js");
const projectsService = await load("/src/services/projectsService.js");
const authService = await load("/src/services/authService.js");
const env = await load("/src/config/env.js");

console.log("API_BASE_URL:", env.API_BASE_URL, "demo:", env.isDemoMode());

const suffix = Math.random().toString(36).slice(2, 10);

// --- register through the real frontend auth service -----------------
const regA = await authService.register({
  name: "FE Owner",
  email: `feo_${suffix}@example.com`,
  password: "Password123!",
  confirmPassword: "Password123!",
});
console.log("register A:", regA.ok);
const regB = await authService.register({
  name: "FE Peer",
  email: `fep_${suffix}@example.com`,
  password: "Password123!",
  confirmPassword: "Password123!",
});
console.log("register B:", regB.ok);

// the session is stored in localStorage, which does not exist in node.
// re-implement the token handling the apiClient uses.
const tokenA = regA.session.token;
const tokenB = regB.session.token;
globalThis.localStorage = {
  store: { "flowsync.demo.session.v1": JSON.stringify(regA.session) },
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
};

console.log("\n=== TASK CREATION (frontend service layer) ===");
const project = await projectsService.createProjectApi({
  name: `FE Project ${suffix}`,
  description: "frontend harness",
  status: "In Progress",
  visibility: "Team",
  color: "#4f46e5",
  startDate: null,
  dueDate: null,
  memberIds: [],
});
console.log("project created:", project.id);

const created = await tasksService.createTaskApi({
  projectId: project.id,
  title: "Frontend task",
  description: "created by harness",
  status: "To Do",
  priority: "Medium",
  assigneeId: null,
  labels: ["Bug"],
  startDate: null,
  dueDate: null,
});
console.log("task created:", created.id, created.title, "projectId:", created.projectId);

const listed = await tasksService.listProjectTasks(project.id);
console.log("listProjectTasks count:", listed.length, "ids match:", listed[0]?.id === created.id);

const allTasks = await tasksService.listTasks();
console.log("listTasks includes it:", allTasks.some((t) => t.id === created.id));

const fetched = await tasksService.getTaskById(created.id);
console.log("getTaskById ok:", fetched?.title);

const statusChanged = await tasksService.changeTaskStatus(created.id, "In Progress");
console.log("changeTaskStatus:", statusChanged.status);

const updated = await tasksService.updateTaskApi(created.id, { title: "Renamed", description: "d" });
console.log("updateTaskApi:", updated.title);

console.log("\n=== MEMBERS (frontend service layer) ===");
const members = await membersService.listMembers();
console.log("workspace users:", members.length);

const found = await membersService.findUserByEmail(regB.session.user.email);
console.log("findUserByEmail ->", found.id, found.email);

try {
  await membersService.findUserByEmail(`ghost_${suffix}@example.com`);
  console.log("findUserByEmail unknown -> NO ERROR (bug)");
} catch (e) {
  console.log("findUserByEmail unknown ->", e.status, e.message);
}

const added = await projectsService.addProjectMemberApi(project.id, {
  userId: found.id,
  role: "Developer",
});
console.log("addProjectMember:", added.id, "userId:", added.userId, "role:", added.role);

const memberList = await projectsService.listProjectMembers(project.id);
console.log("listProjectMembers:", memberList.map((m) => `${m.name}/${m.role}`).join(", "));

try {
  await projectsService.addProjectMemberApi(project.id, { userId: found.id, role: "Developer" });
  console.log("duplicate add -> NO ERROR (bug)");
} catch (e) {
  console.log("duplicate add ->", e.status, e.message);
}

console.log("\n=== CHAT (frontend service layer) ===");
const conv = await projectsService.openProjectConversation(project.id);
console.log("conversation:", conv.id, "projectId:", conv.projectId);

const page = await messagesService.listMessagePage(conv.id, 0, 50);
console.log("listMessagePage items:", page.items?.length, "hasOlder:", page.hasOlder);

const posted = await messagesService.postMessage(conv.id, "hello from harness");
console.log("postMessage:", posted.id, posted.body);

const msgs = await messagesService.listMessages(conv.id);
console.log("listMessages:", msgs.map((m) => m.body).join(" | "));

const convs = await messagesService.listConversations();
console.log("listConversations:", convs.map((c) => `${c.title}:${c.projectId ? "project" : "direct"}`).join(", "));

console.log("\n=== REMOVE MEMBER (frontend service layer) ===");
const removed = await projectsService.removeProjectMemberApi(project.id, added.id);
console.log("removeProjectMemberApi ok:", removed);
const after = await projectsService.listProjectMembers(project.id);
console.log("members after remove:", after.map((m) => m.name).join(", "));

await server.close();
process.exit(0);
