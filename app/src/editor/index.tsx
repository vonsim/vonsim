import "./styles.css";

import { history, indentMore } from "@codemirror/commands";
import { EditorSelection, EditorState } from "@codemirror/state";
import {
  drawSelection,
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

import { useEditorFontSize } from "@/lib/settings";

import { getSavedProgram, syncStatePlugin } from "./files";
import { lineHighlightField, readOnly } from "./methods";
import { StatusBar } from "./StatusBar";
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
  const fontSize = useEditorFontSize();

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    window.codemirror = new EditorView({
      state: EditorState.create({
        doc: getSavedProgram(),
        extensions: [
          EditorState.tabSize.of(2),
          readOnly.of(EditorState.readOnly.of(false)),

          syncStatePlugin,

          lineNumbers(),
          lineHighlightField,
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          EditorView.domEventHandlers({
            // Prevent dropping files into the editor, handled by the file handler
            drop: ev => ev.preventDefault(),
          }),
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

  return (
    <div className={clsx("flex flex-col", className)}>
      <div
        ref={ref}
        className="grow overflow-auto font-mono"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.25,
        }}
      />
      <StatusBar />
    </div>
  );
}
