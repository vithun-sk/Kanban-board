import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-60.5 h-screen border-r border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sticky left-0 top-0">
      <div className="px-6 py-6">
        <div className="text-3xl text-[var(--on-surface)]">
          Flow<span className="font-black text-[var(--primary)]">Sync</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="mb-8">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--outline)]">
            Workspace
          </p>

          <div className="space-y-2">
            <NavLink
              id="navlink"
              to={"/home"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg  text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </NavLink>

            <NavLink
              id="navlink"
              to={"/projects"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <FolderKanban size={19} />
              Projects
            </NavLink>

            <NavLink
              id="navlink"
              to={"/tasks"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <CheckSquare size={19} />
              My Tasks
            </NavLink>

            <NavLink
              id="navlink"
              to={"/calender"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <CalendarDays size={19} />
              Calendar
            </NavLink>

            <NavLink
              id="navlink"
              to={"/teams"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <Users size={19} />
              Team
            </NavLink>
          </div>
        </div>

        <div>
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--outline)]">
            Communication
          </p>

          <div className="space-y-1">
            <NavLink
              id="navlink"
              to={"/messages"}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={19} />
                Messages
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                3
              </span>
            </NavLink>

            <NavLink
              id="navlink"
              to={"/notifications"}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Bell size={19} />
                Notifications
              </span>
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="px-4 pb-5">
        <NavLink
          id="navlink"
          to={"/settings"}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] transition cursor-pointer"
        >
          <Settings size={19} />
          Settings
        </NavLink>

        <div className="mt-4 pt-4 border-t border-[var(--outline-variant)] flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold">
            VS
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Vithun S K</p>
            <p className="text-xs text-[var(--outline)] truncate">
              vithun@example.com
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="text-[var(--outline)] hover:text-[var(--on-surface)] cursor-pointer"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
