import { linter } from "@codemirror/lint";
import { useCodeMirror } from "@uiw/react-codemirror";
import { useEffect, useRef, useState } from "react";
import { CompilerError } from "./compiler/common";
import { Scanner } from "./compiler/lexer/scanner";
import { Parser } from "./compiler/parser/parser";

function App() {
  const [cache, setCache] = useState("");
  const [lexed, setLexed] = useState("");
  const [parsed, setParsed] = useState("");

  const editor = useRef<HTMLDivElement | null>(null);
  const { setContainer } = useCodeMirror({
    container: editor.current,
    value: cache,
    onChange: value => setCache(value),
    width: "600px",
    height: "400px",
    extensions: [
      linter(view => {
        try {
          const source = view.state.doc.toString();
          setLexed("...");
          setParsed("...");

          const scanner = new Scanner(source);
          const lexed = scanner.scanTokens();
          setLexed(JSON.stringify(lexed, null, 2));

          const parser = new Parser(lexed);
          const parsed = parser.parseTokens();
          setParsed(JSON.stringify(parsed, null, 2));
        } catch (error) {
          console.error(error);
          if (error instanceof CompilerError) {
            return [
              {
                from: error.from,
                to: error.to,
                message: error.message,
                severity: "error",
              },
            ];
          }
        }
        return [];
      }),
    ],
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  return (
    <div className="p-4">
      <h1 className="text-center text-4xl font-bold">VonSim</h1>

      <div className="flex gap-4">
        <div ref={editor} />
        <div>
          <b>Lexer</b>
          <pre className="grow rounded bg-gray-200 p-4">{lexed}</pre>
        </div>
        <div>
          <b>Parser</b>
          <pre className="grow rounded bg-gray-200 p-4">{parsed}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
