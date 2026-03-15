import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const BUILD = "1.2.1";

const stored = localStorage.getItem("brainleaf_build");

if (stored !== BUILD) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("brainleaf_build", BUILD);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
