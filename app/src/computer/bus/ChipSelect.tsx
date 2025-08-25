import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

export function ChipSelect() {
  const translate = useTranslate();
  const { devices } = useSimulation();

  if (!devices.hasIOBus) return null;

  return (
    <div className="border-border bg-background-0 absolute left-[500px] top-[525px] z-10 h-[70px] w-[250px] rounded-lg border">
      <span className="bg-primary-0 border-border text-foreground block w-min whitespace-nowrap rounded-br-lg rounded-tl-lg border-b border-r px-2 py-1 text-lg">
        {translate("computer.chip-select.name")}
      </span>
    </div>
  );
}
