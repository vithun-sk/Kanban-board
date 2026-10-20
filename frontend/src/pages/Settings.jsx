import React, { useState } from "react";
import { Field, inputClass } from "@/components/ui/Field";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail } from "@/lib/validation";
import { changePasswordApi } from "@/services/membersService";

const Settings = () => {
  const {
    currentUser,
    theme,
    setTheme,
    settings,
    updateSettings,
    updateProfile,
    resetWorkspace,
    isDemoMode,
  } = useApp();
  const { push } = useToast();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [notify, setNotify] = useState(settings);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    const next = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await updateProfile({ name, email });
      push("Profile saved successfully.");
    } catch (err) {
      push(err.message || "Failed to update profile.", "error");
    }
  };

  const savePrefs = (event) => {
    event.preventDefault();
    updateSettings(notify);
    push("Preferences saved.");
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPwdError("");
    if (!currentPassword) {
      setPwdError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setPwdLoading(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      push("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwdError(err.message || "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-[var(--on-surface-variant)]">
          {isDemoMode
            ? "Demo preferences are stored in this browser. They are not synced to a server."
            : "Manage your profile, account preferences, and security settings."}
        </p>
      </div>

      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-semibold text-white">
            {currentUser.initials}
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-[var(--outline)]">{currentUser.email}</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="mt-6 space-y-4">
          <Field label="Full name" htmlFor="settings-name" error={errors.name}>
            <input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="settings-email" error={errors.email}>
            <input id="settings-email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setName(currentUser.name);
                setEmail(currentUser.email);
                setErrors({});
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[#4338CA]">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="mt-4 flex gap-3">
          {["light", "dark"].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setTheme(value)}
              className={`rounded-lg border px-4 py-2 capitalize ${
                theme === value ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--outline-variant)]"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6">
        <h2 className="text-lg font-semibold">Notification preferences</h2>
        <form onSubmit={savePrefs} className="mt-4 space-y-3">
          {[
            ["notifyTaskAssigned", "Task assignment updates"],
            ["notifyDeadlines", "Deadline reminders"],
            ["notifyMessages", "Message activity"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(notify[key])}
                onChange={(event) => setNotify((current) => ({ ...current, [key]: event.target.checked }))}
              />
              {label}
            </label>
          ))}
          <button type="submit" className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[#4338CA]">
            Save preferences
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6">
        <h2 className="text-lg font-semibold">Password</h2>
        {isDemoMode ? (
          <p className="mt-2 text-sm text-[var(--outline)]">
            Password changes require a backend account service. Connect the Spring Boot API to enable password management.
          </p>
        ) : (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <Field label="Current password" htmlFor="current-pwd">
              <input
                id="current-pwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="New password" htmlFor="new-pwd">
              <input
                id="new-pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm-new-pwd">
              <input
                id="confirm-new-pwd"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass}
              />
            </Field>
            {pwdError ? <p className="text-sm text-[var(--error)]">{pwdError}</p> : null}
            <button
              type="submit"
              disabled={pwdLoading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[#4338CA]"
            >
              {pwdLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </section>

      {isDemoMode ? (
        <section className="rounded-xl border border-[var(--error)] bg-[var(--surface-container)] p-6">
          <h2 className="text-lg font-semibold">Reset demo data</h2>
          <p className="mt-2 text-sm text-[var(--outline)]">
            Restore the original sample projects, tasks, messages, and notifications in this browser.
          </p>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-4 rounded-lg bg-[var(--error)] px-4 py-2 text-sm text-white"
          >
            Reset workspace
          </button>
        </section>
      ) : null}

      {confirmReset ? (
        <ConfirmDialog
          title="Reset demo workspace?"
          description="Local project, task, team, message, and notification changes will be replaced with the original sample data."
          confirmLabel="Reset"
          destructive
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            resetWorkspace();
            setConfirmReset(false);
            push("Demo workspace restored.");
          }}
        />
      ) : null}
    </div>
  );
};

export default Settings;
