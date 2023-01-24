import { Listbox } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { Fragment } from "react";
import { shallow } from "zustand/shallow";

import { Language, LANGUAGES } from "@/config";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";

export function LangPicker() {
  const translate = useTranslate();
  const [lang, setLang] = useSettings(state => [state.language, state.setLanguage], shallow);

  return (
    <Listbox value={lang} onChange={setLang}>
      <Float as={Fragment} placement="bottom" offset={4}>
        <Listbox.Button
          className="flex h-full items-center p-3 transition hover:bg-slate-500/30"
          title={translate("language")}
        >
          <span className="icon-[carbon--translate] h-5 w-5" />
        </Listbox.Button>
        <Listbox.Options
          className="
            w-min rounded-md border border-slate-200 bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5
            focus:outline-none
          "
        >
          {LANGUAGES.map((lang, i) => (
            <Listbox.Option
              key={i}
              className="
                cursor-pointer select-none whitespace-nowrap py-2 px-4 text-left text-gray-900
                ui-selected:font-semibold ui-active:bg-sky-100 ui-active:text-sky-900
              "
              value={lang}
            >
              {LANGUAGE_TO_LABEL[lang]}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Float>
    </Listbox>
  );
}

const LANGUAGE_TO_LABEL: { [key in Language]: string } = {
  en: "🇬🇧 English",
  es: "🇦🇷 Español",
};
