/// <reference types="@total-typescript/ts-reset" />
/// <reference types="vite/client" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}
