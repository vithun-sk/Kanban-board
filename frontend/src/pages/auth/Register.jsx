import React from "react";
import Banner from "../../../public/banner.png";
import SignupCard from "@/components/SignUpCard";

const Register = () => {
  return (
    <div className="h-screen flex bg-[var(--surface-bright)]">
      <section className="w-[50%] flex justify-center items-center slide-right ">
        <SignupCard />
      </section>
      <section className="w-[50%]">
        <img src={Banner} alt="image" className="w-full h-full object-cover slide-left" />
      </section>
    </div>
  );
};

export default Register;
