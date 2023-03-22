import "@/ui/styles/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { toast, Toaster } from "sonner";
import { registerSW } from "virtual:pwa-register";

import App from "@/ui/App";

// Initialize CodeMirror as null
window.codemirror = null;

registerSW({
  onNeedRefresh: () => {
    toast("There's a new version available!", {
      action: {
        label: "Update",
        onClick: () => window.location.reload(),
      },
    });
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Toaster richColors closeButton position="top-center" />
    <App />
  </React.StrictMode>,
);
