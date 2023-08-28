/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

import type { JsonPrimitive } from "type-fest";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    codemirror: import("@codemirror/view").EditorView | null;
  }

  const umami: {
    track(view_properties?: { website: string; [key: string]: JsonPrimitive }): void;
    track(event_name: string, event_data?: Record<string, JsonPrimitive>): void;
  };
}
