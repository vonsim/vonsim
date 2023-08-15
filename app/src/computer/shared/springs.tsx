/**
 * @fileoverview
 * Internally, all animations are handled by react-spring. This file
 * keeps track of all the `SpringValue`s used across the computer.
 * These can be accessed using the `getSpring` function.
 *
 * @see {@link https://react-spring.dev/docs/advanced/spring-value}
 */

import { SpringValue } from "@react-spring/web";
import getFromPath, { Path, PathValue } from "@vonsim/common/paths";
import type { Opaque, UnknownRecord } from "type-fest";

import { colors } from "@/lib/tailwind";

// Common sets of springs

// Register component.
export type RegisterSprings = Opaque<
  { backgroundColor: SpringValue<string>; opacity: SpringValue<number> },
  "RegisterSprings"
>;
export type RegisterKey = SpringPathWhere<RegisterSprings>;

const Register = (initialColor = colors.stone[800]) =>
  ({
    backgroundColor: new SpringValue(initialColor),
    opacity: new SpringValue(1),
  }) as RegisterSprings;

// Used for "lines/cables" that "fill" along a path
export type SimplePathSprings = Opaque<
  { strokeDashoffset: SpringValue<number>; opacity: SpringValue<number> },
  "SimplePathSprings"
>;
export type SimplePathKey = SpringPathWhere<SimplePathSprings>;

const SimplePath = () =>
  ({ strokeDashoffset: new SpringValue(1), opacity: new SpringValue(1) }) as SimplePathSprings;

/**
 * Spring values
 * @see {@link https://react-spring.dev/docs/advanced/spring-value}
 */
const springs = {
  bus: {
    address: { stroke: new SpringValue(colors.stone[700]) },
    data: { stroke: new SpringValue(colors.stone[700]) },
    rd: { stroke: new SpringValue(colors.stone[700]) },
    wr: { stroke: new SpringValue(colors.stone[700]) },
    iom: SimplePath(),
    mem: { stroke: new SpringValue(colors.red[500]) },
    pic: SimplePath(),
    pio: SimplePath(),
    timer: SimplePath(),
    intr: SimplePath(),
    inta: SimplePath(),
    int0: SimplePath(),
    int1: SimplePath(),
    int2: SimplePath(),

    // pio-switches-and-leds
    "switches->pio": SimplePath(),
    "pio->leds": SimplePath(),
  },
  clock: { angle: new SpringValue(0) },
  cpu: {
    internalBus: {
      address: {
        strokeDashoffset: new SpringValue(1),
        opacity: new SpringValue(1),
        path: new SpringValue(""),
      },
      data: {
        strokeDashoffset: new SpringValue(1),
        opacity: new SpringValue(1),
        path: new SpringValue(""),
      },
    },
    alu: {
      operands: SimplePath(),
      results: SimplePath(),
      cog: { rot: new SpringValue(0) },
      operation: { backgroundColor: new SpringValue(colors.stone[800]) },
    },
    decoder: {
      path: SimplePath(),
      progress: { progress: new SpringValue(0), opacity: new SpringValue(1) },
    },
    AX: Register(),
    BX: Register(),
    CX: Register(),
    DX: Register(),
    SP: Register(),
    IP: Register(),
    IR: Register(),
    ri: Register(),
    id: Register(),
    left: Register(),
    right: Register(),
    result: Register(),
    FLAGS: Register(),
    MAR: Register(),
    MBR: Register(),
  },
  pic: {
    IMR: Register(),
    IRR: Register(),
    ISR: Register(),
    INT0: Register(),
    INT1: Register(),
    INT2: Register(),
    INT3: Register(),
    INT4: Register(),
    INT5: Register(),
    INT6: Register(),
    INT7: Register(),
  },
  pio: {
    PA: Register(),
    PB: Register(),
    CA: Register(),
    CB: Register(),
  },
  timer: {
    CONT: Register(),
    COMP: Register(),
  },
} as const;

type Springs = typeof springs;

export type SpringPath = Path<Springs, SpringValue<any>>;
export type SpringPathValue<P extends SpringPath> = PathValue<Springs, P, SpringValue<any>>;

export type SpringPathWhere<T> = {
  [K in SpringPath]: SpringPathValue<K> extends T ? K : never;
}[SpringPath];

/**
 * Retrieve a spring by its path
 *
 * @example
 * getSpring("bus.address.stroke") // SpringValue<string>
 * getSpring("bus.address") // { stroke: SpringValue<string> }
 */
export function getSpring<const Key extends SpringPath>(key: Key) {
  return getFromPath<Springs, Key, SpringValue<any>>(springs, key);
}

// This final section programatically saves the intial
// values (once on load) of the springs and exposes a
// function `resetAllSprings` which reverts all of them
// to their initial state.

function recursiveDefaultValues(obj: UnknownRecord) {
  const ret: UnknownRecord = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      if (element instanceof SpringValue) ret[key] = element.get();
      else ret[key] = recursiveDefaultValues(element as any);
    }
  }
  return ret;
}

const defaultValues = recursiveDefaultValues(springs);

function recursiveReset(springs: UnknownRecord, defaults: UnknownRecord) {
  for (const key in springs) {
    if (Object.prototype.hasOwnProperty.call(springs, key)) {
      const element = springs[key];
      if (element instanceof SpringValue) element.set(defaults[key]);
      else recursiveReset(springs[key] as any, defaults[key] as any);
    }
  }
}

export const resetAllSprings = () => recursiveReset(springs, defaultValues);

export { animated } from "@react-spring/web";
