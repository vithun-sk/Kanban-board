import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/auth/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calender from "./pages/Calender";
import Notifications from "./pages/Notifications";
import Teams from "./pages/Teams";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      <Route path="/home" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/calender" element={<Calender />} />
      <Route path="/teams" element={<Teams />} />

      <Route path="/messages" element={<Messages />} />
      <Route path="/notifications" element={<Notifications />} />

      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default App;
