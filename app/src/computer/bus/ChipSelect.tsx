import { useTranslate } from "@/lib/i18n";

export function ChipSelect() {
  const translate = useTranslate();

  return (
    <div className="absolute left-[500px] top-[525px] z-10 h-[70px] w-[250px] rounded-lg border border-stone-600 bg-stone-900">
      <span className="block w-min whitespace-nowrap rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-lg font-bold text-white">
        {translate("computer.chip-select.name")}
      </span>
    </div>
  );
}
