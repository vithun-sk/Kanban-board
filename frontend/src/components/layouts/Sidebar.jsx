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
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { logout } from "@/services/authService";

const linkClass = ({ isActive }) =>
  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition min-h-11 ${
    isActive
      ? "bg-[var(--primary)] text-white"
      : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
  }`;

const Sidebar = ({ open = false, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, unreadCount, refreshSession } = useApp();

  const handleLogout = async () => {
    await logout();
    refreshSession();
    navigate("/login");
  };

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--outline-variant)] bg-[var(--surface-container-low)] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="text-3xl text-[var(--on-surface)]">
            Flow<span className="font-black text-[var(--primary)]">Sync</span>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--outline)]">
            Workspace
          </p>
          <div className="space-y-1">
            <NavLink to="/home" className={linkClass} onClick={onClose}>
              <LayoutDashboard size={19} />
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={linkClass} onClick={onClose}>
              <FolderKanban size={19} />
              Projects
            </NavLink>
            <NavLink to="/tasks" className={linkClass} onClick={onClose}>
              <CheckSquare size={19} />
              My Tasks
            </NavLink>
            <NavLink to="/calendar" className={linkClass} onClick={onClose}>
              <CalendarDays size={19} />
              Calendar
            </NavLink>
            <NavLink to="/teams" className={linkClass} onClick={onClose}>
              <Users size={19} />
              Team
            </NavLink>
          </div>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--outline)]">
            Communication
          </p>
          <div className="space-y-1">
            <NavLink
              to="/messages"
              className={linkClass}
              onClick={onClose}
            >
              <span className="flex flex-1 items-center gap-3">
                <MessageSquare size={19} />
                Messages
              </span>
            </NavLink>
            <NavLink to="/notifications" className={linkClass} onClick={onClose}>
              <span className="flex flex-1 items-center gap-3">
                <Bell size={19} />
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
          </div>
        </nav>

        <div className="px-4 pb-5">
          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            <Settings size={19} />
            Settings
          </NavLink>
          <div className="mt-4 flex items-center gap-3 border-t border-[var(--outline-variant)] px-2 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] font-semibold text-white">
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
              <p className="truncate text-xs text-[var(--outline)]">{currentUser.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="text-[var(--outline)] hover:text-[var(--on-surface)]"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
