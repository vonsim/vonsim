import { IOAddress, IOAddressLike, MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import type { BaseLocale } from "@vonsim/common/i18n";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();
const numberFormat = new Intl.NumberFormat("en", { style: "decimal" }).format;

export const english = {
  clean: "Clean",
  computer: "Computer",
  frequency: "Frequency",
  hertz: (hz: number) => `${numberFormat(hz)} Hz`,
  update: {
    "update-available": "There's a new version available!",
    reload: "Update",
  },

  messages: {
    "assemble-error": "Assemble error. Fix the errors and try again.",
    "invalid-action": "Invalid action.",
  },

  cpu: {
    name: "CPU",
    "general-registers": "General-purpose registers",
    "special-registers": "Special registers",
    register: (register: string) => `${register} register`,
    alu: "ALU",
    memory: {
      name: "Memory",
      cell: (address: MemoryAddressLike) => `Cell ${MemoryAddress.format(address)}`,
      "start-address": "Start address",
      "start-address-must-be-integer": "Start address must be an integer.",
      "start-address-too-big": `Start address must be less or equal to ${maxAddress}.`,
    },
    interrups: {
      label: "Interrupts",
      enabled: "Enabled",
      disabled: "Disabled",
    },
  },

  devices: {
    internal: {
      label: "Internal devices",
      handshake: { name: "Handshake", data: "Data", state: "State" },
      pic: { name: "PIC", state: "State", connections: "Connections" },
      pio: {
        name: "PIO",
        data: "Data",
        config: "Configuration",
        port: (port: string) => `Port ${port}`,
      },
      timer: "Timer",
    },
    external: {
      label: "External devices",
      console: "Console",
      f10: { name: "F10", interrupt: "Interrupt" },
      leds: "LEDs",
      printer: { name: "Printer", buffer: "Buffer" },
      switches: "Switches",
    },

    ioRegister: (name: string, address: IOAddressLike) =>
      `${name} register (${IOAddress.format(address)})`,
  },

  editor: {
    lintSummary: (n: number) =>
      n === 0 ? "Listo para compilar" : n === 1 ? "Hay un error" : `Hay ${n} errores`,
  },

  runner: {
    action: {
      start: "Start",
      debug: "Debug",
      "run-until-halt": "Finish",
      step: "Next",
      stop: "Abort",
    },
    state: {
      running: "Running",
      paused: "Paused",
      "waiting-for-input": "Wating for key",
      stopped: "Stopped",
    },
  },

  settings: {
    title: "Settings",

    language: {
      label: "Language",
    },

    dataOnLoad: {
      label: "Data on load",
      description: "What to do with the memory when loading a new program.",

      randomize: "Randomize",
      clean: "Empty",
      unchanged: "Unchanged",
    },

    devices: {
      label: "Devices",
      description: "Which preset of devices to use.",

      "pio-switches-and-leds": "Switches and LEDs",
      "pio-printer": "Printer (PIO)",
      handshake: "Printer (Handshake)",
    },

    speeds: {
      label: "Speeds",

      executionUnit: "Simulation speed",
      clockSpeed: "Clock speed",
      printerSpeed: "Printer speed",
    },
  },

  footer: {
    documentation: "Documentation",
    "report-issue": "Report an issue",
    copyright: "III-LIDI, FI, UNLP",
  },
} satisfies BaseLocale;
