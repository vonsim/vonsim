import { useComputer } from "../computer";
import { Card } from "./Card";

export function Console() {
  const contents = useComputer(state => state.external.console);
  const watingForInput = useComputer(state => state.runner.state === "waiting-for-input");

  return (
    <Card title="Consola" noPadding>
      <pre className="font- h-36 overflow-y-auto whitespace-pre-wrap break-all bg-gray-200 p-1 font-mono">
        {contents}
        {watingForInput && <span className="animate-pulse text-sky-400">▎</span>}
      </pre>
    </Card>
  );
}
