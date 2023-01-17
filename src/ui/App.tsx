import { ConfigSelector } from "./components/ConfigSelector";
import { Console } from "./components/Console";
import { Controls } from "./components/Controls";
import { CPU } from "./components/CPU";
import { Editor } from "./components/editor";
import { F10 } from "./components/F10";
import { Leds } from "./components/Leds";
import { Memory } from "./components/Memory";
import { PIC } from "./components/PIC";
import { PIO } from "./components/PIO";
import { Switches } from "./components/Switches";
import { Timer } from "./components/Timer";

function App() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Controls />

      <main className="flex grow overflow-auto">
        <Editor className="lg:min-w-[550px] lg:max-w-[550px] xl:min-w-[700px] xl:max-w-[700px]" />

        <div className="flow flow-col w-full overflow-auto bg-gray-100 p-8">
          <ConfigSelector />

          <hr className="my-4 border-slate-500/30" />

          <Memory />

          <div className="h-4" />

          <CPU />

          <hr className="my-8 border-t-4 border-dotted border-slate-500/30" />

          <div className="flex flex-wrap items-start justify-center gap-4">
            <PIO />
            <PIC />
            <Timer />
          </div>

          <hr className="my-8 border-t-4 border-dotted border-slate-500/30" />

          <Console />

          <div className="h-4" />

          <div className="flex flex-wrap items-start justify-center gap-4">
            <Switches />
            <Leds />
            <F10 />
          </div>
        </div>
      </main>
      <footer className="h-1 w-screen bg-sky-400" />
    </div>
  );
}

export default App;
