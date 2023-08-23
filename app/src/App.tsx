import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useAtom } from "jotai";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useMedia } from "react-use";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Settings, settingsOpenAtom } from "@/components/Settings";
import { ToastAction } from "@/components/ui/Toast";
import { ComputerContainer } from "@/computer";
import { Editor } from "@/editor";
import { useTranslate } from "@/lib/i18n";
import { useLanguage } from "@/lib/settings";
import { toast } from "@/lib/toast";

export default function App() {
  const lang = useLanguage();
  const translate = useTranslate();
  const isMobile = useMedia("(max-width: 640px)"); // tailwind sm breakpoint

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      toast({
        title: translate("update.update-available"),
        action: (
          <ToastAction
            altText={translate("update.reload")}
            onClick={() => updateServiceWorker(true)}
          >
            {translate("update.reload")}
          </ToastAction>
        ),
        duration: Infinity,
      });
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col bg-stone-900 text-white" lang={lang}>
      <Header />

      {isMobile ? <MobileLayout /> : <DesktopLayout />}

      <Footer />
    </div>
  );
}

function DesktopLayout() {
  const [settingsOpen] = useAtom(settingsOpenAtom);

  return (
    <PanelGroup
      autoSaveId="layout"
      direction="horizontal"
      units="pixels"
      tagName="main"
      className="overflow-auto px-2"
    >
      <Panel
        id="panel-editor"
        order={1}
        minSize={250}
        tagName="section"
        className="rounded-lg border border-stone-600 bg-stone-800"
      >
        <Editor className="h-full w-full" />
      </Panel>
      <PanelResizeHandle className="w-2" />
      <Panel
        id="panel-computer"
        order={2}
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
            minSize={450}
            tagName="section"
            className="rounded-lg border border-stone-600 bg-stone-800"
          >
            <Settings className="h-full w-full" />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}

function MobileLayout() {
  const translate = useTranslate();

  const [selectedTab, setSelectedTab] = useState<"editor" | "computer">("editor");
  const [settingsOpen, setSettingsOpen] = useAtom(settingsOpenAtom);

  const tab = settingsOpen ? "settings" : selectedTab;
  const setTab = (tab: string) => {
    if (settingsOpen) setSettingsOpen(false);
    setSelectedTab(tab as typeof selectedTab);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} asChild>
      <>
        <TabsContent value="editor" asChild>
          <section className="mx-2 grow overflow-hidden rounded-lg border border-stone-600 bg-stone-800 data-[state=inactive]:hidden">
            <Editor className="h-full w-full" />
          </section>
        </TabsContent>
        <TabsContent value="computer" asChild>
          <section className="computer-background mx-2 grow overflow-hidden rounded-lg border border-stone-600 bg-stone-800 data-[state=inactive]:hidden">
            <ComputerContainer />
          </section>
        </TabsContent>
        <TabsContent value="settings" asChild>
          <section className="mx-2 grow overflow-hidden rounded-lg border border-stone-600 bg-stone-800 data-[state=inactive]:hidden">
            <Settings className="h-full w-full" />
          </section>
        </TabsContent>

        <TabsList className="grid grid-cols-2 gap-2 p-2">
          <TabsTrigger
            value="editor"
            className="inline-flex items-center justify-center rounded-lg py-2 text-sm font-semibold text-stone-400 transition-colors hover:bg-stone-800 hover:text-white data-[state=active]:bg-stone-700 data-[state=active]:text-white"
          >
            <span className="icon-[lucide--file-terminal] mr-2 h-4 w-4" />
            {translate("control.tabs.editor")}
          </TabsTrigger>
          <TabsTrigger
            value="computer"
            className="inline-flex items-center justify-center rounded-lg py-2 text-sm font-semibold text-stone-400 transition-colors hover:bg-stone-800 hover:text-white data-[state=active]:bg-stone-700 data-[state=active]:text-white"
          >
            <span className="icon-[lucide--computer] mr-2 h-4 w-4" />
            {translate("control.tabs.computer")}
          </TabsTrigger>
        </TabsList>
      </>
    </Tabs>
  );
}
