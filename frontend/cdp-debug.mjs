const CDP = "http://127.0.0.1:9222";
const res = await fetch(CDP + "/json/new?about:blank", { method: "PUT" });
const t = await res.json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
});
const send = (method, params = {}) => {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.has(mid)) { pending.delete(mid); reject(new Error("timeout " + method)); }
    }, 20000);
  });
};
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/register" });
await new Promise((r) => setTimeout(r, 3500));
for (const expr of [
  "(async () => { return location.pathname; })()",
  "(async () => { return document.title; })()",
  "(async () => { return document.querySelectorAll('input').length; })()",
  "location.pathname",
]) {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  console.log(expr, "=>", JSON.stringify(r));
}
process.exit(0);
