import { getMetadataFromProgram } from "@vonsim/assembler";
import clsx from "clsx";
import { atom, useSetAtom } from "jotai";

import { programMetadataSchema } from "@/computer/schemas";
import { useTranslate } from "@/lib/i18n";
import { setDevices } from "@/lib/settings";

const rawExamples = import.meta.glob("./*.asm", {
  query: "?raw",
  import: "default",
  eager: true,
  base: "../../../examples/", // repository root
}) as Record<string, string>;

const examples = Object.entries(rawExamples).map(([path, source]) => {
  const metadata = getMetadataFromProgram(source);
  const result = programMetadataSchema.parse(metadata);
  return {
    ...result,
    id: path,
    name: result.name ?? path,
    source,
  };
});

export const examplesOpenAtom = atom(false);

export function Examples({ className }: { className?: string }) {
  const translate = useTranslate();
  const setExamplesOpen = useSetAtom(examplesOpenAtom);

  return (
    <div className={clsx("scrollbar-border overflow-auto", className)}>
      <h3 className="border-border flex items-center gap-2 border-b py-2 pl-4 text-xl font-semibold">
        <span className="icon-[lucide--folder-code] size-6" /> {translate("examples.title")}
      </h3>
      <ul className="flex flex-wrap justify-evenly gap-x-0.5 gap-y-4 py-4">
        {examples.map(example => (
          <li
            key={example.id}
            onClick={() => {
              if (example.devices) setDevices(example.devices);
              window.codemirror!.dispatch({
                changes: {
                  from: 0,
                  to: window.codemirror!.state.doc.length,
                  insert: example.source,
                },
              });
              setExamplesOpen(false);
            }}
            className="border-border bg-background-0 hover:bg-background-1 w-64 select-none rounded-md border p-4 transition-colors"
          >
            <p className="text-base">{example.name}</p>
            <p className="text-xs italic">
              {example.author && <span>{example.author}</span>}
              {example.author && example.date && <span> — </span>}
              {example.date && (
                <span title={example.date}>
                  {translate("examples.format-date", new Date(`${example.date}T00:00:00`))}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span
                title={translate("examples.keyboard-and-screen")}
                className={clsx(
                  "icon-[lucide--monitor-smartphone] size-5",
                  !example.devices.keyboardAndScreen && "opacity-20",
                )}
              />
              <span
                title={translate("examples.pic")}
                className={clsx(
                  "icon-[lucide--arrow-up-down] size-5",
                  !example.devices.pic && "opacity-20",
                )}
              />
              <span
                title={translate("examples.switches-and-leds")}
                className={clsx(
                  "icon-[lucide--lightbulb] size-5",
                  !(example.devices.pio === "switches-and-leds") && "opacity-20",
                )}
              />
              <span
                title={translate("examples.printer")}
                className={clsx(
                  "icon-[lucide--printer] size-5",
                  !(example.devices.pio === "printer" || example.devices.handshake === "printer") &&
                    "opacity-20",
                )}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
