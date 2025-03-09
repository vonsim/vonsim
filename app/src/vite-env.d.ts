/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
  stonks: {
    event(name: string, data: Record<string, string>): void;
    event(name: string, path: string, data: Record<string, string>): void;
  };
}

declare const __COMMIT_HASH__: string;
