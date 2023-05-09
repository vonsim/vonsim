import { useBoolean } from "react-use";

import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

import styles from "./Console.module.css";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const { output, state, dispatch } = useSimulator(s => ({
    output: s.simulator.devices.console,
    state: s.state,
    dispatch: s.dispatch,
  }));

  const [focused, setFocused] = useBoolean(false);

  const value = output + (state.type === "waiting-for-input" && focused ? "█" : "");

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
          className="h-36 w-full resize-none overflow-y-auto bg-transparent p-1 align-bottom caret-transparent scrollbar-white focus:outline-none"
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
