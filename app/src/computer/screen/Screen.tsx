import { useAtomValue } from "jotai";

import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import styles from "./Screen.module.css";
import { screenAtom } from "./state";

export function Screen() {
  const translate = useTranslate();
  const { devices } = useSimulation();
  const value = useAtomValue(screenAtom);

  if (!devices.screen) return null;

  return (
    <div className="**:z-20 border-border bg-background-0 absolute left-[1200px] top-0 z-10 h-min w-[500px] rounded-lg border">
      <span className="bg-primary-0 border-border text-foreground block w-min rounded-br-lg rounded-tl-lg border-b border-r px-2 py-1 text-xl">
        {translate("computer.screen")}
      </span>

      <div className={styles.container}>
        <pre className={styles.text}>{value}</pre>
      </div>
    </div>
  );
}
