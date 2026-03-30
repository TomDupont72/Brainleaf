import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./src/app/auth";
import Dashboard from "./src/app/dashboard";
import File from "./src/app/file";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/auth" />} />
      <Route path="/file/:fileKey" element={<File />} />
    </Routes>
  );
}
