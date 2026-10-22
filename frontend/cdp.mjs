import { setTimeout as delay } from "node:timers/promises";

const CDP = "http://127.0.0.1:9222";

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" });
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json;
    } catch {}
    await delay(500);
  }
  throw new Error("no CDP target");
}

const t = await target();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const logs = [];

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
    const text = (msg.params.args || [])
      .map((a) => a.value ?? a.description ?? a.unserializableValue ?? JSON.stringify(a.preview ?? {}))
      .join(" ");
    logs.push({ type: msg.params.type, text });
  }
  if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    logs.push({ type: "EXCEPTION", text: d.exception?.description || d.text });
  }
  if (msg.method === "Log.entryAdded") {
    logs.push({ type: `log:${msg.params.entry.level}`, text: msg.params.entry.text });
  }
});

await new Promise((r) => ws.addEventListener("open", r));

function send(method, params = {}) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.has(mid)) {
        pending.delete(mid);
        reject(new Error(`timeout ${method}`));
      }
    }, 30000);
  });
}

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

await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Network.enable");

export { send, evaluate, logs, delay };

globalThis.__cdp = { send, evaluate, logs, delay };
