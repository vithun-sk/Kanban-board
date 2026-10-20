import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/auth/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import Teams from "./pages/Teams";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import AppLayout from "./components/layouts/AppLayout";
import RequireAuth from "./components/layouts/RequireAuth";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/privacy" element={<Legal />} />
      <Route path="/terms" element={<Legal />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/create" element={<ProjectCreate />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/calender" element={<Navigate to="/calendar" replace />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
