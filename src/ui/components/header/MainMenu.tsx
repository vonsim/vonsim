import type { Language } from "@/config";
import { Menu } from "@/ui/components/common/Menu";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";

const languages: { [key in Language]: string } = {
  en: "🇬🇧 English",
  es: "🇦🇷 Español",
};

export function MainMenu() {
  const translate = useTranslate();
  const settings = useSettings();

  return (
    <Menu strategy="fixed" placement="bottom-end" shift={8} offset={8}>
      <Menu.Button
        className="flex h-full items-center p-3 outline-none transition hover:bg-slate-500/30 focus:bg-slate-500/30 focus:outline-none"
        title={translate("menu.label")}
      >
        <span className="icon-[carbon--menu] h-6 w-6" />
      </Menu.Button>

      <Menu.Content>
        <Menu.Title>{translate("menu.label")}</Menu.Title>

        <Menu.Separator />

        <Menu.Radio
          leading="icon-[carbon--devices]"
          value={settings.devicesConfiguration}
          onChange={settings.setDevicesConfiguration}
          options={["switches-leds", "printer-pio", "printer-handshake"]}
          getOptionLabel={option => translate(`menu.devicesConfiguration.${option}`)}
        >
          {translate("menu.devicesConfiguration.label")}
        </Menu.Radio>

        <Menu.Radio
          leading="icon-[carbon--character-whole-number]"
          value={settings.memoryRepresentation}
          onChange={settings.setMemoryRepresentation}
          options={["hex", "bin", "uint", "int", "ascii"]}
          getOptionLabel={option => translate(`menu.memoryRepresentation.${option}`)}
        >
          {translate("menu.memoryRepresentation.label")}
        </Menu.Radio>

        <Menu.Radio
          leading="icon-[carbon--data-table]"
          value={settings.memoryOnReset}
          onChange={settings.setMemoryOnReset}
          options={["keep", "empty", "random"]}
          getOptionLabel={option => translate(`menu.memoryOnReset.${option}`)}
        >
          {translate("menu.memoryOnReset.label")}
        </Menu.Radio>

        <Menu.Separator />

        <Menu.Radio
          leading="icon-[carbon--translate]"
          value={settings.language}
          onChange={settings.setLanguage}
          options={["en", "es"]}
          getOptionLabel={lang => languages[lang]}
        >
          {translate("menu.language")}
        </Menu.Radio>

        <Menu.Separator />

        <Menu.Item href="docs" external leading="icon-[carbon--document]">
          {translate("menu.documentation")}
        </Menu.Item>
        <Menu.Item
          href="https://github.com/vonsim/vonsim"
          external
          leading="icon-[carbon--logo-github]"
        >
          GitHub
        </Menu.Item>
        <Menu.Item
          href="https://github.com/vonsim/vonsim/issues/new"
          external
          leading="icon-[carbon--warning-filled]"
        >
          {translate("menu.report-issue")}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
