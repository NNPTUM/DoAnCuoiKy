import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Các route khác sẽ thêm vào đây sau */}
        <Route
          path="/"
          element={<h1>Trang chủ - Bảng tin (Đang xây dựng)</h1>}
        />
        <Route
          path="/register"
          element={<h1>Trang Đăng ký (Đang xây dựng)</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
