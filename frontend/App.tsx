import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Auth from "./src/app/auth";
import Dashboard from "./src/app/dashboard";
import File from "./src/app/file";
import { authClient } from "./src/lib/auth-client";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  return session ? children : <Navigate to="/auth" replace />;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  return session ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/file/:fileKey" element={<ProtectedRoute><File /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
