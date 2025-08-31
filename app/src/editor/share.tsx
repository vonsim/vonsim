/**
 * @fileoverview
 * Manages sharing and loading shared VonSim programs.
 * - Share ids are 10-character alphanumeric strings passed as the "s" URL parameter.
 * - Programs are cached in sessionStorage to avoid redundant network requests.
 * - When a shared program is loaded, a prompt is shown to the user to confirm replacing their current program.
 * - The share button generates a shareable link and allows copying it to the clipboard.
 */
import { Dialog } from "@base-ui-components/react/dialog";
import clsx from "clsx";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { getProgram, setProgram } from "@/editor/contents";
import { highlightVonSim } from "@/editor/vonsim";
import { useTranslate } from "@/lib/i18n";
import { toast } from "@/lib/toast";

async function loadSharedProgram(shareId: string) {
  const cached = sessionStorage.getItem(shareId);
  if (cached) return cached;

  try {
    const response = await fetch(`https://vonsim.up.railway.app/api/share?id=${shareId}`);
    const data = (await response.json()) as { found: boolean; program: string };
    if (data.found) {
      sessionStorage.setItem(shareId, data.program);
      return data.program;
    }
  } catch (error) {
    console.error(error);
    toast({ title: "Error getting the shared program", variant: "error" });
  }
}

export function SharePrompt() {
  const translate = useTranslate();
  const [result, setResult] = useState<{ source: string; highlighted: string } | null>(null);
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    const shareId = new URL(window.location.href).searchParams.get("s") ?? "";
    if (!/^\w{10}$/.test(shareId)) return;

    loadSharedProgram(shareId).then(result => {
      if (typeof result === "string" && result.length > 0) {
        setResult({
          source: result,
          highlighted: highlightVonSim(result),
        });
        if (result === getProgram()?.trim()) setPrompted(true);
      }
    });
  }, []);

  if (result && !prompted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="@container bg-background-0 border-border w-full max-w-96 rounded-md border px-8 py-4 shadow-lg">
          <p className="text-balance text-center text-base font-semibold">
            {translate("share.prompt.title")}
          </p>
          <p className="text-balance text-center text-xs">
            {translate("share.prompt.description")}
          </p>
          <div className="bg-background-1 border-border relative my-4 max-h-60 w-full overflow-clip rounded-md border">
            <pre
              className="h-full overflow-clip p-1 text-xs"
              dangerouslySetInnerHTML={{ __html: result.highlighted }}
            />
            {(result.source.match(/\n/g) || "").length >= 15 && (
              <div className="from-background-0/0 to-background-0/100 pointer-events-none absolute inset-0 bg-gradient-to-b from-80%" />
            )}
          </div>
          <div className="@max-[200px]:grid-cols-1 @max-[200px]:gap-2 @max-[200px]:px-2 grid grid-cols-2 gap-4 px-4">
            <button
              className="bg-background-2 rounded-md px-2 py-1 text-sm font-semibold transition-opacity hover:opacity-80"
              onClick={() => setPrompted(true)}
            >
              {translate("share.prompt.cancel")}
            </button>
            <button
              className="bg-primary-0 rounded-md px-2 py-1 text-sm font-semibold transition-opacity hover:opacity-80"
              onClick={() => {
                setProgram({ source: result.source, devices: "infer" });
                setPrompted(true);
              }}
            >
              {translate("share.prompt.open")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

async function shareProgram() {
  const program = getProgram()!.trim();
  for (let i = 0; i < sessionStorage.length; i++) {
    const id = sessionStorage.key(i);
    if (id && sessionStorage.getItem(id) === program) return id;
  }

  try {
    const response = await fetch("https://vonsim.up.railway.app/api/share", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: getProgram()!.trim(),
    });
    const data = (await response.json()) as any;
    if (data.success === false) toast({ title: data.error, variant: "error" });
    if (data.success === true) return data.id as string;
  } catch (error) {
    console.error(error);
    toast({ title: "Error getting the shared program", variant: "error" });
  }
}

export function ShareButton() {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={open => {
        if (open) {
          setLoading(true);
          setOpen(true);
          shareProgram().then(id => {
            setLoading(false);
            if (id) setShareLink(`${window.location.origin}?s=${id}`);
          });
        } else {
          if (loading) return;
          setOpen(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          title={translate("share.button.label")}
          className="hover:text-foreground flex items-center transition-colors"
        >
          <span className="icon-[lucide--share-2] size-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="border-border bg-background-0 w-48! relative flex h-8 items-center overflow-clip rounded-lg border"
        onMouseLeave={() => setCopyConfirmed(false)}
      >
        {loading ? (
          <span className="icon-[lucide--loader-circle] mx-auto size-4 animate-spin" />
        ) : (
          <>
            <p className="overflow-clip text-nowrap px-2 text-sm leading-none">{shareLink}</p>
            <div className="from-background-0/0 to-background-0/100 pointer-events-none absolute inset-0 flex items-center justify-end bg-gradient-to-r from-30% to-75%">
              <Dialog.Root>
                <Dialog.Trigger
                  className="pointer-events-auto flex px-1 outline-none"
                  title={translate("share.button.qr")}
                >
                  <span className="icon-[lucide--qr-code] size-4" />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="z-100 bg-foreground fixed inset-0 opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                  <Dialog.Popup className="z-100 fixed inset-8 transition-all duration-150 data-[ending-style]:scale-90 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
                    <div className="bg-background-0 text-foreground flex max-h-full max-w-full flex-col rounded-lg p-6">
                      <div className="flex justify-between gap-4">
                        <p className="text-left text-lg">{shareLink}</p>
                        <Dialog.Close className="outline-none">
                          <span className="icon-[lucide--x] size-6" />
                        </Dialog.Close>
                      </div>
                      <QRCodeSVG
                        value={shareLink}
                        className="border-border size-full rounded-lg border bg-white p-4"
                      />
                    </div>
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
              <button
                title={
                  copyConfirmed ? translate("share.button.copied") : translate("share.button.copy")
                }
                className="pointer-events-auto mr-1 flex px-1 outline-none"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  setCopyConfirmed(true);
                }}
              >
                <span
                  className={clsx(
                    "size-4",
                    copyConfirmed ? "icon-[lucide--check]" : "icon-[lucide--clipboard]",
                  )}
                />
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
