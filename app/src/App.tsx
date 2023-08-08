import { useAtomValue } from "jotai";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Header } from "@/components/Header";
import { Settings, settingsOpenAtom } from "@/components/Settings";
import { Editor } from "@/editor";
import { useTranslate } from "@/hooks/useTranslate";
import { ComputerContainer } from "@/simulator/computer";

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
          className="rounded-lg border border-stone-600 bg-stone-800"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='rgb(120 113 108)' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
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
