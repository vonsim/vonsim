import { atom } from "jotai";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { useSettings } from "@/hooks/useSettings";
import { useTranslate } from "@/hooks/useTranslate";
import { DATA_ON_LOAD_VALUES, DEVICES } from "@/lib/settings";

export const settingsOpenAtom = atom(false);

export function Settings({ className }: { className?: string }) {
  const translate = useTranslate();
  const [settings, setSettings] = useSettings();

  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 border-b border-stone-600 py-2 pl-4 text-xl font-semibold">
        <span className="icon-[lucide--settings] h-6 w-6" /> {translate("settings.title")}
      </h3>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--languages] h-6 w-6" />
            {translate("settings.language.label")}
          </SettingTitle>
        </SettingInfo>

        <Select
          value={settings.language}
          onValueChange={value => setSettings(prev => ({ ...prev, language: value as any }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">
              <span className="inline-flex items-center gap-2">
                <span className="icon-[circle-flags--uk] h-4 w-4" /> English
              </span>
            </SelectItem>
            <SelectItem value="es">
              <span className="inline-flex items-center gap-2">
                <span className="icon-[circle-flags--ar] h-4 w-4" /> Español
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Setting>

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--memory-stick] h-6 w-6" />
            {translate("settings.dataOnLoad.label")}
          </SettingTitle>
          <SettingSubtitle>{translate("settings.dataOnLoad.description")}</SettingSubtitle>
        </SettingInfo>

        <Select
          value={settings.dataOnLoad}
          onValueChange={value => setSettings(prev => ({ ...prev, dataOnLoad: value as any }))}
        >
          <SelectTrigger className="w-32 min-w-[theme(width.32)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA_ON_LOAD_VALUES.map(value => (
              <SelectItem key={value} value={value}>
                {translate(`settings.dataOnLoad.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--monitor-smartphone] h-6 w-6" />
            {translate("settings.devices.label")}
          </SettingTitle>
          <SettingSubtitle>{translate("settings.devices.description")}</SettingSubtitle>
        </SettingInfo>

        <Select
          value={settings.devices}
          onValueChange={value => setSettings(prev => ({ ...prev, devices: value as any }))}
        >
          <SelectTrigger className="w-48 min-w-[theme(width.48)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEVICES.map(value => (
              <SelectItem key={value} value={value}>
                {translate(`settings.devices.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Setting>

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--gauge] h-6 w-6" />
            {translate("settings.speeds.executionUnit")}
          </SettingTitle>
        </SettingInfo>

        <Slider
          className="w-44"
          value={[500 - settings.executionUnit]}
          onValueChange={value => setSettings(prev => ({ ...prev, executionUnit: 500 - value[0] }))}
          min={0} // min executionUnit == 500 --> min = 500 - 500 = 0
          max={495} // max executionUnit == 5 --> min = 500 - 5 = 495
          step={1}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--clock] h-6 w-6" />
            {translate("settings.speeds.clockSpeed")}
          </SettingTitle>
        </SettingInfo>

        <Slider
          className="w-44"
          value={[1000 - settings.clockSpeed]}
          onValueChange={value => setSettings(prev => ({ ...prev, clockSpeed: 1000 - value[0] }))}
          min={0} // min clockSpeed == 1000 --> min = 1000 - 1000 = 0
          max={990} // max clockSpeed == 10 --> min = 1000 - 10 = 990
          step={10}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--printer] h-6 w-6" />
            {translate("settings.speeds.printerSpeed")}
          </SettingTitle>
        </SettingInfo>

        <Slider
          className="w-44"
          value={[1000 - settings.printerSpeed]}
          onValueChange={value => setSettings(prev => ({ ...prev, printerSpeed: 1000 - value[0] }))}
          min={0} // min printerSpeed == 1000 --> min = 1000 - 1000 = 0
          max={990} // max printerSpeed == 10 --> min = 1000 - 10 = 990
          step={10}
        />
      </Setting>
    </div>
  );
}

function Setting({ children }: { children?: React.ReactNode }) {
  return <div className="m-4 flex items-center justify-between gap-4">{children}</div>;
}

function SettingInfo({ children }: { children?: React.ReactNode }) {
  return <div className="grow">{children}</div>;
}

function SettingTitle({ children }: { children?: React.ReactNode }) {
  return <p className="flex items-center gap-2 font-medium">{children}</p>;
}

function SettingSubtitle({ children }: { children?: React.ReactNode }) {
  return <p className="mt-1 text-xs text-stone-400">{children}</p>;
}
