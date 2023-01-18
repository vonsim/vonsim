import { diagnosticCount } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, Panel } from "@codemirror/view";
import clsx from "clsx";

export function lintSummaryPanel(view: EditorView): Panel {
  const dom = document.createElement("div");
  updatePanel(view.state, dom);

  return {
    dom,
    update(update) {
      updatePanel(update.view.state, dom);
    },
  };
}

function updatePanel(state: EditorState, panel: HTMLDivElement) {
  const errors = diagnosticCount(state);

  panel.textContent = `Errores: ${errors}`;
  panel.className = clsx(
    "pl-12 text-xs font-medium tracking-wider text-white border-none font-sans",
    errors === 0 ? "bg-sky-400" : "bg-red-500",
  );
}
