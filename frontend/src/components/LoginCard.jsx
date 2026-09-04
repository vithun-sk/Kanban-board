import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const LoginCard = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[var(--surface)] w-[80%] border-1 border-[var(--on-primary-container)] border-t-10 rounded-xl text-center p-7">
      <div className="text-2xl text-[var(--on-surface)] ">
        Flow<span className="font-black text-[var(--primary)]">Sync</span>
      </div>
      <h1 className=" font-bold text-4xl text-[var(--on-surface)] p-2">
        Welcome Back!
      </h1>
      <p className="text-sm">Sign in to continue to your workspace</p>
      <form className="mt-10">
        <div className="flex flex-col gap-1  mx-10">
          <label htmlFor="emailInput" className="text-xs font-semibold text-left ">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            id="emailInput"
            name="email"
            placeholder="Enter Email"
            className="w-[100%] p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>
        <div className="flex flex-col gap-1 mt-6 mx-10">
          <div className="flex flex-row justify-between">
            <label
              htmlFor="passwordInput"
              className="text-xs font-semibold text-left "
            >
              PASSWORD
            </label>
            <button
              type="button"
              className="text-sm text-[var(--primary)] hover:opacity-80 transition-all duration-200 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            id="passwordInput"
            name="password"

            placeholder="Enter Password"
            className="w-[100%] p-2 rounded-xl border-2 border-[gray] pl-3"
          />
        </div>
        <Button
          className="p-5 text-lg w-[85%] m-5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-lg"
          onClick={() => navigate("/home")}
        >
          Login
        </Button>
      </form>

      <div className=" mt-2 border-t-2 border-slate-300">
        <p className="p-3">
          Don't have an account ?{" "}
          <span
            className="text-[var(--primary)] cursor-pointer text-lg font-medium ransition-all duration-200 hover:opacity-80"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
