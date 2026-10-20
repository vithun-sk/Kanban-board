import React from "react";
import { Link, useLocation } from "react-router-dom";

const copy = {
  "/privacy": {
    title: "Privacy",
    body: "This frontend demo stores workspace data and a session profile in your browser. Passwords are never saved. When a backend is connected, a real privacy policy should replace this page.",
  },
  "/terms": {
    title: "Terms",
    body: "FlowSync is currently a frontend demonstration. Sample people and projects are fictional. Do not use this demo for production work or sensitive data.",
  },
};

const Legal = () => {
  const { pathname } = useLocation();
  const page = copy[pathname] || copy["/privacy"];

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <Link to="/" className="text-sm text-[var(--primary)]">
        Back to FlowSync
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{page.title}</h1>
      <p className="mt-4 leading-7 text-[var(--on-surface-variant)]">{page.body}</p>
    </div>
  );
};

export default Legal;
