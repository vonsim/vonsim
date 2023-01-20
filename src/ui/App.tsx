import { ConfigSelector } from "./components/ConfigSelector";
import { Console } from "./components/Console";
import { Controls } from "./components/Controls";
import { CPU } from "./components/CPU";
import { Editor } from "./components/editor";
import { F10 } from "./components/F10";
import { Handshake } from "./components/Handshake";
import { Leds } from "./components/Leds";
import { Memory } from "./components/Memory";
import { PIC } from "./components/PIC";
import { PIO } from "./components/PIO";
import { Printer } from "./components/Printer";
import { Switches } from "./components/Switches";
import { Timer } from "./components/Timer";
import { useTranslate } from "./hooks/useTranslate";
import { useSettings } from "./settings";

export default function App() {
  const devices = useSettings(state => state.devicesConfiguration);
  const translate = useTranslate();

  return (
    <div className="flex h-screen w-screen flex-col">
      <Controls />

      <main className="flex grow overflow-auto">
        <Editor className="shrink-0 lg:w-[500px] xl:w-[600px] 2xl:w-[700px]" />

        <div className="flow flow-col w-full overflow-auto bg-gray-100 px-8 pt-4 pb-16">
          <ConfigSelector />

          <hr className="my-4 border-slate-500/30" />

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
    </div>
  );
}

function Bigdiv({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <hr className="mt-12 border-t-4 border-dotted border-slate-500/30" />
      <h2 className="mb-4 select-none text-3xl font-black uppercase tracking-tighter text-slate-500/30">
        {children}
      </h2>
    </>
  );
}
