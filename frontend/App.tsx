import { Routes, Route, Navigate } from "react-router-dom"
import Authentification from "./src/app/authentification"
import Dashboard from "./src/app/dashboard"

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Authentification />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  )
}