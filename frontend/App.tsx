import { Routes, Route, Navigate } from "react-router-dom";
import Authentication from "./src/app/authentication";
import Dashboard from "./src/app/dashboard";
import File from "./src/app/file";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Authentication />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/auth" />} />
      <Route path="/file/:fileKey" element={<File />} />
    </Routes>
  );
}
