import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { register, validateRegister } from "@/services/authService";
import { useApp } from "@/context/AppContext";
import { isDemoMode } from "@/config/env";
import { Field, inputClass } from "@/components/ui/Field";
import { passwordGuidance } from "@/lib/validation";

const SignupCard = () => {
  const navigate = useNavigate();
  const { refreshSession } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordGuidance(password), [password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const { errors: nextErrors } = validateRegister({ name, email, password, confirmPassword });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const result = await register({ name, email, password, confirmPassword });
      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }
      refreshSession();
      navigate("/home", { replace: true, state: { demoNotice: result.message } });
    } catch (error) {
      if (error.details && typeof error.details === "object") {
        setErrors(error.details);
      }
      setFormError(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[min(100%,28rem)] rounded-xl border border-[var(--on-primary-container)] border-t-8 bg-[var(--surface)] p-7 text-center">
      <div className="text-2xl text-[var(--on-surface)]">
        Flow<span className="font-black text-[var(--primary)]">Sync</span>
      </div>
      <h1 className="p-2 text-3xl font-bold sm:text-4xl">Create account</h1>
      <p className="text-sm">
        {isDemoMode() ? "Start a local demo workspace" : "Sign up to collaborate with your team"}
      </p>
      {isDemoMode() ? (
        <p className="mt-3 rounded-lg bg-[var(--primary-container)] px-3 py-2 text-xs text-[var(--on-primary-container)]">
          Demo mode: this does not create a server account. Your password is never stored.
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="John Doe"
          />
        </Field>
        <Field label="Email address" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="john@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="Create password"
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
          <ul className="mt-2 space-y-1 text-left text-xs">
            {strength.rules.map((rule) => (
              <li key={rule.id} className={rule.ok ? "text-emerald-600 font-medium" : "text-[var(--outline)]"}>
                {rule.label}
              </li>
            ))}
          </ul>
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass}
            placeholder="Repeat password"
          />
        </Field>
        {formError ? <p className="text-sm text-[var(--error)]">{formError}</p> : null}
        <Button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-[var(--primary)] py-5 text-white transition hover:bg-[#4338CA]"
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[var(--outline)]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignupCard;
