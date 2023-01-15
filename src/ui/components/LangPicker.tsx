import { Listbox } from "@headlessui/react";

import { Language, LANGUAGES } from "@/config";
import { useSimulator } from "@/simulator";
import LangIcon from "~icons/carbon/translate";

export function LangPicker() {
  const language = useSimulator(state => state.language);
  const setLanguage = useSimulator(state => state.setLanguage);

  return (
    <Listbox value={language} onChange={setLanguage}>
      <div className="relative h-full">
        <Listbox.Button
          className="flex h-full items-center p-2 transition hover:bg-slate-500/30"
          title="Idioma"
        >
          <LangIcon className="h-5 w-5" />
        </Listbox.Button>
        <Listbox.Options className="absolute right-0 max-h-60 w-min overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {LANGUAGES.map((lang, i) => (
            <Listbox.Option
              key={i}
              className="cursor-pointer select-none whitespace-nowrap py-1 px-2 text-left text-gray-900 ui-selected:font-semibold ui-active:bg-sky-100 ui-active:text-sky-900"
              value={lang}
            >
              {LANGUAGE_TO_LABEL[lang]}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const LANGUAGE_TO_LABEL: { [key in Language]: string } = {
  en: "🇬🇧 English",
  es: "🇪🇸 Español",
};
