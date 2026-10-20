import { STORE_VERSION, STORAGE_KEYS } from "@/constants";
import { createSeedState } from "@/data/seed";
import { readJSON, writeJSON } from "@/lib/storage";

function isValidState(value) {
  return (
    value &&
    value.version === STORE_VERSION &&
    Array.isArray(value.projects) &&
    Array.isArray(value.tasks) &&
    Array.isArray(value.members) &&
    Array.isArray(value.notifications) &&
    Array.isArray(value.messages) &&
    Array.isArray(value.conversations) &&
    Array.isArray(value.activity) &&
    value.settings &&
    typeof value.settings === "object"
  );
}

function loadState() {
  const stored = readJSON(STORAGE_KEYS.WORKSPACE, null);
  if (isValidState(stored)) return stored;
  const seed = createSeedState();
  writeJSON(STORAGE_KEYS.WORKSPACE, seed);
  return seed;
}

let state = loadState();
const listeners = new Set();

function emit() {
  writeJSON(STORAGE_KEYS.WORKSPACE, state);
  listeners.forEach((listener) => listener(state));
}

export function getDemoState() {
  return state;
}

export function subscribeDemo(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function updateDemoState(updater) {
  const next = updater(state);
  state = next;
  emit();
  return state;
}

export function resetDemoState() {
  state = createSeedState();
  emit();
  return state;
}
