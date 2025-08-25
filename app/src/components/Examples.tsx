import { getMetadataFromProgram } from "@vonsim/assembler";
import clsx from "clsx";
import { atom, useSetAtom } from "jotai";
import z from "zod";

import { devicesSchema } from "@/computer/schemas";
import { useTranslate } from "@/lib/i18n";
import { setDevices } from "@/lib/settings";

const rawExamples = import.meta.glob("./examples/*.asm", {
  query: "?raw",
  import: "default",
  eager: true,
  base: "../../../", // repository root
}) as Record<string, string>;

const exampleSchema = z.object({
  ...devicesSchema.partial().shape,
  name: z.string(),
});
const examples = Object.entries(rawExamples).flatMap(([path, source]) => {
  const metadata = getMetadataFromProgram(source);
  const result = exampleSchema.safeParse(metadata);
  if (!result.success) return [];
  const { name, ...devices } = result.data;
  return [{ id: path, name, devices, source }];
});

export const examplesOpenAtom = atom(false);

export function Examples({ className }: { className?: string }) {
  const translate = useTranslate();
  const setExamplesOpen = useSetAtom(examplesOpenAtom);

  console.log(rawExamples);
  console.log(examples);

  return (
    <div className={clsx("scrollbar-border overflow-auto", className)}>
      <h3 className="border-border flex items-center gap-2 border-b py-2 pl-4 text-xl font-semibold">
        <span className="icon-[lucide--folder-code] size-6" /> {translate("examples.title")}
      </h3>
      <ul>
        {examples.map(example => (
          <li
            key={example.id}
            onClick={() => {
              setDevices(example.devices);
              window.codemirror!.dispatch({
                changes: {
                  from: 0,
                  to: window.codemirror!.state.doc.length,
                  insert: example.source,
                },
              });
              setExamplesOpen(false);
            }}
          >
            {example.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
