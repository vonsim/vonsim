import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

const STORE_KEY = "vonsim-program";

export const storePlugin = ViewPlugin.fromClass(
  class {
    timeout: number | null = null;

    constructor(readonly view: EditorView) {}

    update(update: ViewUpdate) {
      if (update.docChanged) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => {
          const source = this.view.state.doc.toString();
          localStorage.setItem(STORE_KEY, source);
          this.timeout = null;
        }, 500);
      }
    }
  },
);

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

export const initialDoc = localStorage.getItem(STORE_KEY) || initialCode;
