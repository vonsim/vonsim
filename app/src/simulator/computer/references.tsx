import { ControllerUpdate, easings, SpringRef } from "@react-spring/web";
import dlv from "dlv";

import { getSpeeds } from "@/lib/settings";

/**
 * Spring references
 * @see {@link https://react-spring.dev/docs/advanced/spring-ref}
 */
export const animationRefs = {
  bus: {
    address: SpringRef<{ stroke: string }>(),
    data: SpringRef<{ stroke: string }>(),
  },
  cpu: {
    internalBus: {
      address: SpringRef<{ strokeDashoffset: number; opacity: number; path: string }>(),
      data: SpringRef<{ strokeDashoffset: number; opacity: number; path: string }>(),
      rd: SpringRef<{ width: number; opacity: number }>(),
      wr: SpringRef<{ width: number; opacity: number }>(),
      iom: SpringRef<{ width: number; opacity: number }>(),
    },
    alu: {
      operands: SpringRef<{ strokeDashoffset: number; opacity: number }>(),
      results: SpringRef<{ strokeDashoffset: number; opacity: number }>(),
      cog: SpringRef<{ rot: number }>(),
      operation: SpringRef<{ backgroundColor: string }>(),
    },
    decoder: {
      path: SpringRef<{ strokeDashoffset: number; opacity: number }>(),
      progress: SpringRef<{ progress: number; opacity: number }>(),
    },
    AX: SpringRef<{ backgroundColor: string }>(),
    BX: SpringRef<{ backgroundColor: string }>(),
    CX: SpringRef<{ backgroundColor: string }>(),
    DX: SpringRef<{ backgroundColor: string }>(),
    SP: SpringRef<{ backgroundColor: string }>(),
    IP: SpringRef<{ backgroundColor: string }>(),
    IR: SpringRef<{ backgroundColor: string }>(),
    ri: SpringRef<{ backgroundColor: string }>(),
    id: SpringRef<{ backgroundColor: string }>(),
    left: SpringRef<{ backgroundColor: string }>(),
    right: SpringRef<{ backgroundColor: string }>(),
    result: SpringRef<{ backgroundColor: string }>(),
    FLAGS: SpringRef<{ backgroundColor: string }>(),
    MAR: SpringRef<{ backgroundColor: string }>(),
    MBR: SpringRef<{ backgroundColor: string }>(),
  },
} as const;

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
  Key extends Path<typeof animationRefs>,
  State extends PathValue<typeof animationRefs, Key> extends SpringRef<infer K> ? K : never,
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

  return await Promise.all(
    ref.start({
      ...params,
      config: {
        duration: getSpeeds().executionUnit * config.duration,
        easing: easings[config.easing],
      },
    }),
  );
}
