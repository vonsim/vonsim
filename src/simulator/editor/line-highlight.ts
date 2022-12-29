import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const addLineHighlight = StateEffect.define<number>();

export const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(oldLines, tr) {
    let lines = oldLines.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(addLineHighlight)) {
        lines = Decoration.none;
        lines = lines.update({ add: [lineHighlightMark.range(e.value)] });
      }
    }
    return lines;
  },
  provide: f => EditorView.decorations.from(f),
});

const lineHighlightMark = Decoration.line({
  class: "!bg-sky-400/30",
});

export function highlightLine(pos: number) {
  if (!window.codemirror) return;
  const docPosition = window.codemirror.state.doc.lineAt(pos).from;
  window.codemirror.dispatch({ effects: addLineHighlight.of(docPosition) });
}
