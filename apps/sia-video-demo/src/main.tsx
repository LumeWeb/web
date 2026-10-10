import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { useAuthStore } from "./stores/auth";
import { configureDemoStreamAuth } from "./lib/streamService";
import { App } from "./App";

configureDemoStreamAuth(useAuthStore);

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
