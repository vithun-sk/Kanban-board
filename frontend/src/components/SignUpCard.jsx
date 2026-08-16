import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const SignupCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--surface)] w-[80%] border border-[var(--on-primary-container)] border-t-10 rounded-xl text-center p-7">
      <div className="text-2xl text-[var(--on-surface)]">
        Flow<span className="font-black text-[var(--primary)]">Sync</span>
      </div>

      <h1 className="font-bold text-4xl text-[var(--on-surface)] p-2">
        Create Account
      </h1>

      <p className="text-sm">Create your account and start collaborating</p>

      <form className="mt-8">
        {/* Full Name */}
        <div className="flex flex-col gap-1 mx-10">
          <label htmlFor="name" className="text-xs font-semibold text-left">
            FULL NAME
          </label>

          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your full name"
            className="w-full p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 mt-5 mx-10">
          <label htmlFor="email" className="text-xs font-semibold text-left">
            EMAIL ADDRESS
          </label>

          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            className="w-full p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 mt-5 mx-10">
          <label htmlFor="password" className="text-xs font-semibold text-left">
            PASSWORD
          </label>

          <input
            type="password"
            name="password"
            id="password"
            placeholder="Create a password"
            className="w-full p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1 mt-5 mx-10">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-left"
          >
            CONFIRM PASSWORD
          </label>

          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm your password"
            className="w-full p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>

        {/* Create Account Button */}
        <Button
          type="button"
          className="p-5 text-lg w-[85%] m-5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-lg"
          onClick={() => navigate("/login")}
        >
          Create Account
        </Button>
      </form>

      {/* Login Redirect */}
      <div className="mt-2 border-t-2 border-slate-300">
        <p className="p-3">
          Already have an account?{" "}
          <span
            className="text-[var(--primary)] cursor-pointer text-lg font-medium transition-all duration-200 hover:opacity-80"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupCard;
