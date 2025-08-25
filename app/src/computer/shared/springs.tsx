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
import type { Tagged, UnknownRecord } from "type-fest";

import { colors } from "@/lib/tailwind";

// Common sets of springs

// Register component
export type RegisterSprings = Tagged<
  { backgroundColor: () => string; opacity: () => number },
  "RegisterSprings"
>;
export type RegisterKey = InitialValuesPathWhere<RegisterSprings>;

const Register = () =>
  ({ backgroundColor: () => colors.background1, opacity: () => 1 }) as RegisterSprings;

// Used for "lines/cables" that "fill" along a path
export type SimplePathSprings = Tagged<
  { strokeDashoffset: () => number; opacity: () => number },
  "SimplePathSprings"
>;
export type SimplePathKey = InitialValuesPathWhere<SimplePathSprings>;

const SimplePath = () => ({ strokeDashoffset: () => 1, opacity: () => 1 }) as SimplePathSprings;

/**
 * Spring initial values
 */
const initialValues = {
  bus: {
    address: { stroke: () => colors.background2 },
    data: { stroke: () => colors.background2 },
    rd: { stroke: () => colors.background2 },
    wr: { stroke: () => colors.background2 },

    iom: SimplePath(),
    mem: { stroke: () => colors.red500 },

    handshake: SimplePath(),
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

    printer: {
      data: SimplePath(),
      strobe: SimplePath(),
      busy: SimplePath(),
    },
  },
  clock: { angle: () => 0 },
  cpu: {
    internalBus: {
      address: {
        strokeDashoffset: () => 1,
        opacity: () => 1,
        path: () => "",
      },
      data: {
        strokeDashoffset: () => 1,
        opacity: () => 1,
        path: () => "",
      },
    },
    alu: {
      operands: SimplePath(),
      results: SimplePath(),
      cog: { rot: () => 0 },
      operation: { backgroundColor: () => colors.background1 },
    },
    decoder: {
      path: SimplePath(),
      progress: { progress: () => 0, opacity: () => 1 },
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
  handshake: {
    DATA: Register(),
    STATE: Register(),
  },
  memory: { "operating-cell": { color: () => colors.foreground } },
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
  printer: {
    printing: { progress: () => 0, opacity: () => 1 },
  },
  timer: {
    CONT: Register(),
    COMP: Register(),
  },
};

type InitialValues = typeof initialValues;
type InitialValuesPath = Path<InitialValues, () => any>;
type InitialValuesPathValue<P extends InitialValuesPath> = PathValue<InitialValues, P, () => any>;
type InitialValuesPathWhere<T> = {
  [K in InitialValuesPath]: InitialValuesPathValue<K> extends T ? K : never;
}[InitialValuesPath];

// Generate SpringValue instances from the initial values
function recursiveGenerateSprings(obj: UnknownRecord) {
  const ret: UnknownRecord = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      if (typeof element === "function") ret[key] = new SpringValue(element());
      else ret[key] = recursiveGenerateSprings(element as any);
    }
  }
  return ret;
}

/**
 * All spring values used in the computer, referenced by different components.
 * @see {@link https://react-spring.dev/docs/advanced/spring-value}
 */
const springs = recursiveGenerateSprings(initialValues) as Springs;

type DeepReplace<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends () => infer S
    ? SpringValue<S>
    : T[K] extends Record<string, any>
      ? DeepReplace<T[K]>
      : T[K];
};

export type Springs = DeepReplace<InitialValues>;
export type SpringPath = Path<Springs, SpringValue<any>>;
export type SpringPathValue<P extends SpringPath> = PathValue<Springs, P, SpringValue<any>>;

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

function recursiveReset(springs: UnknownRecord, defaults: UnknownRecord) {
  for (const key in springs) {
    if (Object.prototype.hasOwnProperty.call(springs, key)) {
      const element = springs[key];
      if (element instanceof SpringValue) element.set((defaults[key] as () => any)());
      else recursiveReset(springs[key] as any, defaults[key] as any);
    }
  }
}

export const resetAllSprings = () => recursiveReset(springs, initialValues);

export { animated } from "@react-spring/web";
