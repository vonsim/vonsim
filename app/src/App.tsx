import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Header } from "@/components/header";
import { Editor } from "@/editor";
import { useTranslate } from "@/hooks/useTranslate";
import { ComputerContainer } from "@/simulator/computer";

export default function App() {
  const translate = useTranslate();

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

      <main className="flex grow gap-2 overflow-auto p-2">
        <section className="w-full overflow-hidden rounded-lg border border-stone-600 bg-stone-800">
          <Editor className="h-full w-full" />
        </section>
        <section
          className="w-full rounded-lg border border-stone-600 bg-stone-800"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='rgb(120 113 108)' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <ComputerContainer />
        </section>
        {/* <Editor
          className={cn(
            "w-full shrink-0 lg:w-[500px] xl:w-[600px] 2xl:w-[700px]",
            isMobile && !isEditorOpen ? "hidden" : "flex",
          )}
        />

        <div
          className={cn(
            "w-full flex-col gap-16 overflow-auto bg-gray-100 p-8 scrollbar-gray-300",
            isMobile && isEditorOpen ? "hidden" : "flex",
          )}
        >
          <Section
            title={translate("computer")}
            accent="[--color-accent:220_38_38]" // theme(colors.red.600)
            className="flex flex-col gap-4 2xl:grid 2xl:grid-cols-2"
          >
            <CPU />
            <Memory />
          </Section>

          <Section
            title={translate("devices.internal.label")}
            accent="[--color-accent:37_99_235]" // theme(colors.blue.600)
            className="flex flex-wrap items-start justify-center gap-4"
          >
            {devices === "handshake" ? <Handshake /> : <PIO />}
            <PIC />
            <Timer />
          </Section>

          <Section
            title={translate("devices.external.label")}
            accent="[--color-accent:21_128_61]" // theme(colors.green.700)
            className="flex flex-wrap items-start justify-center gap-4"
          >
            <Console className="w-80 grow" />
            <F10 />
            {devices === "pio-switches-and-leds" ? <SwitchesAndLeds /> : <Printer />}
          </Section>
        </div> */}
      </main>
    </div>
  );
}
