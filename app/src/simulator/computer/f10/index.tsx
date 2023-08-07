import clsx from "clsx";
import { useKey } from "react-use";

import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";

import styles from "./Button.module.css";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();
  const [state, dispatch] = useSimulator();

  useKey("F10", ev => {
    ev.preventDefault();
    dispatch("f10.press");
  });

  return (
    <div
      className={clsx(
        "absolute z-10 flex h-min w-48 flex-col rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <button
        className={styles.pushable}
        disabled={state.type !== "running"}
        onClick={() => dispatch("f10.press")}
        title="F10"
      >
        <div className={styles.shadow} />
        <div className={styles.edge} />
        <span className={styles.front}>{translate("devices.external.f10.interrupt")}</span>
      </button>
    </div>
  );
}
