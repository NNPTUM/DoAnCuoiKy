import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./api/axios";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Message from "./pages/Message";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Friends from "./pages/Friends";

function App() {
  // Apply theme and settings globally based on logged in user
  useEffect(() => {
    const applyGlobalSettings = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/settings");
          if (res.data.success && res.data.data) {
            const settings = res.data.data;
            if (settings.theme === "dark") {
              // Hacky but very effective way to make web app dark without rewriting inline styles
              document.documentElement.style.filter = "invert(0.9) hue-rotate(180deg)";
              // Prevent images and videos from being inverted
              const style = document.createElement("style");
              style.id = "dark-mode-img-fix";
              style.innerHTML = "img, video { filter: invert(1.11) hue-rotate(180deg) !important; }";
              if (!document.getElementById("dark-mode-img-fix")) {
                document.head.appendChild(style);
              }
            } else {
              document.documentElement.style.filter = "none";
              const styleBlob = document.getElementById("dark-mode-img-fix");
              if (styleBlob) styleBlob.remove();
            }
          }
        } catch (error) {
          console.error("Failed to fetch settings globally", error);
        }
      }
    };
    applyGlobalSettings();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Các route khác sẽ thêm vào đây sau */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Message />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
