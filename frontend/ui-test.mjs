import { setTimeout as delay } from "node:timers/promises";

const CDP = "http://127.0.0.1:9222";
const APP = "http://localhost:5173";

async function newTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" });
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json;
    } catch {}
    await delay(400);
  }
  throw new Error("no CDP target");
}

const t = await newTarget();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const logs = [];
const requests = [];

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.consoleAPICalled") {
    logs.push({
      type: msg.params.type,
      text: (msg.params.args || []).map((a) => a.value ?? a.description ?? a.unserializableValue ?? "").join(" "),
    });
  }
  if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    logs.push({ type: "EXCEPTION", text: d.exception?.description || d.text });
  }
  if (msg.method === "Log.entryAdded") {
    logs.push({ type: `log:${msg.params.entry.level}`, text: msg.params.entry.text });
  }
  if (msg.method === "Network.responseReceived") {
    const r = msg.params.response;
    if (r.status >= 400) requests.push(`${r.status} ${r.url}`);
  }
  if (msg.method === "Network.loadingFailed") {
    requests.push(`FAILED ${msg.params.errorText}`);
  }
});

await new Promise((r) => ws.addEventListener("open", r));

function send(method, params = {}) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.has(mid)) { pending.delete(mid); reject(new Error(`timeout ${method}`)); }
    }, 30000);
  });
}

const HELPERS = `
  window.__set = (sel, value) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return 'NOT FOUND';
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  };
  window.__clickText = (text) => {
    const els = [...document.querySelectorAll('button, a')];
    const el = els.reverse().find((e) => (e.textContent || '').trim().toLowerCase() === text.toLowerCase() && e.offsetParent !== null);
    if (!el) return 'NOT FOUND: ' + text;
    el.click();
    return 'clicked';
  };
  window.__clickAll = (text) => {
    const els = [...document.querySelectorAll('button, a')];
    const found = els.filter((e) => (e.textContent || '').trim().toLowerCase().includes(text.toLowerCase()) && e.offsetParent !== null);
    found.forEach((e) => e.click());
    return found.length;
  };
  window.__txt = () => document.body.innerText;
  return 'helpers ready';
`;

