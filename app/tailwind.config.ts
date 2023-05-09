import { addDynamicIconSelectors } from "@iconify/tailwind";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config = {
  content: ["./index.html", "./src/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
        mono: [
          ['"Fira Code VF"', ...defaultTheme.fontFamily.mono],
          {
            fontFeatureSettings: '"cv11"',
          },
        ],
      },

      colors: {
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },

      width: {
        byte: "8ch",
      },

      transitionTimingFunction: {
        realistic: "cubic-bezier(0.3, 0.7, 0.4, 1)",
        "realistic-bounce": "cubic-bezier(0.3, 0.7, 0.4, 1.5)",
      },
    },
  },
  plugins: [
    require("@headlessui/tailwindcss"),
    addDynamicIconSelectors(),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          scrollbar: value => ({
            "&::-webkit-scrollbar": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "9999px",
              borderStyle: "solid",
              borderWidth: "4px",
              borderColor: "transparent",
              backgroundColor: value,
              backgroundClip: "content-box",
              padding: "1px",
            },
          }),
        },
        {
          type: "color",
          values: flattenColorPalette(theme("colors")),
        },
      );
    }),
  ],
} satisfies Config;

export default config;

// From https://github.com/tailwindlabs/tailwindcss/blob/master/src/util/flattenColorPalette.js
function flattenColorPalette(colors: Record<string, any>) {
  return Object.assign(
    {},
    ...Object.entries(colors ?? {}).flatMap(([color, values]) =>
      typeof values == "object"
        ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
            [color + (number === "DEFAULT" ? "" : `-${number}`)]: hex,
          }))
        : [{ [`${color}`]: values }],
    ),
  );
}
