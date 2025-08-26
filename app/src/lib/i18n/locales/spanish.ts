import { IOAddress, MemoryAddress } from "@vonsim/common/address";
import dedent from "dedent";

import type { Locale } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const spanish: Locale = {
  generics: {
    clean: "Limpiar",
    "io-register": (name, address) => `Registro ${name} (${IOAddress.format(address)})`,
    "byte-representation": {
      hex: "Hexadecimal",
      bin: "Binario",
      uint: "Entero sin signo",
      int: "Entero con signo",
      "safe-ascii": "ASCII",
    },
  },

  update: {
    "update-available": "¡Hay una nueva versión disponible!",
    reload: "Actualizar",
  },

  messages: {
    "assemble-error": "Error de ensamblado. Solucione los errores y vuelva a intentar.",
    "invalid-action": "Acción inválida.",
  },

  editor: {
    lintSummary: n =>
      n === 0 ? "Listo para compilar" : n === 1 ? "Hay un error" : `Hay ${n} errores`,
    files: {
      unsupported: "Tu navegador no soporta la “FileSystem API”",
      "no-file": "No hay ningún archivo abierto",
      open: "Abrir",
      unsaved: "Hay cambios sin guardar, ¿desea descartarlos?",
      "open-error": "Error al abrir el archivo",
      save: "Guardar",
      "save-as": "Guardar como",
      "save-error": "Error al guardar el archivo",
    },
    example: dedent`
      ; ¡Bienvenido a VonSim!
      ; Este es un ejemplo de código que calcula los primeros
      ; n números de la sucesión de Fibonacci, y se guardan a
      ; partir de la posición 1000h de la memoria.
      
           n  equ 10    ; Calcula los primeros 10 números
      
              org 1000h
      inicio  db 1
      
              org 2000h
              mov bx, offset inicio + 1
              mov al, 0
              mov ah, inicio
      
      bucle:  cmp bx, offset inicio + n
              jns fin
              mov cl, ah
              add cl, al
              mov al, ah
              mov ah, cl
              mov [bx], cl
              inc bx
              jmp bucle
      fin:    hlt
              end
    `,
  },

  header: {
    documentation: "Documentación",
  },

  control: {
    action: {
      "cycle-change": "Ciclo",
      "end-of-instruction": "Instrucción",
      infinity: "Final",
      stop: "Detener",
      abort: "Abortar",
    },
    tabs: {
      editor: "Editor",
      computer: "Computadora",
    },
    zoom: {
      in: "Acercar",
      out: "Alejar",
    },
  },

  computer: {
    cpu: {
      name: "CPU",
      register: register => `Registro ${register}`,
      "control-unit": "Unidad de control",
      decoder: "Decodificador",
      status: {
        fetching: "Leyendo instrucción...",
        "fetching-operands": "Leyendo operandos...",
        executing: "Ejecutando...",
        writeback: "Escribiendo resultados...",
        interrupt: "Manejando interrupción...",
        stopped: "Detenido",
        "stopped-error": "Error",
        "waiting-for-input": "Esperando tecla...",
        int6: "Ejecutando INT 6...",
        int7: "Ejecutando INT 7...",
      },
    },

    memory: {
      name: "Memoria",
      cell: address => `Celda ${MemoryAddress.format(address)}`,
      "fix-address": "Fijar dirección",
      "unfix-address": "Desfijar dirección",
      "address-must-be-integer": "El valor de inicio debe ser un número entero hexadecimal.",
      "address-out-of-range": `El valor de inicio debe ser menor o igual a ${maxAddress}.`,
      "address-increment": "Incrementar dirección (Page Up)",
      "address-decrement": "Decrementar dirección (Page Down)",
    },

    "chip-select": {
      name: "Chip select",
      mem: "mem",
      pic: "pic",
      timer: "timer",
      pio: "pio",
      handshake: "handshake",
    },

    f10: "Tecla F10",
    keyboard: "Teclado",
    leds: "Leds",
    printer: { name: "Impresora", buffer: "Buffer" },
    screen: "Pantalla",
    switches: "Llaves",

    handshake: { name: "Handshake", data: "Dato", state: "Estado" },
    pic: "PIC",
    pio: { name: "PIO", port: port => `Puerto ${port}` },
    timer: "Timer",
  },

  examples: {
    title: "Ejemplos",
  },

  settings: {
    title: "Configuración",

    language: {
      label: "Idioma",
    },

    theme: {
      label: "Tema",
      light: "Claro",
      dark: "Oscuro",
    },

    editorFontSize: {
      label: "Tamaño de fuente del editor",
      increase: "Aumentar",
      decrease: "Disminuir",
    },

    dataOnLoad: {
      label: "Memoria al cargar",
      description: "Qué hacer con la memoria al cargar un nuevo programa.",

      randomize: "Aleatoria",
      clean: "Vaciar",
      unchanged: "Reusar",
    },

    devices: {
      label: "Dispositivos",
      description: "Qué dispositivos deben estar habilitados.",

      "keyboard-and-screen": "Teclado y pantalla",
      pic: {
        label: "PIC",
        description: "También agrega un timer y la tecla F10.",
      },
      pio: {
        label: "PIO",
        "switches-and-leds": "Llaves y luces",
        printer: "Impresora",
        null: "Desconectado",
      },
      handshake: {
        label: "Handshake",
        printer: "Impresora",
        null: "Desconectado",
      },
    },

    animations: {
      label: "Animaciones",
      description: [
        "Inhabilitando las animaciones, se obtiene ejecución más rápida.",
        "Solo afecta a las animaciones afectadas por la velocidad de simulación (como la CPU).",
        "Otras animaciones (como el reloj y la impresora) se ejecutarán a su propia velocidad.",
        "¡Cuidado! Velocidades de simulación muy altas sin animaciones puede saturar el procesador.",
      ].join(" "),
    },

    speeds: {
      executionUnit: "Velocidad de simulación",
      clockSpeed: "Velocidad del reloj",
      printerSpeed: "Velocidad de impresión",
    },

    reset: "Restablecer configuración",
  },

  footer: {
    copyright: "III-LIDI, FI, UNLP",
    issue: {
      report: "Reportar un error",
      body: (settings, program) => dedent`
        <!-- Por favor, describa el problema que está teniendo en la mayor cantidad de detalle posible. -->
        <!-- Por sobre todo, agregue los pasos para reproducir el problema. -->

        <details>
          <summary>Información extra (POR FAVOR, NO BORRAR)</summary>

          **Versión**: [${__COMMIT_HASH__}](https://github.com/vonsim/vonsim/commit/${__COMMIT_HASH__})

          #### Programa

          \`\`\`asm
          ${program}
          \`\`\`

          #### Configuración

          \`\`\`json
          ${JSON.stringify(settings, null, 2)}
          \`\`\`
          
        </details>
      `,
    },
  },
};
