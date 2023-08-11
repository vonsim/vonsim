import { useAtomValue } from "jotai";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Header } from "@/components/Header";
import { Settings, settingsOpenAtom } from "@/components/Settings";
import { ComputerContainer } from "@/computer";
import { Editor } from "@/editor";
import { useTranslate } from "@/hooks/useTranslate";

export default function App() {
  const translate = useTranslate();
  const settingsOpen = useAtomValue(settingsOpenAtom);

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      toast(translate("update.update-available"), {
        action: {
          label: translate("update.reload"),
          onClick: () => updateServiceWorker(true),
        },
      });
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col bg-stone-900 text-white">
      <Header />

      <PanelGroup
        autoSaveId="layout"
        tagName="main"
        direction="horizontal"
        className="overflow-auto px-2"
      >
        <Panel
          id="panel-editor"
          order={1}
          minSize={20}
          tagName="section"
          className="rounded-lg border border-stone-600 bg-stone-800"
        >
          <Editor className="h-full w-full" />
        </Panel>
        <PanelResizeHandle className="w-2" />
        <Panel
          id="panel-computer"
          order={2}
          minSize={20}
          tagName="section"
          className="computer-background rounded-lg border border-stone-600"
        >
          <ComputerContainer />
        </Panel>
        {settingsOpen && (
          <>
            <PanelResizeHandle className="w-2" />
            <Panel
              id="panel-settings"
              order={3}
              minSize={30}
              tagName="section"
              className="rounded-lg border border-stone-600 bg-stone-800"
            >
              <Settings className="h-full w-full" />
            </Panel>
          </>
        )}
      </PanelGroup>

      <footer className="py-1 text-center text-xs font-semibold tracking-wider text-stone-500">
        <a
          href="/docs"
          className="transition-colors hover:text-stone-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate("footer.documentation")}
        </a>
        <span className="px-2">&middot;</span>
        <a
          href="https://github.com/vonsim/vonsim"
          className="transition-colors hover:text-stone-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span className="px-2">&middot;</span>
        <a
          href="https://github.com/vonsim/vonsim/issues/new?labels=new+version"
          className="transition-colors hover:text-stone-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate("footer.report-issue")}
        </a>
        <span className="px-2">&middot;</span>
        <a
          href="/docs#licencia"
          className="transition-colors hover:text-stone-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; Copyright 2017-{new Date().getFullYear()} &mdash; {translate("footer.copyright")}
        </a>
      </footer>
    </div>
  );
}
