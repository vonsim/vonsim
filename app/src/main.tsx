import "@/styles/fonts.css";
import "@/styles/main.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { JotaiProvider } from "@/lib/jotai";
import { Notifications } from "@/lib/notifications";

// Initialize CodeMirror as null
window.codemirror = null;

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Notifications />
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </React.StrictMode>,
);
