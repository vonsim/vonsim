import {
  HighlightStyle,
  LanguageSupport,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import { Tag, tags } from "@lezer/highlight";
import { assemble, DATA_DIRECTIVES, INSTRUCTIONS, REGISTERS } from "@vonsim/assembler";

import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";

import { lintErrorsAtom } from "./StatusBar";

/**
 * This is the VonSim language definition.
 * It is used to highlight the code in the editor.
 * Also, it is used to lint the code.
 */

const vonsimTags = {
  character: tags.character,
  comment: tags.comment,
  "data-directive": Tag.define(),
  identifier: tags.variableName,
  instruction: Tag.define(),
  label: tags.labelName,
  number: tags.number,
  operator: tags.operator,
  offset: Tag.define(),
  "ptr-size": Tag.define(),
  punctuation: tags.punctuation,
  register: Tag.define(),
  special: Tag.define(),
  string: tags.string,
  unassigned: Tag.define(),
} as const;

const vonsimLanguage = StreamLanguage.define({
  name: "vonsim",
  token: (stream): keyof typeof vonsimTags | null => {
    if (stream.eatSpace()) return null;

    if (stream.match(/[01]+b\b/i)) return "number";
    if (stream.match(/\d[a-f\d]*h\b/i)) return "number";
    if (stream.match(/\d+\b/)) return "number";

    if (stream.match(/'[^'\n]'/)) {
      return "character";
    }

    if (stream.eat('"')) {
      stream.eatWhile(/[^"\n]/);
      stream.eat('"');
      return "string";
    }

    if (stream.eat(/[*+-]/)) {
      return "operator";
    }

    if (stream.eat(/[(),[\]]/)) {
      return "punctuation";
    }

    if (stream.eat("?")) {
      return "unassigned";
    }

    if (stream.eat(";")) {
      stream.skipToEnd();
      return "comment";
    }

    if (stream.eat(/[a-z_]/i)) {
      stream.eatWhile(/\w/);
      const word = stream.current().toUpperCase();
      if (word === "ORG" || word === "END") return "special";
      if (word === "OFFSET") return "offset";
      if (word === "BYTE" || word === "WORD" || word === "PTR") return "ptr-size";
      if (DATA_DIRECTIVES.includes(word)) return "data-directive";
      if (INSTRUCTIONS.includes(word)) return "instruction";
      if (REGISTERS.includes(word)) return "register";

      if (stream.eat(":")) return "label";
      return "identifier";
    }

    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: ";" },
    closeBrackets: { brackets: ["(", "[", '"'] },
  },
  tokenTable: vonsimTags,
});

const vonsimHighlighter = syntaxHighlighting(
  HighlightStyle.define([
    { tag: vonsimTags.character, class: "text-orange-600 dark:text-orange-300" },
    { tag: vonsimTags.comment, class: "text-stone-500 italic" },
    { tag: vonsimTags["data-directive"], class: "text-rose-600 dark:text-rose-400/80" },
    // { tag: vonsimTags.identifier, class: "" },
    { tag: vonsimTags.instruction, class: "text-mantis-500 dark:text-mantis-400" },
    // { tag: vonsimTags.label, class: "" },
    { tag: vonsimTags.number, class: "text-cyan-600 dark:text-cyan-300/60" },
    { tag: vonsimTags.operator, class: "text-rose-600 dark:text-rose-300" },
    { tag: vonsimTags.offset, class: "text-rose-600 dark:text-rose-400/80 italic" },
    { tag: vonsimTags["ptr-size"], class: "text-rose-600 dark:text-rose-400/80 italic" },
    { tag: vonsimTags.punctuation, class: "text-stone-500" },
    { tag: vonsimTags.register, class: "text-emerald-600 dark:text-emerald-400/80" },
    { tag: vonsimTags.special, class: "text-yellow-600 dark:text-yellow-300/80" },
    { tag: vonsimTags.string, class: "text-orange-600 dark:text-orange-300" },
    { tag: vonsimTags.unassigned, class: "text-rose-600 dark:text-rose-400/80" },
  ]),
);

const vonsimLinter = linter(
  view => {
    const source = view.state.doc.toString();
    const result = assemble(source);

    if (result.success) {
      store.set(lintErrorsAtom, 0);
      return [];
    }

    const lang = getSettings().language;
    const errors = result.errors.map<Diagnostic>(error => {
      const from = error.position?.start ?? 0;
      const to = error.position?.end ?? source.length;
      return { message: error.translate(lang), severity: "error", from, to };
    });
    store.set(lintErrorsAtom, errors.length);
    return errors;
  },
  {
    delay: 200, // gotta go fast
  },
);

export function VonSim() {
  return new LanguageSupport(vonsimLanguage, [vonsimHighlighter, vonsimLinter]);
}
