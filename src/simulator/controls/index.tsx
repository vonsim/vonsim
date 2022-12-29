import clsx from "clsx";
import { toast } from "react-hot-toast";
import { useLongPress, useToggle } from "react-use";
import { compile } from "~/compiler";
import DocumentationIcon from "~icons/carbon/document";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import RunIcon from "~icons/carbon/skip-forward";
import { highlightLine, setReadOnly } from "../editor/methods";
import { useComputer } from "../environment/computer";
import { useConfig } from "../environment/config";

export function Controls() {
  const handleCompile = async () => {
    if (!window.codemirror) return;
    const code = window.codemirror.state.doc.toString();
    const result = compile(code);

    if (!result.success) {
      toast.error("Error de compilación. Solucioná los errores y volvé a intentar");
      return;
    }

    useComputer.getState().loadProgram(result);

    setReadOnly(true);

    while (true) {
      const keepRunning = useComputer.getState().runInstruction();
      await new Promise(resolve => {
        // I know it's not efficient, but it  doesn't
        // affect the performance of the app
        const ms = 1000 / useConfig.getState().clockSpeed;
        setTimeout(resolve, ms);
      });

      if (!keepRunning) break;
    }

    highlightLine(null);
    setReadOnly(false);
  };

  const [easterEgg, toggleEasterEgg] = useToggle(false);
  const easterEggEvents = useLongPress(
    () => {
      window.navigator.vibrate(100);
      toggleEasterEgg();
    },
    { isPreventDefault: true, delay: 1500 },
  );

  return (
    <header className="flex items-center border-b border-slate-500/30 bg-slate-800 text-sm text-white">
      <div className="flex select-none items-center justify-center py-2 pl-4 pr-12">
        <Logo className={clsx("mr-2 h-8 w-8", easterEgg && "animate-spin")} {...easterEggEvents} />
        <h1 className="text-xl font-bold">
          Von<span className="text-sky-400">Sim</span>
        </h1>
      </div>

      <button
        className="flex h-full items-center justify-center border-b border-sky-400 p-2 transition hover:bg-slate-500/30"
        onClick={handleCompile}
      >
        <RunIcon className="mr-2 h-5 w-5" /> Ejecutar
      </button>

      <div className="grow" />

      <a
        className="flex h-full items-center p-2 transition hover:bg-slate-500/30"
        href="/docs"
        target="_blank"
        title="Documentación"
      >
        <DocumentationIcon className="h-5 w-5" />
      </a>
      <a
        className="mr-4 flex h-full items-center p-2 transition hover:bg-slate-500/30"
        href="https://github.com/vonsim/vonsim"
        target="_blank"
        title="GitHub"
      >
        <GitHubIcon className="h-5 w-5" />
      </a>
    </header>
  );
}
