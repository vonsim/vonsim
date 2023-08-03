import { useId } from "react";

import { Menu } from "@/components/common/Menu";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";

export function FrequencyPicker({
  value,
  onChange,
  options,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  className?: string;
}) {
  const id = useId();
  const translate = useTranslate();

  const [status] = useSimulator();
  const stopped = status.type === "stopped";

  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {translate("frequency")}
      </label>
      <Menu placement="right-start" flip offset={4}>
        <Menu.Button
          className="
            cursor-pointer rounded-lg border border-accent px-2 py-1 text-sm transition
            focus:outline-none focus-visible:ring-2 focus-visible:ring-accent 
            enabled:hover:bg-accent enabled:hover:text-white
            disabled:cursor-default disabled:border-accent/50
          "
          disabled={!stopped}
        >
          {translate("hertz", value)}
        </Menu.Button>

        <Menu.Content>
          <Menu.Title>{translate("frequency")}</Menu.Title>
          <Menu.Separator />
          {options.map((option, i) => (
            <Menu.Item
              key={i}
              leading={
                option === value
                  ? "icon-[carbon--radio-button-checked]"
                  : "icon-[carbon--radio-button]"
              }
              onClick={() => onChange(option)}
            >
              {translate("hertz", option)}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
    </div>
  );
}
