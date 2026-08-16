import React from "react";
import Banner from "../../../public/banner.png";
import LoginCard from "@/components/LoginCard";

const Login = () => {
  
  return (
    <div className="h-screen flex bg-[var(--surface-bright)]">
      <section className="w-[50%] slide-right">
        <img src={Banner} alt="image" className="w-full h-full object-cover"/>
      </section>
      <section className="w-[50%] flex justify-center items-center  slide-left">
        <LoginCard/>
      </section>
    </div>
  );
};

export default Login;
