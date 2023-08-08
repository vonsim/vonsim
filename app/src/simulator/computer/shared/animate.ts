import { ControllerUpdate, easings, SpringRef } from "@react-spring/web";
import type { Byte } from "@vonsim/common/byte";
import dlv from "dlv";
import type { ConditionalKeys } from "type-fest";

import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";
import { colors } from "@/lib/tailwind";
import { MBRAtom } from "@/simulator/computer/cpu/state";

import { animationRefs, ControlLine, RegisterRef } from "./references";

type Refs = typeof animationRefs;

type PathImpl<K extends string | number, V> = V extends SpringRef<any> ? `${K}` : `${K}.${Path<V>}`;

/**
 * Get all the paths of an object in dot notation
 * @example
 * Path<{ a: { b: { c: number } } }> = "a" | "a.b" | "a.b.c"
 */
type Path<T> = {
  [K in keyof T]: PathImpl<K & string, T[K]>;
}[keyof T];

/**
 * Given an object and a path, get the type of the value at that path
 * @see {@link Path}
 * @example
 * PathValue<{ a: { b: { c: number } } }, 'a.b.c'> = number
 * PathValue<{ a: { b: { c: number } } }, 'a.b'> = { c: number }
 */
type PathValue<T, P extends Path<T>> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : never
    : P extends keyof T
    ? T[P]
    : never
  : never;

/**
 * Save all the running animations in a set to be able to cancel them.
 */
const runningAnimations = new Set<Path<Refs>>();

/**
 * Simple utility to animate a spring.
 * @see {@link https://react-spring.dev/docs/concepts/imperative-api}
 *
 * @param key The key of the spring ref to animate (see {@link animationRefs}).
 * @param params The parameters to pass to the spring ref, the updated controller values.
 * @param config.duration The duration of the animation in execution units (should be integer).
 * @param config.easing The easing function to use (see {@link easings}).
 * @returns A promise that resolves when the animation is finished.
 */
export async function anim<
  Key extends Path<Refs>,
  State extends PathValue<Refs, Key> extends SpringRef<infer K> ? K : never,
>(
  key: Key,
  params: ControllerUpdate<State>,
  config: {
    duration: number;
    easing: Exclude<keyof typeof easings, "steps">;
  },
) {
  const ref = dlv(animationRefs, key) as SpringRef<State>;
  if (!ref) throw new Error(`No animation ref found for key ${key}`);

  // If the animation is already running, wait for it to finish
  if (runningAnimations.has(key)) {
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (!runningAnimations.has(key)) {
          clearInterval(interval);
          resolve();
        }
      }, 5);
    });
  }

  runningAnimations.add(key);

  const result = await Promise.all(
    ref.start({
      ...params,
      config: {
        duration: getSettings().executionUnit * config.duration,
        easing: easings[config.easing],
      },
    }),
  );

  runningAnimations.delete(key);
  return result;
}

/**
 * Pause all running animations.
 */
export const pauseAllAnimations = () =>
  runningAnimations.forEach(key => (dlv(animationRefs, key) as SpringRef<any>).pause());

/**
 * Resume all running animations.
 */
export const resumeAllAnimations = () =>
  runningAnimations.forEach(key => (dlv(animationRefs, key) as SpringRef<any>).resume());

/**
 * Stop all running animations.
 */
export const stopAllAnimations = () =>
  runningAnimations.forEach(key => (dlv(animationRefs, key) as SpringRef<any>).stop());

// Utilities

type KeysMap = {
  [K in Path<Refs>]: PathValue<Refs, K> extends SpringRef<infer S> ? S : never;
};

export async function activateRegister(
  key: ConditionalKeys<KeysMap, RegisterRef>,
  color = colors.mantis[400],
) {
  await anim(key, { backgroundColor: color }, { duration: 1, easing: "easeOutQuart" });
}

export async function deactivateRegister(key: ConditionalKeys<KeysMap, RegisterRef>) {
  await anim(key, { backgroundColor: colors.stone[800] }, { duration: 1, easing: "easeOutQuart" });
}

export async function populateDataBus(data: Byte<8>) {
  await anim("bus.data", { stroke: colors.mantis[400] }, { duration: 5, easing: "easeOutSine" });
  await anim(
    "cpu.MBR",
    { backgroundColor: colors.mantis[400] },
    { duration: 1, easing: "easeOutQuart" },
  );
  store.set(MBRAtom, data);
  await anim(
    "cpu.MBR",
    { backgroundColor: colors.stone[800] },
    { duration: 1, easing: "easeOutQuart" },
  );
}

export async function turnLineOn(
  line: ConditionalKeys<Refs["bus"], SpringRef<ControlLine>>,
  duration: number,
) {
  await anim(
    `bus.${line}`,
    { from: { strokeDashoffset: 1, opacity: 1 }, to: { strokeDashoffset: 0 } },
    { duration, easing: "easeInOutSine" },
  );
}

export async function turnLineOff(line: ConditionalKeys<Refs["bus"], SpringRef<ControlLine>>) {
  await anim(`bus.${line}`, { opacity: 0 }, { duration: 1, easing: "easeInSine" });
}
