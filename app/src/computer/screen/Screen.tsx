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
    <div className="absolute left-[1200px] top-0 z-10 h-min w-[500px] rounded-lg border border-stone-600 bg-stone-900 **:z-20">
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-xl text-white">
        {translate("computer.screen")}
      </span>

      <div className={styles.container}>
        <pre className={styles.text}>{value}</pre>
      </div>
    </div>
  );
}
