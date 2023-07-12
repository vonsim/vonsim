import { useKey } from "react-use";

import { Card } from "@/components/common/Card";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { useAtomValue } from "@/lib/jotai";
import { IMRAtom } from "@/simulator/components/pic";

import styles from "./F10.module.css";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();
  const [, dispatch] = useSimulator();
  const IMR = useAtomValue(IMRAtom);

  const disabled = IMR.bit(0);

  useKey("F10", ev => {
    ev.preventDefault();
    dispatch("f10.press");
  });

  return (
    <Card title={translate("devices.external.f10.name")} className={className}>
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
    </Card>
  );
}
