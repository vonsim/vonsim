import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput } from "@codemirror/language";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
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
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "react-use";

import { lineHighlightField, readOnly } from "./methods";
import { ErrorsStore, PROGRAM_BACKUP_KEY, useErrors } from "./store";
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
  const errors = useErrors();
  const prevErrors = usePrevious(errors);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const doc = localStorage.getItem(PROGRAM_BACKUP_KEY) || initialCode;

    window.codemirror = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          EditorState.tabSize.of(2),
          readOnly.of(EditorState.readOnly.of(false)),

          lineNumbers(),
          lineHighlightField,
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          highlightActiveLine(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...lintKeymap,
            {
              key: "Tab",
              preventDefault: true,
              run: view => {
                view.dispatch(
                  view.state.update(view.state.replaceSelection(" ".repeat(view.state.tabSize)), {
                    scrollIntoView: true,
                    userEvent: "input",
                  }),
                );
                return true;
              },
            },
          ]),
          VonSim(),
          lintGutter(),
        ],
      }),
      parent: element,
    });

    return () => window.codemirror?.destroy();
  }, [element]);

  return (
    <div className={clsx("flex flex-col", className)}>
      <div ref={ref} className="flex h-full overflow-auto font-mono" />
      <Transition
        className="overflow-hidden bg-red-500 px-2 py-1 text-white"
        show={errors.numberOfErrors > 0}
        enter="transition-all duration-250"
        enterFrom="h-0"
        enterTo="h-8"
        leave="transition-all duration-150"
        leaveFrom="h-8"
        leaveTo="h-0"
      >
        {/**
         * This prevErrors thing is to persist the message when the div dissapears.
         * Otherwise, it will show "0 errors" for a split second.
         */}

        {errors.numberOfErrors === 0 && prevErrors
          ? errorsToText(prevErrors)
          : errorsToText(errors)}
      </Transition>
    </div>
  );
}

function errorsToText(errors: ErrorsStore) {
  return errors.globalError
    ? errors.globalError
    : errors.numberOfErrors === 1
    ? `Hay un error. Solucionalo antes de compilar.`
    : `Hay ${errors.numberOfErrors} errores. Solucionalos antes de compilar.`;
}

const initialCode = `; ¡Bienvenido a VonSim!
; Este es un ejemplo de código que calcula los primeros
; n números de la sucesión de Fibonacci, y se guardan a
; partir de la posición 1000h de la memoria.

     n EQU 10    ; Calcula los primeros 10 números

       ORG 1000h
inicio DB 1

       ORG 2000h
       MOV BX, OFFSET inicio + 1
       MOV AL, 0
       MOV AH, inicio

BUCLE: CMP BX, OFFSET inicio + n
       JNS FIN
       MOV CL, AH
       ADD CL, AL
       MOV AL, AH
       MOV AH, CL
       MOV [BX], CL
       INC BX
       JMP BUCLE
  FIN: HLT
       END
`;
