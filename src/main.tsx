import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.dataset.theme = localStorage.getItem("wos.admin.theme") === "dark" ? "dark" : "light";
document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", document.documentElement.dataset.theme === "dark" ? "#070b13" : "#F5F6FA");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
