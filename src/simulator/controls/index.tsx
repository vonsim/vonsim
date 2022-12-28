import clsx from "clsx";
import { toast } from "react-hot-toast";
import { useKey, useLongPress, useToggle } from "react-use";
import { compile } from "~/compiler";
import DocumentationIcon from "~icons/carbon/document";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import CompileIcon from "~icons/carbon/workspace";
import { useComputer } from "../environment/computer";

export function Controls() {
  const handleCompile = () => {
    if (!window.codemirror) return;
    const code = window.codemirror.state.doc.toString();
    const result = compile(code);

    if (!result.success) {
      toast.error("Error de compilación. Solucioná los errores y volvé a intentar");
      return;
    }

    useComputer.getState().loadProgram(result);
    toast.success("Compilación exitosa");
  };

  // Ctrl + S to compile
  useKey(
    ev => ev.key === "s" && (ev.ctrlKey || ev.metaKey),
    ev => {
      ev.preventDefault();
      handleCompile();
    },
  );

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
        <CompileIcon className="mr-2 h-5 w-5" /> Compilar
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
