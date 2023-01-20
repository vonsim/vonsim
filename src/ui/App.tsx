import clsx from "clsx";
import { useToggle } from "react-use";

import CodeIcon from "~icons/carbon/code";
import SimIcon from "~icons/carbon/screen";

import { ConfigSelector } from "./components/ConfigSelector";
import { Console } from "./components/Console";
import { CPU } from "./components/CPU";
import { Editor } from "./components/editor";
import { F10 } from "./components/F10";
import { Handshake } from "./components/Handshake";
import { Header } from "./components/Header";
import { Leds } from "./components/Leds";
import { Memory } from "./components/Memory";
import { PIC } from "./components/PIC";
import { PIO } from "./components/PIO";
import { Printer } from "./components/Printer";
import { Switches } from "./components/Switches";
import { Timer } from "./components/Timer";
import { useMobile } from "./hooks/useMobile";
import { useTranslate } from "./hooks/useTranslate";
import { useSettings } from "./settings";

export default function App() {
  const translate = useTranslate();
  const devices = useSettings(state => state.devicesConfiguration);

  const isMobile = useMobile();
  const [isEditorOpen, toggleEditor] = useToggle(true);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />

      <main className="flex grow overflow-auto">
        <Editor
          className={clsx(
            "w-full shrink-0 lg:w-[500px] xl:w-[600px] 2xl:w-[700px]",
            isMobile && !isEditorOpen ? "hidden" : "flex",
          )}
        />

        <div
          className={clsx(
            "pretty-scrollbar w-full flex-col overflow-auto bg-gray-100 px-8 pt-4 pb-16",
            isMobile && isEditorOpen ? "hidden" : "flex",
          )}
        >
          <ConfigSelector />

          <Bigdiv>{translate("computer")}</Bigdiv>

          <section className="flex flex-col gap-4 2xl:grid 2xl:grid-cols-2">
            <Memory />
            <CPU />
          </section>

          <Bigdiv>{translate("devices.internal.label")}</Bigdiv>

          <section className="flex flex-wrap items-start justify-center gap-4">
            {devices === "printer-handshake" ? <Handshake /> : <PIO />}
            <PIC />
            <Timer />
          </section>

          <Bigdiv>{translate("devices.external.label")}</Bigdiv>

          <section className="flex flex-wrap items-start justify-center gap-4">
            <Console className="w-80 grow" />
            <F10 />
            {devices === "switches-leds" ? (
              <div className="flex flex-col items-center gap-4">
                <Switches />
                <Leds />
              </div>
            ) : (
              <Printer />
            )}
          </section>
        </div>
      </main>

      <button
        className="fixed bottom-6 right-6 rounded-full bg-sky-400 p-2 text-white shadow-lg lg:hidden"
        onClick={toggleEditor}
      >
        {isEditorOpen ? <SimIcon className="h-8 w-8" /> : <CodeIcon className="h-8 w-8" />}
      </button>
    </div>
  );
}

function Bigdiv({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <hr className="mt-12 border-t-4 border-dotted border-slate-500/30" />
      <h2 className="mb-6 select-none text-3xl font-black uppercase leading-none tracking-tighter text-slate-500/30">
        {children}
      </h2>
    </>
  );
}
