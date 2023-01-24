import type { Path, PathValue } from "@/helpers";
import { Locale, translate } from "@/i18n";
import { useSettings } from "@/ui/settings";

type UICode = Path<Locale["ui"]>;
type UIContext<Code extends UICode> = PathValue<Locale["ui"], Code> extends (
  ...context: infer A
) => string
  ? A
  : [];

export function useTranslate() {
  const lang = useSettings(state => state.language);

  const ui = <Key extends UICode>(key: Key, ...context: UIContext<Key>) =>
    translate(lang, `ui.${key}`, ...context);

  return ui;
}
