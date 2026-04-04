import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const BUILD = "1.4.8";

const stored = localStorage.getItem("brainleaf_build");

const queryClient = new QueryClient();

if (stored !== BUILD) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("brainleaf_build", BUILD);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
