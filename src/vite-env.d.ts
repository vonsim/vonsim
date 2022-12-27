/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/react" />

interface Window {
  codemirror: import("@codemirror/view").EditorView | null;
}
