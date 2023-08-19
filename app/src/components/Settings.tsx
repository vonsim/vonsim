import clsx from "clsx";
import { atom } from "jotai";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";
import { DATA_ON_LOAD_VALUES, DEVICES, useSettings } from "@/lib/settings";

export const settingsOpenAtom = atom(false);

export function Settings({ className }: { className?: string }) {
  const translate = useTranslate();
  const [settings, setSettings] = useSettings();
  const { status } = useSimulation();

  return (
    <div className={clsx("overflow-auto scrollbar-stone-700", className)}>
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
          disabled={status.type !== "stopped"}
        >
          <SelectTrigger className="w-52 min-w-[theme(width.52)]">
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
            <span className="icon-[lucide--rotate-3d] h-6 w-6" />
            {translate("settings.animations.label")}
          </SettingTitle>
          <SettingSubtitle>{translate("settings.animations.description")}</SettingSubtitle>
        </SettingInfo>

        <Switch
          className="ml-8"
          checked={settings.animations}
          onCheckedChange={value => setSettings(prev => ({ ...prev, animations: value }))}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--gauge] h-6 w-6" />
            {translate("settings.speeds.executionUnit")}
          </SettingTitle>
        </SettingInfo>

        <Slider
          className="w-44"
          {...logSlider({
            value: settings.executionUnit,
            onValueChange: (value: number) =>
              setSettings(prev => ({ ...prev, executionUnit: value })),
            min: 500,
            max: 1,
          })}
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
          {...logSlider({
            value: settings.clockSpeed,
            onValueChange: (value: number) => setSettings(prev => ({ ...prev, clockSpeed: value })),
            min: 3000,
            max: 100,
          })}
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
          {...logSlider({
            value: settings.printerSpeed,
            onValueChange: (value: number) =>
              setSettings(prev => ({ ...prev, printerSpeed: value })),
            min: 20000,
            max: 500,
          })}
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

function logSlider({
  value,
  onValueChange,
  min,
  max,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
}): {
  value: [number];
  onValueChange: (value: [number]) => void;
  min: number;
  max: number;
} {
  const minl = Math.log(min);
  const maxl = Math.log(max);
  const scale = (maxl - minl) / 100;

  return {
    value: [(Math.log(value) - minl) / scale],
    onValueChange: (value: [number]) => onValueChange(Math.exp(minl + scale * value[0])),
    min: 0,
    max: 100,
  };
}
