import { easings, SpringValue } from "@react-spring/web";
import type { Byte } from "@vonsim/common/byte";

import { MBRAtom } from "@/computer/cpu/state";
import { simulationAtom } from "@/computer/simulation";
import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";
import { colors } from "@/lib/tailwind";

import {
  getSpring,
  RegisterKey,
  resetAllSprings,
  SimplePathKey,
  SpringPath,
  SpringPathValue,
} from "./springs";

type SpringAnimation = {
  [K in SpringPath]: SpringPathValue<K> extends SpringValue<infer S>
    ? { key: K; from?: S; to?: S }
    : never;
}[SpringPath];

/**
 * Save all the running animations in a set to be able to cancel them.
 */
const runningAnimations = new Set<SpringAnimation["key"]>();

/**
 * The only way animate a spring.
 * This utility also handles cases of forced stop of the simulaiton.
 * NEVER START AN ANIMATION DIRECTLY, ALWAYS USE `anim`.
 *
 * @see {@link https://react-spring.dev/docs/advanced/spring-value}
 *
 * @param animations One or more animations to execute with the same configuration.
 * @param animations.key The key of the spring to animate (see {@link getSpring}).
 * @param animations.from The initial value of the spring. (optional)
 * @param animations.to The final value of the spring.
 * @param config Configuration of the animation. Can be a preset (string) or a custom configuration (object).
 * @param config.duration The duration of the animation in execution units (should be integer).
 * @param config.absoluteDuration Whether the duration is in milliseconds (true) or relative to the `executionUnit` (false, default).
 * @param config.easing The easing function to use (see {@link easings}).
 * @returns A promise that resolves when the animation is finished.
 */
export async function anim(
  animations: SpringAnimation | SpringAnimation[],
  config: {
    duration: number;
    absoluteDuration?: boolean;
    easing: Exclude<keyof typeof easings, "steps">;
  },
) {
  // Don't run if simulation is stopped
  if (store.get(simulationAtom).type !== "running") return null;

  if (!Array.isArray(animations)) animations = [animations];

  const springConfig = {
    duration: config.absoluteDuration
      ? config.duration
      : getSettings().executionUnit * config.duration,
    easing: easings[config.easing],
  };

  return await Promise.all(
    animations.map(async ({ key, from, to }) => {
      if (to === undefined && from === undefined) return null;

      const spring = getSpring(key);

      if (to === undefined) {
        // @ts-expect-error ensured by `SpringAnimation`
        return spring.set(from);
      } else {
        runningAnimations.add(key);
        // @ts-expect-error ensured by `SpringAnimation`
        const result = await getSpring(key).start({ from, to, config: springConfig });
        runningAnimations.delete(key);
        return result;
      }
    }),
  );
}

/**
 * Pause all running animations.
 */
export const pauseAllAnimations = () => runningAnimations.forEach(key => getSpring(key).pause());

/**
 * Resume all running animations.
 */
export const resumeAllAnimations = () => runningAnimations.forEach(key => getSpring(key).resume());

/**
 * Stop all running animations.
 */
export function stopAllAnimations() {
  // Stop running animations. After stopped, `getSpring(key).start()`
  // from `anim()` will resolve and the key will be removed from the set.
  runningAnimations.forEach(key => getSpring(key).stop(true));
  // Subtle delay to enusre all springs are being reset correctly
  setTimeout(() => resetAllSprings(), 10);
}

// Utilities

export async function activateRegister(key: RegisterKey, color = colors.mantis[400]) {
  // There's some kind of limitation when discriminating union types
  // See https://github.com/microsoft/TypeScript/issues/40803
  return await anim({ key: `${key}.backgroundColor`, to: color } as SpringAnimation, {
    duration: 1,
    easing: "easeOutQuart",
  });
}

export async function deactivateRegister(key: RegisterKey) {
  // There's some kind of limitation when discriminating union types
  // See https://github.com/microsoft/TypeScript/issues/40803
  return await anim({ key: `${key}.backgroundColor`, to: colors.stone[800] } as SpringAnimation, {
    duration: 1,
    easing: "easeOutQuart",
  });
}

export async function populateDataBus(data: Byte<8>) {
  await anim(
    { key: "bus.data.stroke", to: colors.mantis[400] },
    { duration: 5, easing: "easeOutSine" },
  );
  await activateRegister("cpu.MBR");
  store.set(MBRAtom, data);
  await deactivateRegister("cpu.MBR");
}

export async function turnLineOn(line: SimplePathKey, duration: number) {
  return await anim(
    [
      { key: `${line}.strokeDashoffset`, from: 1, to: 0 },
      { key: `${line}.opacity`, from: 1 },
    ],
    { duration, easing: "easeInOutSine" },
  );
}

export async function turnLineOff(line: SimplePathKey) {
  return await anim({ key: `${line}.opacity`, to: 0 }, { duration: 1, easing: "easeInSine" });
}
