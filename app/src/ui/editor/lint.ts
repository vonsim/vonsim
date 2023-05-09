import { diagnosticCount } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, Panel } from "@codemirror/view";

import { translate } from "@/i18n";
import { useSettings } from "@/ui/lib/settings";
import { cn } from "@/ui/lib/utils";

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

  const lang = useSettings.getState().language;
  panel.textContent = translate(lang, "ui.editor.lintSummary", errors);
  panel.className = cn(
    "pr-6 text-right text-xs font-medium tracking-wider text-white border-none font-sans",
    errors === 0 ? "bg-sky-400" : "bg-red-500",
  );
}
