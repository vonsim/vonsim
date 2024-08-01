import { useSavedProgram } from "@/editor/files";
import { useTranslate } from "@/lib/i18n";
import { useLanguage, useSettings } from "@/lib/settings";

export function Footer() {
  const lang = useLanguage();
  const translate = useTranslate();
  const issueLink = useIssueLink();

  return (
    <footer className="px-2 py-1 text-center text-xs tracking-wider text-stone-500">
      <a
        href={`/${lang}`}
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate("footer.documentation")}
      </a>
      <span className="px-2">&middot;</span>
      <a
        href="https://github.com/vonsim/vonsim"
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      <span className="px-2">&middot;</span>
      <a
        href={issueLink}
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate("footer.issue.report")}
      </a>
      <span className="px-2 max-sm:hidden">&middot;</span>
      <br className="sm:hidden" />
      <a
        href={lang === "es" ? "/es#licencia" : "/en#license"}
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; Copyright 2017-{new Date().getFullYear()} &mdash; {translate("footer.copyright")}
      </a>
    </footer>
  );
}

function useIssueLink(): string {
  const translate = useTranslate();
  const [settings] = useSettings();
  const program = useSavedProgram();

  return (
    "https://github.com/vonsim/vonsim/issues/new?body=" +
    encodeURIComponent(translate("footer.issue.body", settings, program))
  );
}
