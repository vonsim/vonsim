import { Controls } from "./controls";
import { Editor } from "./editor";
import { Environment } from "./environment";

function App() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Controls />

      <main className="flex grow overflow-auto">
        <Editor />
        <Environment />
      </main>
      <footer className="h-1 w-screen bg-sky-400" />
    </div>
  );
}

export default App;
