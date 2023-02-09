/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}
