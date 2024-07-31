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
import { stopAllAnimations } from "@/computer/shared/animate";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";
import {
  DATA_ON_LOAD_VALUES,
  HANDSHAKE_CONNECTIONS,
  PIO_CONNECTIONS,
  useSettings,
} from "@/lib/settings";
import { defaultSettings } from "@/lib/settings/schema";

export const settingsOpenAtom = atom(false);

export function Settings({ className }: { className?: string }) {
  const translate = useTranslate();
  const [settings, setSettings] = useSettings();
  const { status } = useSimulation();

  return (
    <div className={clsx("overflow-auto scrollbar-stone-700", className)}>
      <h3 className="flex items-center gap-2 border-b border-stone-600 py-2 pl-4 text-xl font-semibold">
        <span className="icon-[lucide--settings] size-6" /> {translate("settings.title")}
      </h3>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--languages] size-6" />
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
                <span className="icon-[circle-flags--uk] size-4" /> English
              </span>
            </SelectItem>
            <SelectItem value="es">
              <span className="inline-flex items-center gap-2">
                <span className="icon-[circle-flags--ar] size-4" /> Español
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--pilcrow-square] size-6" />
            {translate("settings.editorFontSize.label")}
          </SettingTitle>
        </SettingInfo>

        <div className="flex items-center rounded-lg border border-stone-600 bg-stone-900">
          <button
            className="m-0.5 flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:enabled:bg-stone-800 disabled:cursor-not-allowed"
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
            className="m-0.5 flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:enabled:bg-stone-800 disabled:cursor-not-allowed"
            disabled={settings.editorFontSize >= 64}
            onClick={() =>
              setSettings(prev => ({ ...prev, editorFontSize: prev.editorFontSize + 1 }))
            }
            title={translate("settings.editorFontSize.increase")}
          >
            <span className="icon-[lucide--plus] size-4" />
          </button>
        </div>
      </Setting>

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--memory-stick] size-6" />
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

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--monitor-smartphone] size-6" />
            {translate("settings.devices.label")}
          </SettingTitle>
          <SettingSubtitle>{translate("settings.devices.description")}</SettingSubtitle>
        </SettingInfo>
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>{translate("settings.devices.keyboard-and-screen")}</SettingTitle>
        </SettingInfo>

        <Switch
          className="ml-8"
          checked={settings.devices.keyboardAndScreen}
          onCheckedChange={value =>
            setSettings(prev => ({
              ...prev,
              devices: { ...prev.devices, keyboardAndScreen: value },
            }))
          }
          disabled={status.type !== "stopped"}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>{translate("settings.devices.pic.label")}</SettingTitle>
          <SettingSubtitle>{translate("settings.devices.pic.description")}</SettingSubtitle>
        </SettingInfo>

        <Switch
          className="ml-8"
          checked={settings.devices.pic}
          onCheckedChange={value =>
            setSettings(prev => ({
              ...prev,
              devices: { ...prev.devices, pic: value },
            }))
          }
          disabled={status.type !== "stopped"}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>{translate("settings.devices.pio.label")}</SettingTitle>
        </SettingInfo>

        <Select
          value={settings.devices.pio ?? "null"}
          onValueChange={value =>
            setSettings(prev => ({
              ...prev,
              devices: {
                ...prev.devices,
                pio: value === "null" ? null : (value as any),
                handshake: prev.devices.handshake === value ? null : prev.devices.handshake,
              },
            }))
          }
          disabled={status.type !== "stopped"}
        >
          <SelectTrigger className="w-52 min-w-[theme(width.52)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PIO_CONNECTIONS.map(value => (
              <SelectItem key={value} value={value}>
                {translate(`settings.devices.pio.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>{translate("settings.devices.handshake.label")}</SettingTitle>
        </SettingInfo>

        <Select
          value={settings.devices.handshake ?? "null"}
          onValueChange={value =>
            setSettings(prev => ({
              ...prev,
              devices: {
                ...prev.devices,
                handshake: value === "null" ? null : (value as any),
                pio: prev.devices.pio === value ? null : prev.devices.pio,
              },
            }))
          }
          disabled={status.type !== "stopped"}
        >
          <SelectTrigger className="w-52 min-w-[theme(width.52)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HANDSHAKE_CONNECTIONS.map(value => (
              <SelectItem key={value} value={value}>
                {translate(`settings.devices.handshake.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Setting>

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--rotate-3d] size-6" />
            {translate("settings.animations.label")}
          </SettingTitle>
          <SettingSubtitle>{translate("settings.animations.description")}</SettingSubtitle>
        </SettingInfo>

        <Switch
          className="ml-8"
          checked={settings.animations}
          onCheckedChange={value => {
            setSettings(prev => ({ ...prev, animations: value }));
            if (value === false) stopAllAnimations();
          }}
        />
      </Setting>

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--gauge] size-6" />
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
            <span className="icon-[lucide--clock] size-6" />
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
            <span className="icon-[lucide--printer] size-6" />
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

      <hr className="border-stone-600" />

      <Setting>
        <SettingInfo>
          <SettingTitle>
            <span className="icon-[lucide--contrast] size-6" />
            {translate("settings.filters.label")}
          </SettingTitle>
          <SettingSubtitle>
            {translate("settings.filters.description")}
            <button
              className="mt-1 block text-mantis-400 transition-colors hover:text-mantis-300"
              onClick={() =>
                setSettings(prev => ({
                  ...prev,
                  filterBightness: defaultSettings.filterBightness,
                  filterContrast: defaultSettings.filterContrast,
                  filterInvert: defaultSettings.filterInvert,
                  filterSaturation: defaultSettings.filterSaturation,
                }))
              }
            >
              {translate("settings.filters.revert")}
            </button>
          </SettingSubtitle>
        </SettingInfo>

        <div className="ml-8 grid w-64 grid-cols-[min-content,auto] items-center gap-2">
          <span className="text-xs">{translate("settings.filters.brightness")}</span>
          <Slider
            value={[settings.filterBightness]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, filterBightness: value }))}
            min={0}
            max={5}
            step={0.05}
          />

          <span className="text-xs">{translate("settings.filters.contrast")}</span>
          <Slider
            value={[settings.filterContrast]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, filterContrast: value }))}
            min={0}
            max={5}
            step={0.05}
          />

          <span className="text-xs">{translate("settings.filters.invert")}</span>
          <Switch
            checked={settings.filterInvert}
            onCheckedChange={value => setSettings(prev => ({ ...prev, filterInvert: value }))}
          />

          <span className="text-xs">{translate("settings.filters.saturation")}</span>
          <Slider
            value={[settings.filterSaturation]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, filterSaturation: value }))}
            min={0}
            max={5}
            step={0.05}
          />
        </div>
      </Setting>

      <hr className="border-stone-600" />

      <div className="flex justify-end p-4">
        <button
          className="inline-flex items-center gap-1 text-sm text-red-500 transition-colors hover:text-red-400"
          onClick={() =>
            setSettings(prev => ({
              ...defaultSettings,
              // Keep language because, why would you want to reset it?
              language: prev.language,
              // Keep devices because it could break the simulation
              devices: prev.devices,
            }))
          }
        >
          <span className="icon-[lucide--trash-2] size-4" />
          {translate("settings.reset")}
        </button>
      </div>
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
