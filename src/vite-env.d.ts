/// <reference types="vite/client" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}
