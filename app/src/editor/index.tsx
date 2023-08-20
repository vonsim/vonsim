import "./styles.css";

import { history, indentMore } from "@codemirror/commands";
import { EditorSelection, EditorState } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useKey } from "react-use";

import { lineHighlightField, readOnly } from "./methods";
import { StatusBar } from "./StatusBar";
import { initialDoc, storePlugin } from "./store";
import { VonSim } from "./vonsim";

/**
 * CodeMirror editor
 *
 * I've chosen to use CodeMirror because it's a very powerful editor that
 * supports mobile devices.
 *
 * I save the editor instance in the window object so I can access it from
 * anywhere in the app. I don't save it in a React state because it's a
 * very heavy object and I don't want to re-render the app every time the
 * editor changes.
 */

export function Editor({ className }: { className?: string }) {
  const [element, setElement] = useState<HTMLElement>();

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    window.codemirror = new EditorView({
      state: EditorState.create({
        doc: initialDoc,
        extensions: [
          EditorState.tabSize.of(2),
          readOnly.of(EditorState.readOnly.of(false)),

          storePlugin,

          lineNumbers(),
          lineHighlightField,
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          highlightActiveLine(),
          keymap.of([
            {
              key: "Escape",
              run: view => {
                view.dispatch({
                  selection: EditorSelection.create([view.state.selection.main], 0),
                });
                return true;
              },
            },
            {
              key: "Tab",
              run: view => {
                if (view.state.selection.ranges.some(r => !r.empty)) return indentMore(view);
                view.dispatch(
                  view.state.update(view.state.replaceSelection(" ".repeat(view.state.tabSize)), {
                    scrollIntoView: true,
                    userEvent: "input",
                  }),
                );
                return true;
              },
            },
            ...vscodeKeymap,
          ]),
          VonSim(),
        ],
      }),
      parent: element,
    });

    return () => window.codemirror?.destroy();
  }, [element]);

  useKey(
    e => e.ctrlKey && e.key === "s",
    ev => {
      ev.preventDefault();
      if (!window.codemirror) return;

      const blob = new Blob([window.codemirror.state.doc.toString()], { type: "text/plain" });
      const href = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = href;
      a.download = `vonsim-${new Date().toISOString().slice(0, 16)}.txt`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    },
  );

  return (
    <div className={clsx("flex flex-col", className)}>
      <div ref={ref} className="grow overflow-auto font-mono" />
      <StatusBar />
    </div>
  );
}
