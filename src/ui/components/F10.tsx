import { useKey } from "react-use";

import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function F10() {
  const press = useSimulator(state => state.devices.f10.press);

  useKey("F10", ev => {
    ev.preventDefault();
    press();
  });

  return (
    <Card title="F10">
      <button
        className="flex h-full items-center justify-center rounded-lg border border-sky-400 p-2 transition hover:bg-sky-400 hover:text-white"
        onClick={press}
      >
        Interrumpir
      </button>
    </Card>
  );
}
