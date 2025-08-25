import { useKey } from "react-use";

import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import styles from "./Button.module.css";

export function F10() {
  const translate = useTranslate();
  const { status, dispatch, devices } = useSimulation();

  useKey(
    "F10",
    ev => {
      ev.preventDefault();
      if (!devices.f10) return;
      dispatch("f10.press");
    },
    undefined,
    [dispatch, devices.f10],
  );

  if (!devices.f10) return null;

  return (
    <div className="**:z-20 border-border bg-background-0 absolute left-[50px] top-[950px] z-10 flex h-min w-48 flex-col rounded-lg border">
      <button
        className={styles.pushable}
        disabled={status.type !== "running"}
        onClick={() => dispatch("f10.press")}
      >
        <div className={styles.shadow} />
        <div className={styles.edge} />
        <span className={styles.front}>{translate("computer.f10")}</span>
      </button>
    </div>
  );
}
