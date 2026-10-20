import React from "react";
import LoginCard from "@/components/LoginCard";

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-bright)] lg:flex-row">
      <section className="hidden lg:block lg:w-1/2">
        <img src="/banner.png" alt="FlowSync workspace preview" className="h-full w-full object-cover" />
      </section>
      <section className="flex flex-1 items-center justify-center p-6">
        <LoginCard />
      </section>
    </div>
  );
};

export default Login;
