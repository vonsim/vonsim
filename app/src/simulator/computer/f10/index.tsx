import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useKey } from "react-use";

import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { IMRAtom } from "@/simulator/computer/pic/state";

import styles from "./Button.module.css";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();
  const [state, dispatch] = useSimulator();
  const IMR = useAtomValue(IMRAtom);

  useKey("F10", ev => {
    ev.preventDefault();
    dispatch("f10.press");
  });

  const disabled = state.type !== "running" || IMR.bit(0);

  return (
    <div
      className={clsx(
        "absolute z-10 flex h-min w-48 flex-col rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <button
        className={styles.pushable}
        disabled={disabled}
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
