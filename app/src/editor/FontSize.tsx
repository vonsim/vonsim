import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { useTranslate } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export function FontSize() {
  const translate = useTranslate();
  const [settings, setSettings] = useSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title={translate("settings.editorFontSize.label")}
          className="hover:text-foreground flex items-center transition-colors"
        >
          <span className="icon-[lucide--pilcrow] size-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="border-border bg-background-0 w-22! flex items-center rounded-lg border">
        <button
          className="hover:enabled:bg-background-1 text-foreground m-0.5 flex size-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed"
          disabled={settings.editorFontSize <= 8}
          onClick={() =>
            setSettings(prev => ({ ...prev, editorFontSize: prev.editorFontSize - 1 }))
          }
          title={translate("settings.editorFontSize.decrease")}
        >
          <span className="icon-[lucide--minus] size-4" />
        </button>
        <span className="w-8 text-center text-sm font-normal">{settings.editorFontSize}</span>
        <button
          className="hover:enabled:bg-background-1 text-foreground m-0.5 flex size-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed"
          disabled={settings.editorFontSize >= 64}
          onClick={() =>
            setSettings(prev => ({ ...prev, editorFontSize: prev.editorFontSize + 1 }))
          }
          title={translate("settings.editorFontSize.increase")}
        >
          <span className="icon-[lucide--plus] size-4" />
        </button>
      </PopoverContent>
    </Popover>
  );
}
