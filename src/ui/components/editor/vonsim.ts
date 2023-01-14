import {
  HighlightStyle,
  LanguageSupport,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import { Tag, tags } from "@lezer/highlight";
import { isMatching } from "ts-pattern";
import { compile } from "~/compiler";
import {
  dataDirectivePattern,
  instructionPattern,
  registerPattern,
} from "~/compiler/common/patterns";
import { PROGRAM_BACKUP_KEY, useErrors } from "./store";

/**
 * This is the VonSim language definition.
 * It is used to highlight the code in the editor.
 * Also, it is used to lint the code.
 */

const vonsimTags = {
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

    if (stream.eat(/\d/)) {
      stream.eatWhile(/[a-h\d]/i);
      return "number";
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
      if (isMatching(dataDirectivePattern, word)) return "data-directive";
      if (isMatching(instructionPattern, word)) return "instruction";
      if (isMatching(registerPattern, word)) return "register";

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
    { tag: vonsimTags.comment, class: "text-slate-400" },
    { tag: vonsimTags["data-directive"], class: "text-purple-400" },
    // { tag: vonsimTags.identifier, class: "" },
    { tag: vonsimTags.instruction, class: "text-pink-400" },
    // { tag: vonsimTags.label, class: "" },
    { tag: vonsimTags.number, class: "text-sky-300" },
    { tag: vonsimTags.operator, class: "text-rose-400" },
    { tag: vonsimTags.offset, class: "text-slate-300 font-medium" },
    { tag: vonsimTags["ptr-size"], class: "text-slate-300 font-medium" },
    { tag: vonsimTags.punctuation, class: "text-slate-500" },
    { tag: vonsimTags.register, class: "text-red-300" },
    { tag: vonsimTags.special, class: "text-teal-200" },
    { tag: vonsimTags.string, class: "text-emerald-400" },
    { tag: vonsimTags.unassigned, class: "text-rose-400" },
  ]),
);

const vonsimLinter = linter(
  view => {
    const source = view.state.doc.toString();
    const result = compile(source);
    useErrors.setState(() => {
      if (result.success) {
        return { globalError: null, numberOfErrors: 0 };
      }

      const numberOfErrors = result.codeErrors.length + result.lineErrors.length;
      return {
        globalError: result.codeErrors.at(0)?.message("en") || null,
        numberOfErrors,
      };
    });

    localStorage.setItem(PROGRAM_BACKUP_KEY, source);

    if (result.success) {
      return [];
    } else {
      const diagnostics: Diagnostic[] = result.lineErrors.map(error => ({
        from: error.from,
        to: error.to,
        message: error.message("en"),
        severity: "error",
      }));

      return diagnostics;
    }
  },
  {
    delay: 200, // gotta go fast
  },
);

export function VonSim() {
  return new LanguageSupport(vonsimLanguage, [vonsimHighlighter, vonsimLinter]);
}
