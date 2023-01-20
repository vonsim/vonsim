import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, Size } from "@/config";
import { renderAddress } from "@/helpers";

import type { Locale } from "..";

const bits = (size: Size) => (size === "word" ? "16 bits" : "8 bits");
const numberFormat = new Intl.NumberFormat("es", { style: "decimal" }).format;

export const es: Locale = {
  compilerErrors: {
    // prettier-ignore
    "address-has-code": address => `La dirección de memoria ${renderAddress(address)} tiene instrucciones. No se puede usar como dirección de datos.`,
    // prettier-ignore
    "address-out-of-range": address => `La dirección de memoria ${renderAddress(address)} está fuera de rango (dirección máxima de memoria: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "cannot-accept-strings": directive => `${directive} no puede aceptar cadenas de texto.`,
    "cannot-be-indirect": "Este operando no puede ser una dirección de memoria indirecta.",
    "cannot-be-unassinged": directive => `${directive} no puede estar sin asignar.`,
    "cannot-be-word": "Este operando no puede ser de 16 bits.",
    "circular-reference": "Se detectó una referencia circular.",
    "destination-cannot-be-immediate": "El destino no puede ser un valor inmediato.",
    "double-memory-access": "No se puede acceder a una memoria dos veces en la misma instrucción.",
    "empty-program": "Programa vacío. El programa debe tener, al menos, una instrucción END.",
    "equ-not-found": label => `EQU "${label}" no encontrado.`,
    "expects-ax": "Este operando debe ser AX o AL.",
    "expects-dx": "El único registro válido es DX.",
    "expects-immediate": "Este operando debe ser inmediato.",
    "expects-label": "Este operando debe ser una etiqueta.",
    "expects-no-operands": "Esta instrucción no espera ningún operando.",
    "expects-one-operand": "Esta instrucción espera un operando.",
    "expects-two-operands": "Esta instrucción espera dos operandos.",
    "expects-word-register": "Esta instrucción espera un registro de 16 bits como su operando.",
    // prettier-ignore
    "instruction-out-of-range": address => `Esta instrucción se colocaría en la dirección ${renderAddress(address)}, la cual se encuentra fuera del rango de memoria (dirección máxima de memoria: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "invalid-interrupt": interrupt => `${interrupt} no es un número de interrupción válido.`,
    "label-not-found": label => `La etiqueta "${label}" no ha sido definida.`,
    // prettier-ignore
    "label-should-be-a-number": label => `La etiqueta ${label} debería apuntar a una constante EQU o a una instrucción. Quizás quiso escribir OFFSET ${label}.`,
    // prettier-ignore
    "label-should-be-an-instruction": label => `La etiqueta ${label} debería apuntar a una instrucción.`,
    // prettier-ignore
    "label-should-be-writable": label => `La etiqueta ${label} no apunta a una dirección de memoria modificable — debería apuntar a una declaración DB o DW.`,
    // prettier-ignore
    "missing-org": "No hay ningún ORG antes de esta instrucción, por lo que no se puede determinar su ubicación en memoria.",
    "must-have-a-label": directive => `${directive} debe tener una etiqueta.`,
    "must-have-one-or-more-values": directive => `${directive} debe tener al menos un valor.`,
    "must-have-one-value": directive => `${directive} debe tener exactamente un valor.`,
    // prettier-ignore
    "occupied-address": address => `Esta instrucción sería colocada en la dirección ${renderAddress(address)}, la cual ya está ocupada.`,
    "offset-only-with-data-directive": "OFFSET solo puede ser usado con variables.",
    // prettier-ignore
    "size-mismatch": (src, out) => `La fuente (${bits(src)}) y el destino (${bits(out)}) deben ser del mismo tamaño.`,
    "unexpected-error": err => `Error inesperado: ${String(err)}`,
    // prettier-ignore
    "unknown-size": "Acceder a una dirección de memoria desconocida con un operando inmediato requiere especificar el tipo de puntero con WORD PTR o BYTE PTR antes de la dirección.",
    // prettier-ignore
    "value-out-of-range": (value, size) => `El número ${value} no puede ser representado con ${bits(size)}.`,

    lexer: {
      "invalid-binary": "Número binario inválido. Solo puede contener ceros y unos.",
      "invalid-decimal": "Número decimal inválido. Solo puede contener dígitos.",
      "only-ascii": "Solo se soportan caracteres ASCII para cadenas de texto.",
      "unexpected-character": char => `Carácter inesperado "${char}".`,
      "unterminated-string": "Cadena sin terminar.",
    },

    parser: {
      // prettier-ignore
      "ambiguous-unary": "Se detectó una expresión unaria ambigua. Use paréntesis para evitar ambigüedades.",
      "duplicated-label": label => `Etiqueta duplicada "${label}".`,
      "end-must-be-the-last-statement": "END debe ser la última instrucción.",
      "expected-address-after-org": "Se esperaba una dirección después de ORG.",
      "expected-eos": "Se esperaba que la instrucción termine.",
      "expected-identifier": got => `Se esperaba un identificador, se obtuvo ${got.type}.`,
      "expected-instruction": got => `Se esperaba una instrucción, se obtuvo ${got.type}.`,
      "expected-label-after-offset": "Se esperaba una etiqueta después de OFFSET.",
      // prettier-ignore
      "expected-instruction-after-label": got => `Se esperaba una instrucción después de la etiqueta, se obtuvo ${got.type}.`,
      // prettier-ignore
      "expected-literal-after-expression": expected => `Se esperaba "${expected}" después de la expresión.`,
      // prettier-ignore
      "expected-literal-after-literal": (expected, after) => `Se esperaba "${expected}" después de "${after}".`,
      "expected-operand": "Se esperaba un operando.",
      "expected-type": (expected, got) => `Se esperaba ${expected}, se obtuvo ${got}.`,
      "unclosed-parenthesis": "Paréntesis sin cerrar.",
    },
  },

  simulatorErrors: {
    // prettier-ignore
    "address-has-instruction": address => `La dirección de memoria ${renderAddress(address)} tiene una instrucción, y no se puede leer ni escribir.`,
    // prettier-ignore
    "address-out-of-range": address => `La dirección de memoria ${renderAddress(address)} está fuera de rango (dirección máxima de memoria: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "compile-error": "Error de compilación. Solucione los errores y vuelva a intentar.",
    // prettier-ignore
    "io-memory-not-implemented": address => `La dirección de memoria E/S ${renderAddress(address)} no está implementada.`,
    // prettier-ignore
    "no-instruction": address => `Se esperaba una instrucción en la dirección de memoria ${renderAddress(address)} pero no se encontró ninguna.`,
    "no-program": "No hay ningún programa cargado. Compilá antes de ejecutar.",
    // prettier-ignore
    "reserved-interrupt": interrupt => `La interrupción ${interrupt} está reservada y no se puede usar.`,
    "stack-overflow": "Stack overflow",
    "stack-underflow": "Stack underflow",
  },

  ui: {
    documentation: "Documentación",
    frecuency: "Frecuencia",
    hertz: (hz: number) => `${numberFormat(hz)} Hz`,
    language: "Idioma",

    cpu: {
      name: "CPU",
      "general-registers": "Registros de propósito general",
      "special-registers": "Registros especiales",
      alu: "ALU",
      memory: {
        name: "Memoria",
        "start-address": "Dirección de inicio",
        "start-address-must-be-integer": "El valor de inicio debe ser un número entero.",
        "start-address-too-big": `El valor de inicio debe ser menor o igual a ${renderAddress(
          MEMORY_SIZE,
        )}.`,
      },
    },

    devices: {
      internal: {
        label: "Dispositivos externos",
        handshake: { name: "Handshake", data: "Dato", state: "Estado" },
        pic: { name: "PIC", state: "Estado", connections: "Conexiones" },
        pio: {
          name: "PIO",
          data: "Data",
          config: "Configuration",
          port: (port: string) => `Puerto ${port}`,
        },
        timer: "Timer",
      },
      external: {
        label: "Dispositivos internos",
        console: "Consola",
        f10: { name: "F10", interrupt: "Interrumpir" },
        leds: "Leds",
        printer: { name: "Impresora", buffer: "Buffer" },
        switches: "Teclas",
      },

      ioRegister: (name: string, address: number) =>
        `Registro ${name} (${renderAddress(address, { size: "byte" })})`,
    },

    editor: {
      lintSummary: n =>
        n === 0 ? "Listo para compilar" : n === 1 ? "Hay un error" : `Hay ${n} errores`,
    },

    runner: {
      action: {
        start: "Ejecutar",
        debug: "Depurar",
        "run-until-halt": "Finalizar",
        step: "Siguiente",
        stop: "Abortar",
      },
      state: {
        running: "Ejecutando",
        paused: "Pausado",
        "waiting-for-input": "Esperando tecla",
        stopped: "Detenido",
      },
    },

    settings: {
      memoryRepresentation: {
        label: "Modo de representación",
        hex: "Hex",
        bin: "Bin",
        uint: "BSS",
        int: "Ca2",
        ascii: "Ascii",
      },
      memoryOnReset: {
        label: "Memoria al cargar",
        random: "Aleatoria",
        empty: "Vaciar",
        keep: "Mantener",
      },
      devicesConfiguration: {
        label: "Dispositivos",
        "switches-leds": "Teclas y leds",
        "printer-pio": "Impresora con PIO",
        "printer-handshake": "Impresora con Handshake",
      },
    },
  },
};
