import { isDemoMode } from "@/config/env";
import { STORAGE_KEYS } from "@/constants";
import { getInitials } from "@/lib/ids";
import { readJSON, removeItem, writeJSON } from "@/lib/storage";
import { isValidEmail, passwordGuidance } from "@/lib/validation";
import { apiRequest } from "@/services/apiClient";
import { endpoints } from "@/services/endpoints";

export function getSession() {
  return readJSON(STORAGE_KEYS.SESSION, null);
}

export function clearSession() {
  removeItem(STORAGE_KEYS.SESSION);
}

function saveSession(user) {
  const session = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials || getInitials(user.name),
      role: user.role || "Member",
      title: user.title || "Workspace member",
    },
    demo: true,
    startedAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEYS.SESSION, session);
  return session;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Full name is required.";
  if (!email?.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  const strength = passwordGuidance(password);
  if (!password) errors.password = "Password is required.";
  else if (!strength.valid) errors.password = "Use at least 8 characters with a letter and a number.";
  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return { errors, strength };
}

export async function login({ email, password, members = [] }) {
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!isDemoMode()) {
    const payload = await apiRequest(endpoints.login, {
      method: "POST",
      body: { email, password },
    });
    return { ok: true, session: payload, demo: false };
  }

  const existing = members.find(
    (member) => member.email.toLowerCase() === email.trim().toLowerCase(),
  );

  const session = saveSession(
    existing || {
      id: "demo-user",
      name: "Demo Member",
      email: email.trim(),
      initials: getInitials(email),
      role: "Member",
      title: "Demo session",
    },
  );

  return {
    ok: true,
    session,
    demo: true,
    message: "Demo session started. No server authentication was performed, and the password was not stored.",
  };
}

export async function register({ name, email, password, confirmPassword }) {
  const { errors } = validateRegister({ name, email, password, confirmPassword });
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!isDemoMode()) {
    const payload = await apiRequest(endpoints.register, {
      method: "POST",
      body: { name, email, password },
    });
    return { ok: true, session: payload, demo: false };
  }

  const session = saveSession({
    id: "demo-user",
    name: name.trim(),
    email: email.trim(),
    initials: getInitials(name),
    role: "Member",
    title: "Demo session",
  });

  return {
    ok: true,
    session,
    demo: true,
    message:
      "Local demo profile saved in this browser only. No account was created on a server, and the password was not stored.",
  };
}

export async function logout() {
  if (!isDemoMode()) {
    try {
      await apiRequest(endpoints.logout, { method: "POST" });
    } catch {
      clearSession();
      throw new Error("Unable to end the API session.");
    }
  }
  clearSession();
}
