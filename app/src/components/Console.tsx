import { useBoolean } from "react-use";

import { Card } from "@/components/common/Card";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { useAtomValue } from "@/lib/jotai";
import { consoleAtom } from "@/simulator/components/console";

import styles from "./Console.module.css";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const [status, dispatch] = useSimulator();
  const output = useAtomValue(consoleAtom);

  const [focused, setFocused] = useBoolean(false);

  const value = output + (status.type === "waiting-for-input" && focused ? "█" : "");

  return (
    <Card
      title={translate("devices.external.console")}
      className={className}
      actions={[
        {
          title: translate("clean"),
          icon: "icon-[carbon--clean]",
          onClick: () => dispatch("console.clean"),
        },
      ]}
    >
      <div className={styles.container}>
        <textarea
          id={CONSOLE_ID}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="scrollbar-white h-36 w-full resize-none overflow-y-auto bg-transparent p-1 align-bottom caret-transparent focus:outline-none"
          value={value}
          onInput={ev => {
            ev.preventDefault();
            dispatch("console.handleKey", ev.nativeEvent as InputEvent);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </Card>
  );
}