async function evaluate(expression) {
  const res = await send("Runtime.evaluate", {
    expression: `(async () => { ${expression} })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (res.exceptionDetails) {
    return { error: res.exceptionDetails.exception?.description || res.exceptionDetails.text };
  }
  return { value: res.result?.value };
}

async function ev(expr, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const r = await evaluate(expr);
    if (r.error) {
      console.log("  !! EVAL ERROR:", String(r.error).split("\n")[0]);
      return undefined;
    }
    if (r.value !== undefined) return r.value;
    await delay(600);
  }
  return undefined;
}

await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Network.enable");

async function nav(url) {
  await send("Page.navigate", { url });
  await delay(2500);
  await ev(HELPERS);
  await ev(HELPERS);
}

const suffix = Math.random().toString(36).slice(2, 8);
const emailA = `ui_a_${suffix}@example.com`;
const emailB = `ui_b_${suffix}@example.com`;
const BASE = "http://localhost:8080/api/v1";
await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "UI Peer", email: emailB, password: "Password123!" }),
});

console.log("### 1. REGISTER user A through the UI");
await nav(`${APP}/register`);
console.log("inputs:", await ev(`[...document.querySelectorAll('input')].map(e=>e.id).join(',')`));
await ev(`__set('#name','UI Owner'); __set('#email','${emailA}'); __set('#password','Password123!'); __set('#confirmPassword','Password123!'); return 1;`);
await ev(`__clickAll('sign up'); return 1;`);
await delay(3000);
await ev(HELPERS);
console.log("url after register:", await ev("return location.pathname;"));
console.log("body:", String(await ev("return __txt();")).slice(0, 260).replace(/\n+/g, " | "));

console.log("\n### 2. CREATE PROJECT");
await nav(`${APP}/projects/create`);
console.log("form inputs:", await ev(`return [...document.querySelectorAll('input,textarea,select')].map(e=>e.id+':'+e.tagName).join(',');`));
await ev(`__set('#project-name','UI Project ${suffix}'); const d=document.querySelector('#project-description'); if(d) __set(d,'ui project'); return 1;`);
await ev(`__clickAll('create project'); return 1;`);
await delay(3000);
await ev(HELPERS);
console.log("url:", await ev("return location.pathname;"));

console.log("\n### 3. CREATE TASK in the project");
await ev(`__clickAll('add task'); return 1;`);
await delay(800);
await ev(HELPERS);
console.log("modal open:", await ev(`return !!document.querySelector('[role=dialog]');`));
await ev(`__set('#task-title','UI created task'); const d=document.querySelector('#task-description'); if(d) __set(d,'made in browser'); return 1;`);
await ev(`__clickAll('create task'); return 1;`);
await delay(3000);
await ev(HELPERS);
console.log("task visible on board:", await ev(`return __txt().includes('UI created task');`));
console.log("modal still open:", await ev(`return !!document.querySelector('[role=dialog]');`));
console.log("toasts:", await ev(`return [...document.querySelectorAll('[role=status]')].map(e=>e.innerText).join(' || ');`));

console.log("\n### 4. ADD MEMBER");
await ev(`__clickAll('add member'); return 1;`);
await delay(800);
await ev(HELPERS);
console.log("add-member modal open:", await ev(`return !!document.querySelector('[role=dialog]');`));
console.log("modal fields:", await ev(`return [...document.querySelectorAll('[role=dialog] input,[role=dialog] select')].map(e=>e.id+':'+e.tagName).join(',');`));
console.log("modal text:", String(await ev(`const d=document.querySelector('[role=dialog]'); return d? d.innerText.replace(/\\n+/g,' | '):'none';`)).slice(0, 400));

console.log("\n### 5. OPEN TEAM CHAT + SEND MESSAGE");
await ev(`__clickAll('open team chat'); return 1;`);
await delay(3000);
await ev(HELPERS);
console.log("chat input present:", await ev(`return !!document.querySelector('input[id^=chat-input]');`));
console.log("chat area text:", String(await ev(`const e=document.querySelector('input[id^=chat-input]'); return e? e.closest('div').parentElement.innerText.replace(/\\n+/g,' | ').slice(0,300):'none';`)));
await ev(`__set('input[id^=chat-input]','hello from the browser'); return 1;`);
await ev(`__clickText('Send'); return 1;`);
await delay(2500);
await ev(HELPERS);
console.log("message rendered:", await ev(`return __txt().includes('hello from the browser');`));
console.log("toasts:", await ev(`return [...document.querySelectorAll('[role=status]')].map(e=>e.innerText).join(' || ');`));

console.log("\n### 6. RELOAD / navigate back to project (persistence)");
await nav(`${APP}/projects`);
await delay(1500);
await ev(HELPERS);
console.log("project link present:", await ev(`return __txt().includes('UI Project ${suffix}');`));
await ev(`__clickAll('UI Project ${suffix}'); return 1;`);
await delay(3000);
await ev(HELPERS);
console.log("url:", await ev("return location.pathname;"));
console.log("task after reload:", await ev(`return __txt().includes('UI created task');`));
console.log("members listed:", await ev(`const m=__txt().match(/Members \\(\\d+\\)/); return m?m[0]:'?';`));

console.log("\n### 7. REAL-TIME: second user (peer) checks the chat");
const peerToken = (await (await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: emailB, password: "Password123!" }) })).json()).data.token;
console.log("peer logged in, token len", peerToken.length);

console.log("\n=== CONSOLE LOGS ===");
logs.forEach((l) => console.log(`[${l.type}] ${String(l.text).slice(0, 400)}`));
console.log("\n=== FAILED REQUESTS (>=400) ===");
console.log(requests.join("\n") || "(none)");

process.exit(0);
