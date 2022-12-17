import { useState } from "react";
import { Scanner } from "./compiler/lexer/scanner";
import { Parser } from "./compiler/parser/parser";

function App() {
  const [source, setSource] = useState("");
  const [lexed, setLexed] = useState("");
  const [parsed, setParsed] = useState("");

  return (
    <div className="p-4">
      <h1 className="text-center text-4xl font-bold">VonSim</h1>

      <div className="flex gap-4">
        <div>
          <textarea
            className="w-full rounded border p-1 focus:outline-none"
            cols={50}
            rows={20}
            value={source}
            onChange={e => setSource(e.currentTarget.value)}
          />

          <br />

          <button
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={() => {
              try {
                const scanner = new Scanner(source);
                const lexed = scanner.scanTokens();
                setLexed(JSON.stringify(lexed, null, 2));
                try {
                  const parser = new Parser(lexed);
                  const parsed = parser.parseTokens();
                  setParsed(JSON.stringify(parsed, null, 2));
                } catch (error) {
                  setParsed(String(error));
                  console.error(error);
                }
              } catch (error) {
                setLexed(String(error));
                setParsed("");
                console.error(error);
              }
            }}
          >
            Run
          </button>
        </div>

        <pre className="grow rounded bg-gray-200 p-4">{lexed}</pre>
        <pre className="grow rounded bg-gray-200 p-4">{parsed}</pre>
      </div>
    </div>
  );
}

export default App;
