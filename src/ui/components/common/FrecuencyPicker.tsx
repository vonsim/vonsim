import { useId } from "react";

import { Menu } from "@/ui/components/common/Menu";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function FrecuencyPicker({
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

  const stopped = useSimulator(s => s.state.type === "stopped");

  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {translate("frecuency")}
      </label>
      <Menu placement="right-start" offset={4}>
        <Menu.Button
          className="
            rounded-lg border border-sky-400 px-2 py-1 text-sm transition
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 
            active:hover:bg-sky-400 active:hover:text-white
          "
          disabled={!stopped}
        >
          {translate("hertz", value)}
        </Menu.Button>

        <Menu.Content>
          <Menu.Title>{translate("frecuency")}</Menu.Title>
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
