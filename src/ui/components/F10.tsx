import { useKey } from "react-use";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./common/Card";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();

  const press = useSimulator(state => state.devices.f10.press);

  useKey("F10", ev => {
    ev.preventDefault();
    press();
  });

  return (
    <Card title={translate("devices.external.f10.name")} className={className}>
      <button
        className="
          flex h-full items-center justify-center rounded-b-lg border border-sky-400 p-2 transition
          hover:bg-sky-400 hover:text-white
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
        "
        onClick={press}
      >
        {translate("devices.external.f10.interrupt")}
      </button>
    </Card>
  );
}
