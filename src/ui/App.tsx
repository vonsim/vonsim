import { useToggle } from "react-use";

import { Console } from "./components/Console";
import { CPU } from "./components/CPU";
import { F10 } from "./components/F10";
import { Handshake } from "./components/Handshake";
import { Header } from "./components/header";
import { Memory } from "./components/Memory";
import { PIC } from "./components/PIC";
import { PIO } from "./components/PIO";
import { Printer } from "./components/Printer";
import { SwitchesAndLeds } from "./components/SwitchesAndLeds";
import { Timer } from "./components/Timer";
import { Editor } from "./editor";
import { useMobile } from "./hooks/useMobile";
import { useTranslate } from "./hooks/useTranslate";
import { cn } from "./lib/utils";

export default function App() {
  const translate = useTranslate();

  const isMobile = useMobile();
  const [isEditorOpen, toggleEditor] = useToggle(true);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />

      <main className="flex grow overflow-auto">
        <Editor
          className={cn(
            "w-full shrink-0 lg:w-[500px] xl:w-[600px] 2xl:w-[700px]",
            isMobile && !isEditorOpen ? "hidden" : "flex",
          )}
        />

        <div
          className={cn(
            "w-full flex-col gap-16 overflow-auto bg-gray-100 p-8 scrollbar-gray-300",
            isMobile && isEditorOpen ? "hidden" : "flex",
          )}
        >
          <Section
            title={translate("computer")}
            accent="[--color-accent:220_38_38]" // theme(colors.red.600)
            className="flex flex-col gap-4 2xl:grid 2xl:grid-cols-2"
          >
            <CPU />
            <Memory />
          </Section>

          <Section
            title={translate("devices.internal.label")}
            accent="[--color-accent:37_99_235]" // theme(colors.blue.600)
            className="flex flex-wrap items-start justify-center gap-4"
          >
            <Handshake />
            <PIO />
            <PIC />
            <Timer />
          </Section>

          <Section
            title={translate("devices.external.label")}
            accent="[--color-accent:21_128_61]" // theme(colors.green.700)
            className="flex flex-wrap items-start justify-center gap-4"
          >
            <Console className="w-80 grow" />
            <F10 />
            <SwitchesAndLeds />
            <Printer />
          </Section>
        </div>
      </main>

      <button
        className="fixed bottom-6 right-6 rounded-full bg-sky-400 p-2 text-white shadow-lg lg:hidden"
        onClick={toggleEditor}
      >
        <span
          className={cn(
            "block h-8 w-8",
            isEditorOpen ? "icon-[carbon--screen]" : "icon-[carbon--code]",
          )}
        />
      </button>
    </div>
  );
}

function Section({
  title,
  accent,
  className,
  children,
}: {
  title: string;
  accent: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={accent}>
      <hr className="border-t-4 border-dotted border-accent/50" />
      <h2 className="mb-6 select-none text-3xl font-black uppercase leading-none tracking-tighter text-accent/50">
        {title}
      </h2>

      <div className={className}>{children}</div>
    </section>
  );
}
