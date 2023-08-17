import { useTranslate } from "@/lib/i18n";

export function Footer() {
  const translate = useTranslate();

  return (
    <footer className="px-2 py-1 text-center text-xs font-semibold tracking-wider text-stone-500">
      <a
        href="/docs"
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
        href="https://github.com/vonsim/vonsim/issues/new?labels=new+version"
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate("footer.report-issue")}
      </a>
      <span className="px-2 max-sm:hidden">&middot;</span>
      <br className="sm:hidden" />
      <a
        href="/docs#licencia"
        className="transition-colors hover:text-stone-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; Copyright 2017-{new Date().getFullYear()} &mdash; {translate("footer.copyright")}
      </a>
    </footer>
  );
}
