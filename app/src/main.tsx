import "@/styles/fonts.css";
import "@/styles/main.css";

import { PostHogProvider } from "posthog-js/react";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { JotaiProvider } from "@/lib/jotai";
import { posthog } from "@/lib/posthog";
import { Toaster } from "@/lib/toast/toaster";

// Initialize CodeMirror as null
window.codemirror = null;

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <JotaiProvider>
        <App />
      </JotaiProvider>
      <Toaster />
    </PostHogProvider>
  </React.StrictMode>,
);
