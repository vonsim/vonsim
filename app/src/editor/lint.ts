import { diagnosticCount } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, Panel } from "@codemirror/view";

import { translate } from "@/lib/i18n";
import { getLanguage } from "@/lib/settings";
import { cn } from "@/lib/utils";

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
  panel.className = cn(
    "pr-6 text-right text-xs font-medium tracking-wider text-white border-none font-sans",
    errors === 0 ? "bg-sky-400" : "bg-red-500",
  );
}
