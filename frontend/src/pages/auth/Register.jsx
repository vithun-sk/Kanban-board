import React from "react";
import SignupCard from "@/components/SignUpCard";

const Register = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-bright)] lg:flex-row">
      <section className="flex flex-1 items-center justify-center p-6">
        <SignupCard />
      </section>
      <section className="hidden lg:block lg:w-1/2">
        <img src="/banner.png" alt="FlowSync collaboration preview" className="h-full w-full object-cover" />
      </section>
    </div>
  );
};

export default Register;
