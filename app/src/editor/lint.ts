import { diagnosticCount } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, Panel } from "@codemirror/view";
import clsx from "clsx";

import { translate } from "@/lib/i18n";
import { getLanguage } from "@/lib/settings";

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
  panel.textContent = translate(getLanguage(), "editor.lintSummary", errors);
  panel.className = clsx(
    "border-t border-stone-600 bg-stone-800 pr-3 text-right font-sans text-xs tracking-wider",
    errors === 0 ? "text-stone-400" : "font-semibold text-red-400",
  );
}
