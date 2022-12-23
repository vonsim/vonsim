import CodeMirror from "@uiw/react-codemirror";
import CompileIcon from "~icons/carbon/package";
import { VonSim } from "./codemirror";

function App() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <main className="flex grow overflow-auto">
        <div className="flex w-[750px] flex-col">
          <div className="flex justify-between bg-zinc-800 px-4 text-sm text-white">
            <button className="flex items-center border-b border-gray-400 hover:border-gray-200">
              <CompileIcon /> Compilar
            </button>
            <button>
              <CompileIcon /> Compilar
            </button>
          </div>
          <CodeMirror
            value={example}
            theme="none"
            extensions={[VonSim()]}
            className="flex grow overflow-auto font-mono"
          />
        </div>
        <div className="relative grow bg-gray-200">
          <div className="rounded-lg bg-white">
            <p className="p-2 font-extrabold uppercase tracking-wider text-gray-600">Memoria</p>
          </div>

          <div className="rounded-lg bg-white">
            <p className="text-lg font-extrabold uppercase tracking-wide text-gray-400">CPU</p>
          </div>
        </div>
      </main>
      <footer className="bg-sky-500 py-1 text-center text-white">
        <p className="text-sm">
          <a>Documentación</a> &bull; <a>GitHub</a>
        </p>
        <p className="text-xs">
          Copyright &copy; 2017-presente Facultad de Informática, Universidad Nacional de La Plata.
        </p>
      </footer>
    </div>
  );
}

export default App;

const example = `                   ORG 1000h
                   nombre: DB "JuanLorenzoMartin"
                   fin_nombre: DB 00h
                   vocales: DB "AEIOUaeiou"
                   fin_vocales: DB 00h
                   cantidad_vocales: DB 0

                   ORG 3000h
                   ; CX es la referencia al primer valor
                   ; DX es la referencia al segundo valor
             SWAP: PUSH AX
                   PUSH BX
                   MOV BX, CX
                   MOV AL, [BX] ; Primer valor en AL
                   MOV BX, DX
                   MOV AH, [BX] ; Segundo valor en AH
                   MOV [BX], AL ; Primer valor --> segunda referencia
                   MOV BX, CX
                   MOV [BX], AH ; Segundo valor --> primera referencia
                   POP BX
                   POP AX
                   RET

                   ; Caracter por pila
                   ; Si es vocal, AH=FFh; de lo contrario, AH=00h
    ES_VOCAL:      PUSH BX
                   MOV BX, SP
                   ADD BX, 2 + 2
                   MOV AL, [BX] ; Caracter en AL
                   MOV BX, OFFSET vocales - 1
                   MOV AH, 00h
    ES_VOCAL_LOOP: INC BX
                   CMP BX, OFFSET fin_vocales
                   JZ ES_VOCAL_FIN
                   CMP AL, [BX]
                   JNZ ES_VOCAL_LOOP
                   MOV AH, 0FFh
    ES_VOCAL_FIN:  POP BX
                   RET
                   ; Nota sobre el INC BX:
                   ; Como no podemos usar PUSHF ni POPF porque
                   ; no están bien implementados, tenemos que
                   ; poner el INC en el inicio del loop.


                   ORG 2000h
                   MOV CX, OFFSET nombre
                   MOV DX, OFFSET fin_nombre - 1
        MAIN_LOOP: CMP DX, CX
                   JS LOOP_FIN
                   ; Contar (o no) si el valor al que
                   ; apunta en CX es vocal
                   MOV BX, CX
                   MOV AL, [BX]
                   MOV AH, 00
                   PUSH AX
                   CALL ES_VOCAL
                   CMP AH, 0
                   JZ NO_CONTAR_1
                   INC cantidad_vocales
      NO_CONTAR_1: POP AX
                   ; Si CX y DX apuntan a la misma letra, terminar
                   CMP DX, CX
                   JZ LOOP_FIN
                   ; Contar (o no) si el valor al que
                   ; apunta en DX es vocal
                   MOV BX, DX
                   MOV AL, [BX]
                   MOV AH, 0
                   PUSH AX
                   CALL ES_VOCAL
                   CMP AH, 0
                   JZ NO_CONTAR_2
                   INC cantidad_vocales
      NO_CONTAR_2: POP AX
                   ; Swapear
                   CALL SWAP
                   INC CX
                   DEC DX
                   JMP MAIN_LOOP
         LOOP_FIN: HLT`;
