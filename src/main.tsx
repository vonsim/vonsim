import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "~/simulator/App";

import "~/simulator/styles/index.css";

// Initialize CodeMirror as null
window.codemirror = null;

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <Toaster />
    <App />
  </React.StrictMode>,
);
