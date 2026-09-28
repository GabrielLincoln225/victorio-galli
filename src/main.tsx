import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/index.css";
import { App } from "./App";

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Em produção o HTML vem pré-renderizado (e este módulo só é injetado depois da
// primeira pintura, ver vite.config.ts): hidrata. No dev, monta do zero.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
