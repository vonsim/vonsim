/// <reference types="@total-typescript/ts-reset" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}