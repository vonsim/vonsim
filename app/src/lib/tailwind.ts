/**
 * @fileoverview
 *
 * Exports theme varibles used by Tailwind CSS.
 *
 * `tailwind.config.ts` isn't used because it would increase the bundle size
 * by a lot. `babel-plugin-preval` could be used, but we are using SWC instead
 * of Babel. Until some `swc-plugin-preval` is created, this is the best solution.
 */

export const colors = {
  amber: {
    500: "#f59e0b",
  },
  mantis: {
    500: "#61a146",
  },
  sky: {
    300: "#7dd3fc",
  },
  stone: {
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
  },
};
