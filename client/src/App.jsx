import { BrowserRouter, Routes, Route } from "react-router-dom";
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
