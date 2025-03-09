/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}

declare const __COMMIT_HASH__: string;
