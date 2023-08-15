import { IOAddress, MemoryAddress } from "@vonsim/common/address";

import type { Locale } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const spanish: Locale = {
  generics: {
    clean: "Limpiar",
    "io-register": (name, address) => `Registro ${name} (${IOAddress.format(address)})`,
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
  },

  control: {
    action: {
      start: "Ejecutar",
      stop: "Detener",
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
      },
    },

    memory: {
      name: "Memoria",
      cell: address => `Celda ${MemoryAddress.format(address)}`,
      "start-address": "Dirección de inicio",
      "start-address-must-be-integer": "El valor de inicio debe ser un número entero.",
      "start-address-too-big": `El valor de inicio debe ser menor o igual a ${maxAddress}.`,
    },

    "chip-select": {
      name: "Chip select",
      mem: "mem",
      pic: "pic",
      timer: "timer",
      pio: "pio",
      handshake: "handshake",
    },

    f10: { name: "F10", interrupt: "Interrumpir" },
    keyboard: "Teclado",
    leds: "Leds",
    printer: { name: "Impresora", buffer: "Buffer" },
    screen: "Pantalla",
    switches: "Teclas",

    handshake: { name: "Handshake", data: "Dato", state: "Estado" },
    pic: "PIC",
    pio: { name: "PIO", port: port => `Puerto ${port}` },
    timer: "Timer",
  },

  settings: {
    title: "Configuración",

    language: {
      label: "Idioma",
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
      description: "Qué conjunto de dispositivos usar.",

      "pio-switches-and-leds": "Teclas y luces",
      "pio-printer": "Impresora (PIO)",
      handshake: "Impresora (Handshake)",
    },

    speeds: {
      label: "Velocidades",

      executionUnit: "Velocidad de simulación",
      clockSpeed: "Velocidad del reloj",
      printerSpeed: "Velocidad de impresión",
    },
  },

  footer: {
    documentation: "Documentación",
    "report-issue": "Reportar un error",
    copyright: "III-LIDI, FI, UNLP",
  },
};
