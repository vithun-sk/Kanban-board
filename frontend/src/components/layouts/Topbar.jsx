import React from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate()
  return (
    <header className="h-20 border-b border-[var(--outline-variant)] bg-[var(--surface)] flex items-center justify-end px-8 sticky top-0 z-100 ">

      <div className="flex items-center gap-5">
        <button onClick={() => navigate("/notifications")} className="cursor-pointer relative text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
          <Bell size={21} />
          <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-[var(--surface)]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold text-sm">
            VS
          </div>
          <div>
            <p className="text-sm font-semibold">Vithun S K</p>
            <p className="text-xs text-[var(--outline)]">Developer</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
