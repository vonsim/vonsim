import { useKey } from "react-use";
import DocumentationIcon from "~icons/carbon/document";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import CompileIcon from "~icons/carbon/workspace";

export function Controls() {
  // Save file
  useKey(
    ev => ev.key === "s" && (ev.ctrlKey || ev.metaKey),
    ev => {
      ev.preventDefault();
      if (!window.codemirror) return;

      const blob = new Blob([window.codemirror.state.doc.toString()], {
        type: "plain/text",
      });
      const href = URL.createObjectURL(blob);

      let a = document.createElement("a");
      a.style.display = "none";
      a.href = href;
      a.download =
        "Programa " +
        Intl.DateTimeFormat("es-419", {
          dateStyle: "medium",
          timeStyle: "medium",
        }).format(new Date()) +
        ".asm";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    },
  );

  return (
    <header className="flex items-center border-b border-slate-500/30 bg-slate-800 text-sm text-white">
      <div className="flex select-none items-center justify-center py-2 pl-4 pr-12">
        <Logo className="mr-2 h-8 w-8" />
        <h1 className="text-xl font-bold">
          Von<span className="text-sky-400">Sim</span>
        </h1>
      </div>

      <button className="flex h-full items-center justify-center border-b border-sky-300 p-2 transition hover:bg-slate-500/30">
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
