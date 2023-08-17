import { displayCharacter } from "@vonsim/common/ascii";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { animated, getSpring } from "@/computer/shared/springs";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import styles from "./Printer.module.css";
import { bufferAtom, paperAtom } from "./state";

const bufferIterator = Array.from({ length: 5 }, (_, i) => i); // Array from 0 to 4

export function Printer({ className }: { className?: string }) {
  const translate = useTranslate();
  const { devices } = useSimulation();

  const buffer = useAtomValue(bufferAtom);
  const paper = useAtomValue(paperAtom);

  if (!devices.printer) return null;

  return (
    <div
      className={clsx(
        "absolute z-10 flex h-min w-80 flex-col rounded-lg border border-stone-600 bg-stone-900 pl-16 [&_*]:z-20",
        className,
      )}
    >
      <div className={styles.printer} title={translate("computer.printer.name")}>
        <div className={styles.shadow} />
        <div className={styles.sides} />
        <div className={styles.front}>
          <div className={styles.trailContainer}>
            <div className={styles.trail}>
              <pre className={styles.paper}>{paper}</pre>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center justify-center">
            {bufferIterator.map(i => {
              const char = buffer[i] ? displayCharacter(buffer[i].unsigned) : null;

              return (
                <span
                  key={i}
                  className={clsx(
                    "flex h-6 w-full items-center justify-center border-r border-zinc-300 text-center font-mono text-base font-medium leading-none text-white first-of-type:rounded-l-xl last-of-type:rounded-r-xl last-of-type:border-r-0",
                    char === null ? "bg-zinc-400" : "bg-mantis-500",
                  )}
                >
                  {char}
                </span>
              );
            })}
          </div>

          <div className="mx-auto mt-4 h-1 w-[70%] overflow-hidden rounded-full bg-zinc-600">
            <animated.div
              className="h-full bg-mantis-400"
              style={{
                width: getSpring("printer.printing.progress").to(t => `${t * 100}%`),
                opacity: getSpring("printer.printing.opacity"),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
