import "./keyboard.css";

import type { Language } from "@vonsim/common/i18n";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import SimpleKeyboard from "react-simple-keyboard/build/index.modern";

import { useSimulation } from "@/computer/simulation";
import { useLanguage } from "@/hooks/useSettings";
import { useTranslate } from "@/lib/i18n";

const layouts = {
  en: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; ' {enter}",
    "{shiftleft} z x c v b n m , . / {shiftright}",
    "{space}",
  ],
  "en-shift": [
    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
    "{tab} Q W E R T Y U I O P { } |",
    '{lock} A S D F G H J K L : " {enter}',
    "{shiftleft} Z X C V B N M < > ? {shiftright}",
    "{space}",
  ],
  es: [
    "\u007c 1 2 3 4 5 6 7 8 9 0 ' \u00bf {bksp}",
    "{tab} q w e r t y u i o p \u0301 +",
    "{lock} a s d f g h j k l \u00f1 \u007b \u007d {enter}",
    "{shiftleft} < z x c v b n m , . - {shiftright}",
    "{space}",
  ],
  "es-shift": [
    '\u00b0 ! " # $ % & / ( ) = ? \u00a1 {bksp}',
    "{tab} Q W E R T Y U I O P \u0308 *",
    "{lock} A S D F G H J K L \u00d1 \u005b \u005d {enter}",
    "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
    "{space}",
  ],
  "es-accent": [
    "\u007c 1 2 3 4 5 6 7 8 9 0 ' \u00bf {bksp}",
    "{tab} q w é r t y ú í ó p \u0301 +",
    "{lock} á s d f g h j k l \u00f1 \u007b \u007d {enter}",
    "{shiftleft} < z x c v b n m , . - {shiftright}",
    "{space}",
  ],
  "es-accent-shift": [
    '\u00b0 ! " # $ % & / ( ) = ? \u00a1 {bksp}',
    "{tab} Q W É R T Y Ú Í Ó P \u0308 *",
    "{lock} Á S D F G H J K L \u00d1 \u005b \u005d {enter}",
    "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
    "{space}",
  ],
  "es-diaeresis-default": [
    "\u007c 1 2 3 4 5 6 7 8 9 0 ' \u00bf {bksp}",
    "{tab} q w e r t y ü i o p \u0301 +",
    "{lock} a s d f g h j k l \u00f1 \u007b \u007d {enter}",
    "{shiftleft} < z x c v b n m , . - {shiftright}",
    "{space}",
  ],
  "es-diaeresis-shift": [
    '\u00b0 ! " # $ % & / ( ) = ? \u00a1 {bksp}',
    "{tab} Q W E R T Y Ü I O P \u0308 *",
    "{lock} A S D F G H J K L \u00d1 \u005b \u005d {enter}",
    "{shiftleft} > Z X C V B N M ; : _ {shiftright}",
    "{space}",
  ],
};

const displays = {
  en: {
    "{bksp}": "Backspace ⌫",
    "{enter}": "Enter ↵",
    "{shiftleft}": "Shift ⇧",
    "{shiftright}": "Shift ⇧",
    "{tab}": "Tab ⇥",
    "{lock}": "Caps Lock ⇪",
    "{space}": "Space",
  },
  es: {
    "{bksp}": "⌫",
    "{enter}": "Intro ↵",
    "{shiftleft}": "Shift ⇧",
    "{shiftright}": "Shift ⇧",
    "{tab}": "Tab ⇥",
    "{lock}": "Bloq Mayús ⇪",
    "{space}": "Espacio",
  },
} satisfies { [key in Language]: Record<string, string> };

const accentDeadKeys = "Á É Í Ó Ú á é í ó ú \u0301";
const diaeresisDeadKeys = "Ü ü \u0308";

export function Keyboard({ className }: { className?: string }) {
  const language = useLanguage();
  const translate = useTranslate();
  const { status, dispatch } = useSimulation();

  const [shift, setShift] = useState<"none" | "once" | "lock">("none");
  const [accent, setAccent] = useState(false);
  const [diaeresis, setDiaeresis] = useState(false);

  const layout = useMemo(
    () =>
      [
        language,
        language === "es" && ((accent && "accent") || (diaeresis && "diaeresis")),
        shift !== "none" && "shift",
      ]
        .filter(Boolean)
        .join("-"),
    [language, shift, accent, diaeresis],
  );

  const handleChar = useCallback(
    (char: string) => {
      if (status.type === "running" && status.waitingForInput) {
        dispatch("keyboard.sendChar", char);
      }
    },
    [status, dispatch],
  );

  return (
    <div
      className={clsx(
        "absolute z-10 h-min w-[500px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-xl font-bold text-white">
        {translate("computer.keyboard")}
      </span>

      <SimpleKeyboard
        // eslint-disable-next-line tailwindcss/no-custom-classname
        theme={clsx(
          "hg-theme-vonsim",
          `hg-shift-${shift}`,
          accent && "hg-accentDeadKey",
          diaeresis && "hg-diaeresisDeadKey",
        )}
        layoutName={layout}
        layout={layouts}
        display={displays[language]}
        buttonTheme={[
          { class: "hg-accentDeadKeyButton", buttons: accentDeadKeys },
          { class: "hg-diaeresisDeadKeyButton", buttons: diaeresisDeadKeys },
        ]}
        disableButtonHold
        onKeyPress={button => {
          // Toggle shift
          if (button === "{shiftleft}" || button === "{shiftright}") {
            setShift(shift => (shift === "none" ? "once" : "none"));
            return;
          }

          // Toggle caps lock
          if (button === "{lock}") {
            setShift(shift => (shift === "none" ? "lock" : "none"));
            return;
          }

          if (language === "es") {
            // Handle accent dead keys
            if (accent) {
              if (accentDeadKeys.includes(button)) {
                setAccent(false);
                if (shift === "once") setShift("none");
                handleChar(button);
              }
              return;
            } else if (button === "\u0301") {
              setAccent(true);
              return;
            }

            // Handle diaeresis dead keys
            if (diaeresis) {
              if (diaeresisDeadKeys.includes(button)) {
                setDiaeresis(false);
                if (shift === "once") setShift("none");
                handleChar(button);
              }
              return;
            } else if (button === "\u0308") {
              setDiaeresis(true);
              return;
            }
          }

          // Rest of the keys

          if (shift === "once") setShift("none");

          if (button === "{bksp}") handleChar("\b");
          else if (button === "{enter}") handleChar("\n");
          else if (button === "{tab}") handleChar("\t");
          else if (button === "{space}") handleChar(" ");
          else handleChar(button);
        }}
      />
    </div>
  );
}
