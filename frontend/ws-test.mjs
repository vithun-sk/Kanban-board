import { Client } from "@stomp/stompjs";

const BASE = "http://localhost:8080/api/v1";

async function req(path, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json?.data, error: json?.error };
}

const suffix = Math.random().toString(36).slice(2, 10);

const a = await req("/auth/register", { method: "POST", body: { name: "WS Owner", email: `wso_${suffix}@example.com`, password: "Password123!" } });
const b = await req("/auth/register", { method: "POST", body: { name: "WS Peer", email: `wsp_${suffix}@example.com`, password: "Password123!" } });
const tokenA = a.data.token, tokenB = b.data.token, userB = b.data.user;
console.log("registered", a.status, b.status);

const p = await req("/projects", { method: "POST", token: tokenA, body: { name: `WS Project ${suffix}`, description: "ws", status: "In Progress", visibility: "Team", color: "#4f46e5" } });
const projectId = p.data.id;
console.log("project", p.status, projectId);

const m = await req(`/projects/${projectId}/members`, { method: "POST", token: tokenA, body: { userId: userB.id, role: "Developer" } });
console.log("add member", m.status, m.error || "");

const conv = await req(`/projects/${projectId}/conversation`, { method: "POST", token: tokenA, body: {} });
const convId = conv.data.id;
console.log("conversation", conv.status, convId);

const received = { A: [], B: [] };

function makeClient(token, label) {
  const client = new Client({
    brokerURL: "ws://localhost:8080/ws",
    webSocketFactory: () => new WebSocket("ws://localhost:8080/ws"),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 0,
    debug: (msg) => console.log(`[${label}] ${msg}`),
    onConnect: () => {
      console.log(`[${label}] CONNECTED`);
      client.subscribe(`/topic/conversations/${convId}`, (message) => {
        received[label].push(JSON.parse(message.body));
        console.log(`[${label}] RECEIVED`, message.body);
      });
      client.subscribe("/user/queue/errors", (m) => console.log(`[${label}] ERROR FRAME`, m.body));
    },
    onStompError: (f) => console.log(`[${label}] STOMP ERROR`, f.headers?.message, f.body),
    onWebSocketError: (e) => console.log(`[${label}] WS ERROR`, e?.message),
    onWebSocketClose: (e) => console.log(`[${label}] WS CLOSE`, e?.code, e?.reason),
  });
  return client;
}

const clientA = makeClient(tokenA, "A");
const clientB = makeClient(tokenB, "B");
clientA.activate();
clientB.activate();

await new Promise((r) => setTimeout(r, 2500));
console.log("--- after connect, received:", JSON.stringify(received));

console.log("=== TEST 1: REST send message (expect broadcast to B) ===");
const r1 = await req(`/conversations/${convId}/messages`, { method: "POST", token: tokenA, body: { body: "rest-message" } });
console.log("rest send status", r1.status);
await new Promise((r) => setTimeout(r, 1500));
console.log("received A:", received.A.length, "received B:", received.B.length);

console.log("=== TEST 2: STOMP send message ===");
clientA.publish({ destination: `/app/conversations/${convId}/messages`, body: JSON.stringify({ body: "stomp-message" }) });
await new Promise((r) => setTimeout(r, 1500));
console.log("received A:", received.A.length, "received B:", received.B.length);
console.log("A bodies:", received.A.map((m) => m.body));
console.log("B bodies:", received.B.map((m) => m.body));

console.log("=== TEST 3: outsider subscribe attempt ===");
const c = await req("/auth/register", { method: "POST", body: { name: "WS Outsider", email: `wso2_${suffix}@example.com`, password: "Password123!" } });
const clientC = makeClient(c.data.token, "C");
clientC.activate();
await new Promise((r) => setTimeout(r, 2000));

console.log("=== TEST 4: load messages via REST ===");
const hist = await req(`/conversations/${convId}/messages`, { token: tokenA });
console.log("history", hist.status, JSON.stringify(hist.data?.map((x) => x.body)));

await clientA.deactivate();
await clientB.deactivate();
await clientC.deactivate();
process.exit(0);
