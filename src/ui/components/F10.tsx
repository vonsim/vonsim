import { useKey } from "react-use";

import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function F10({ className }: { className?: string }) {
  const translate = useTranslate();

  const dispatch = useSimulator(s => s.dispatch);

  useKey("F10", ev => {
    ev.preventDefault();
    dispatch("f10.press");
  });

  return (
    <Card title={translate("devices.external.f10.name")} className={className}>
      <button
        className="
          flex h-full items-center justify-center rounded-b-lg border border-sky-400 p-2 transition
          hover:bg-sky-400 hover:text-white
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
        "
        onClick={() => dispatch("f10.press")}
      >
        {translate("devices.external.f10.interrupt")}
      </button>
    </Card>
  );
}
