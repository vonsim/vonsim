/**
 * @fileoverview
 *
 * Exports theme varibles used by Tailwind CSS.
 */
import Color from "colorjs.io";

const getCCSVariable = (name: string) => {
  const value = window.getComputedStyle(document.body).getPropertyValue(`--${name}`);
  return new Color(value).to("srgb").toString({ format: "hex" });
};

export const colors = {
  get foreground() {
    return getCCSVariable("color-foreground");
  },
  get background0() {
    return getCCSVariable("color-background-0");
  },
  get background1() {
    return getCCSVariable("color-background-1");
  },
  get background2() {
    return getCCSVariable("color-background-2");
  },
  get background3() {
    return getCCSVariable("color-background-3");
  },
  get primary1() {
    return getCCSVariable("color-primary-1");
  },
  get blue500() {
    return "#3b82f6";
  },
  get red500() {
    return "#ef4444";
  },
};
