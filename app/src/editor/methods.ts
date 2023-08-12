import { Compartment, EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

export const readOnly = new Compartment();

export function setReadOnly(value: boolean) {
  if (!window.codemirror) return;
  window.codemirror.dispatch({
    effects: readOnly.reconfigure(EditorState.readOnly.of(value)),
  });
}

const addLineHighlight = StateEffect.define<number | null>();

export const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(oldLines, tr) {
    let lines = oldLines.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(addLineHighlight)) {
        lines = Decoration.none;
        if (e.value !== null) {
          lines = lines.update({ add: [lineHighlightMark.range(e.value)] });
        }
      }
    }
    return lines;
  },
  provide: f => EditorView.decorations.from(f),
});

const lineHighlightMark = Decoration.line({
  class: "!bg-mantis-400/10",
});

export function highlightLine(pos: number | null) {
  if (!window.codemirror) return;

  if (pos === null) {
    window.codemirror.dispatch({ effects: addLineHighlight.of(null) });
  } else {
    const docPosition = window.codemirror.state.doc.lineAt(pos).from;
    window.codemirror.dispatch({ effects: addLineHighlight.of(docPosition) });
  }
}
