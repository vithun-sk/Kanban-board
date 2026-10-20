import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { login, validateLogin } from "@/services/authService";
import { useApp } from "@/context/AppContext";
import { isDemoMode } from "@/config/env";
import { Field, inputClass } from "@/components/ui/Field";

const LoginCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { members, refreshSession } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setInfo("");
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const result = await login({ email, password, members });
      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }
      refreshSession();
      if (result.demo) setInfo(result.message);
      const destination = location.state?.from || "/home";
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[min(100%,28rem)] rounded-xl border border-[var(--on-primary-container)] border-t-8 bg-[var(--surface)] p-7 text-center">
      <div className="text-2xl text-[var(--on-surface)]">
        Flow<span className="font-black text-[var(--primary)]">Sync</span>
      </div>
      <h1 className="p-2 text-3xl font-bold text-[var(--on-surface)] sm:text-4xl">Welcome back</h1>
      <p className="text-sm">Sign in to continue to your workspace</p>
      {isDemoMode() ? (
        <p className="mt-3 rounded-lg bg-[var(--primary-container)] px-3 py-2 text-xs text-[var(--on-primary-container)]">
          Demo mode: any valid email and password starts a local session. Passwords are not stored, and no server login occurs.
        </p>
      ) : null}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <Field label="Email address" htmlFor="emailInput" error={errors.email}>
          <input
            type="email"
            id="emailInput"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
        <Field label="Password" htmlFor="passwordInput" error={errors.password}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="passwordInput"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className={`${inputClass} pr-10`}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)]"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <p className="text-left text-xs text-[var(--outline)]">
          Password reset is not available in demo mode.
        </p>
        {formError ? <p className="text-sm text-[var(--error)]">{formError}</p> : null}
        {info ? <p className="text-sm text-[var(--outline)]">{info}</p> : null}
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-lg">
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <div className="mt-4 border-t border-slate-300">
        <p className="p-3">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-lg font-medium text-[var(--primary)]"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
