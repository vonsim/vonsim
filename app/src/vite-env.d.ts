/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}
