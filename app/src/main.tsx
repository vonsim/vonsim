import "@/styles/fonts.css";
import "@/styles/main.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";

import App from "@/App";
import { JotaiProvider } from "@/lib/jotai";

// Initialize CodeMirror as null
window.codemirror = null;

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Toaster richColors closeButton position="top-center" />
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </React.StrictMode>,
);
