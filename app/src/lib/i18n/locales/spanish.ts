import { IOAddress, MemoryAddress } from "@vonsim/common/address";

import type { Locale } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();
const numberFormat = new Intl.NumberFormat("es", { style: "decimal" }).format;

export const spanish: Locale = {
  clean: "Limpiar",
  computer: "Computadora",
  frequency: "Frecuencia",
  hertz: hz => `${numberFormat(hz)} Hz`,
  update: {
    "update-available": "¡Hay una nueva versión disponible!",
    reload: "Actualizar",
  },

  messages: {
    "assemble-error": "Error de ensamblado. Solucione los errores y vuelva a intentar.",
  },

  cpu: {
    name: "CPU",
    "general-registers": "Registros de propósito general",
    "special-registers": "Registros especiales",
    register: register => `Registro ${register}`,
    alu: "ALU",
    memory: {
      name: "Memoria",
      cell: address => `Celda ${MemoryAddress.format(address)}`,
      "start-address": "Dirección de inicio",
      "start-address-must-be-integer": "El valor de inicio debe ser un número entero.",
      "start-address-too-big": `El valor de inicio debe ser menor o igual a ${maxAddress}.`,
    },
    interrups: {
      label: "Interrupciones",
      enabled: "Habilitadas",
      disabled: "Inhabilitadas",
    },
  },

  devices: {
    internal: {
      label: "Dispositivos internos",
      handshake: { name: "Handshake", data: "Dato", state: "Estado" },
      pic: { name: "PIC", state: "Estado", connections: "Conexiones" },
      pio: {
        name: "PIO",
        data: "Datos",
        config: "Configuración",
        port: port => `Puerto ${port}`,
      },
      timer: "Timer",
    },
    external: {
      label: "Dispositivos externos",
      console: "Consola",
      f10: { name: "F10", interrupt: "Interrumpir" },
      leds: "Leds",
      printer: { name: "Impresora", buffer: "Buffer" },
      switches: "Teclas",
    },

    ioRegister: (name, address) => `Registro ${name} (${IOAddress.format(address)})`,
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

  menu: {
    label: "Menú",
    devices: {
      label: "Dispositivos",
      "pio-switches-and-leds": "Teclas y leds",
      "pio-printer": "Impresora con PIO",
      handshake: "Impresora con Handshake",
    },
    dataRepresentation: {
      label: "Modo de representación",
      hex: "Hexadecimal",
      bin: "Binario",
      uint: "Binario sin signo (BSS)",
      int: "Complemento a 2 (Ca2)",
      ascii: "ASCII",
    },
    dataOnLoad: {
      label: "Memoria al cargar",
      randomize: "Aleatoria",
      clean: "Vaciar",
      unchanged: "Reusar",
    },
    language: "Idioma",
    documentation: "Documentación",
    "report-issue": "Reportar un error",
  },
};
