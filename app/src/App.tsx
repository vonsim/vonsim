import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Examples, examplesOpenAtom } from "@/components/Examples";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Settings, settingsOpenAtom } from "@/components/Settings";
import { ToastAction } from "@/components/ui/Toast";
import { ComputerContainer } from "@/computer";
import { resetAllSprings } from "@/computer/shared/springs";
import { Editor } from "@/editor";
import { useTranslate } from "@/lib/i18n";
import { useLanguage, useTheme } from "@/lib/settings";
import { useIsMobile } from "@/lib/tailwind";
import { toast } from "@/lib/toast";

export default function App() {
  const lang = useLanguage();
  const translate = useTranslate();
  const theme = useTheme();
  const isMobile = useIsMobile();

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

  // Update <html /> when language  changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Update <html /> when  theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Reset springs after a short delay to avoid animation glitches when switching themes
    setTimeout(() => resetAllSprings(), 10);
  }, [theme]);

  return (
    <div className="bg-background-0 text-foreground flex h-screen w-screen flex-col">
      <Header />

      {isMobile ? <MobileLayout /> : <DesktopLayout />}

      <Footer />
    </div>
  );
}

function DesktopLayout() {
  const [settingsOpen] = useAtom(settingsOpenAtom);
  const [examplesOpen] = useAtom(examplesOpenAtom);

  return (
    <PanelGroup
      autoSaveId="layout"
      direction="horizontal"
      tagName="main"
      className="overflow-auto px-2"
    >
      <Panel
        id="panel-editor"
        order={1}
        minSize={30}
        tagName="section"
        className="border-border bg-background-1 rounded-lg border"
      >
        <Editor className="size-full" />
      </Panel>
      <PanelResizeHandle className="w-2" />
      <Panel
        id="panel-computer"
        order={2}
        minSize={20}
        tagName="section"
        className={clsx(
          "border-border rounded-lg border",
          examplesOpen ? "bg-background-1" : "computer-background",
        )}
      >
        {examplesOpen ? <Examples className="size-full" /> : <ComputerContainer />}
      </Panel>
      {settingsOpen && (
        <>
          <PanelResizeHandle className="w-2" />
          <Panel
            id="panel-settings"
            order={3}
            minSize={30}
            tagName="section"
            className="border-border bg-background-1 rounded-lg border"
          >
            <Settings className="size-full" />
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
  const [examplesOpen, setExamplesOpen] = useAtom(examplesOpenAtom);

  const tab = settingsOpen ? "settings" : examplesOpen ? "examples" : selectedTab;
  const setTab = (tab: string) => {
    if (settingsOpen) setSettingsOpen(false);
    if (examplesOpen) setExamplesOpen(false);
    setSelectedTab(tab as typeof selectedTab);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} asChild>
      <div className="contents">
        <TabsContent value="editor" asChild>
          <section className="border-border bg-background-1 mx-2 grow overflow-hidden rounded-lg border data-[state=inactive]:hidden">
            <Editor className="size-full" />
          </section>
        </TabsContent>
        <TabsContent value="computer" asChild>
          <section className="computer-background border-border bg-background-1 mx-2 grow overflow-hidden rounded-lg border data-[state=inactive]:hidden">
            <ComputerContainer />
          </section>
        </TabsContent>
        <TabsContent value="settings" asChild>
          <section className="border-border bg-background-1 mx-2 grow overflow-hidden rounded-lg border data-[state=inactive]:hidden">
            <Settings className="size-full" />
          </section>
        </TabsContent>
        <TabsContent value="examples" asChild>
          <section className="border-border bg-background-1 mx-2 grow overflow-hidden rounded-lg border data-[state=inactive]:hidden">
            <Examples className="size-full" />
          </section>
        </TabsContent>

        <TabsList className="grid grid-cols-2 gap-2 p-2">
          <TabsTrigger
            value="editor"
            className="hover:bg-background-1 data-[state=active]:bg-background-2 hover:text-foreground data-[state=active]:text-foreground inline-flex items-center justify-center rounded-lg py-2 text-sm font-semibold text-stone-600 transition-colors dark:text-stone-400"
          >
            <span className="icon-[lucide--file-terminal] mr-2 size-4" />
            {translate("control.tabs.editor")}
          </TabsTrigger>
          <TabsTrigger
            value="computer"
            className="hover:bg-background-1 data-[state=active]:bg-background-2 hover:text-foreground data-[state=active]:text-foreground inline-flex items-center justify-center rounded-lg py-2 text-sm font-semibold text-stone-600 transition-colors dark:text-stone-400"
          >
            <span className="icon-[lucide--computer] mr-2 size-4" />
            {translate("control.tabs.computer")}
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
