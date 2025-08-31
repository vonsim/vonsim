import { IOAddress, IOAddressLike, MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import type { BaseLocale } from "@vonsim/common/i18n";
import dedent from "dedent";
import type { JsonValue } from "type-fest";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const english = {
  generics: {
    clean: "Clean",
    "io-register": (name: string, address: IOAddressLike) =>
      `${name} register (${IOAddress.format(address)})`,
    "byte-representation": {
      hex: "Hexadecimal",
      bin: "Binary",
      uint: "Unsigned integer",
      int: "Signed integer",
      "safe-ascii": "ASCII",
    },
  },

  update: {
    "update-available": "There's a new version available!",
    reload: "Update",
  },

  messages: {
    "assemble-error": "Assemble error. Fix the errors and try again.",
    "invalid-action": "Invalid action.",
  },

  share: {
    button: {
      label: "Share program",
      copy: "Copy to clipboard",
      copied: "Copied!",
      qr: "Show QR code",
    },
    prompt: {
      title: "Someone shared a program with you!",
      description: "Do you want to open the program? This will replace your current program.",
      open: "Open",
      cancel: "Cancel",
    },
  },

  editor: {
    lintSummary: (n: number) =>
      n === 0 ? "Ready to compile" : n === 1 ? "There's an error" : `There're ${n} errors`,
    files: {
      unsupported: "Your browser doesn't support the FileSystem API",
      "no-file": "No file open",
      open: "Open file",
      unsaved: "There are unsaved changes, do you want to discard them?",
      "open-error": "Error opening file",
      save: "Save file",
      "save-as": "Save file as",
      "save-error": "Error saving file",
    },
    example: dedent`
      ; Welcome to VonSim!
      ; This is an example program that calculates the first
      ; n numbers of the Fibonacci sequence, and stores them
      ; starting at memory position 1000h.
      
           n  equ 10    ; Calculate the first 10 numbers
      
              org 1000h
      start   db 1
      
              org 2000h
              mov bx, offset start + 1
              mov al, 0
              mov ah, start
      
      loop:   cmp bx, offset start + n
              jns finish
              mov cl, ah
              add cl, al
              mov al, ah
              mov ah, cl
              mov [bx], cl
              inc bx
              jmp loop
      finish: hlt
              end
    `,
  },

  header: {
    documentation: "Documentation",
  },

  control: {
    action: {
      "cycle-change": "Cycle",
      "end-of-instruction": "Instruction",
      infinity: "End",
      stop: "Stop",
      abort: "Abort",
    },
    tabs: {
      editor: "Editor",
      computer: "Computer",
    },
    zoom: {
      in: "Zoom in",
      out: "Zoom out",
    },
  },

  computer: {
    cpu: {
      name: "CPU",
      register: (register: string) => `${register} register`,
      "control-unit": "Control unit",
      decoder: "Decoder",
      status: {
        fetching: "Fetching instruction...",
        "fetching-operands": "Fetching operands...",
        executing: "Executing...",
        writeback: "Saving results...",
        interrupt: "Handling interrupt...",
        stopped: "Stopped",
        "stopped-error": "Error",
        "waiting-for-input": "Waiting for input...",
        int6: "Running INT 6...",
        int7: "Running INT 7...",
      },
    },

    memory: {
      name: "Memory",
      cell: (address: MemoryAddressLike) => `Cell ${MemoryAddress.format(address)}`,
      "fix-address": "Fix address",
      "unfix-address": "Unfix address",
      "address-must-be-integer": "Start address must be an hexadecimal integer.",
      "address-out-of-range": `Start address must be less or equal to ${maxAddress}.`,
      "address-increment": "Increment address (Page Up)",
      "address-decrement": "Decrement address (Page Down)",
    },

    "chip-select": {
      name: "Chip select",
      mem: "mem",
      pic: "pic",
      timer: "timer",
      pio: "pio",
      handshake: "handshake",
    },

    f10: "F10 key",
    keyboard: "Keyboard",
    leds: "LEDs",
    printer: { name: "Printer", buffer: "Buffer" },
    screen: "Screen",
    switches: "Switches",

    handshake: { name: "Handshake", data: "Data", state: "State" },
    pic: "PIC",
    pio: { name: "PIO", port: (port: string) => `Port ${port}` },
    timer: "Timer",
  },

  examples: {
    title: "Examples",
    "format-date": (date: Date) => {
      const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)); // in days
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      if (diff < 30) return rtf.format(-diff, "day");
      if (diff < 365) return rtf.format(-Math.floor(diff / 30), "month");
      return rtf.format(-Math.floor(diff / 365), "year");
    },
    "keyboard-and-screen": "Keyboard and screen",
    pic: "Interrups",
    "switches-and-leds": "Switches and LEDs",
    printer: "Printer",
  },

  settings: {
    title: "Settings",

    language: {
      label: "Language",
    },

    theme: {
      label: "Theme",
      light: "Light",
      dark: "Dark",
    },

    editorFontSize: {
      label: "Editor font size",
      increase: "Increase font size",
      decrease: "Decrease font size",
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
      description: "Which devices should be enabled.",

      "keyboard-and-screen": "Keyboard and screen",
      pic: {
        label: "PIC",
        description: "Also adds a timer and the F10 key.",
      },
      pio: {
        label: "PIO",
        "switches-and-leds": "Switches and LEDs",
        printer: "Printer",
        null: "Disconnected",
      },
      handshake: {
        label: "Handshake",
        printer: "Printer",
        null: "Disconnected",
      },
    },

    animations: {
      label: "Animations",
      description: [
        "Disabling animations, you get faster execution.",
        "Only affects animations affected by the simulation speed (like the CPU).",
        "Other animations (like the clock and the printer) will run at their own speed.",
        "Be careful! Very high simulation speeds without animations can saturate the processor.",
      ].join(" "),
    },

    speeds: {
      executionUnit: "Simulation speed",
      clockSpeed: "Clock speed",
      printerSpeed: "Printer speed",
    },

    reset: "Reset settings",
  },

  footer: {
    copyright: "III-LIDI, FI, UNLP",
    issue: {
      report: "Report an issue",
      body: (settings: JsonValue, program: string) => dedent`
        <!-- Please describe the problem you are having in as much detail as possible. -->
        <!-- Most importantly, add the steps to reproduce the problem. -->

        <details>
          <summary>Debug info (PLEASE, DO NOT DELETE)</summary>

          **Version**: [${__COMMIT_HASH__}](https://github.com/vonsim/vonsim/commit/${__COMMIT_HASH__})

          #### Program

          \`\`\`asm
          ${program}
          \`\`\`

          #### Settings

          \`\`\`json
          ${JSON.stringify(settings, null, 2)}
          \`\`\`
          
        </details>
      `,
    },
  },
} satisfies BaseLocale;
