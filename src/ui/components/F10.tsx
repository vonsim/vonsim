import { useKey } from "react-use";

import { bit } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

import styles from "./F10.module.css";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();

  const { dispatch, disabled } = useSimulator(s => ({
    disabled: bit(s.simulator.devices.pic.IMR, 0),
    dispatch: s.dispatch,
  }));

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
