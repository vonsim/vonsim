/**
 * @fileoverview
 * We want to start animations from different places in the UI.
 * Specifically, from the simulation response.
 *
 * So, instead of having multiple references spread across the UI,
 * we declare them here in a Context. That way, they can be accessed
 * from anywhere in the UI.
 *
 * @see {@link https://react-spring.dev/docs/advanced/spring-ref}
 */

import { SpringRef, useSpringRef } from "@react-spring/web";
import type { PhysicalRegister } from "@vonsim/simulator/cpu";
import { createContext, useContext } from "react";

export type AnimationRefs = {
  cpu: {
    highlightPath: SpringRef;
  } & { [key in PhysicalRegister | "MAR" | "MBR"]: SpringRef };
};

const AnimationRefsContext = createContext<AnimationRefs>({} as any);

export const useAnimationRefs = () => useContext(AnimationRefsContext);

export function AnimationRefsProvider({ children }: { children: React.ReactNode }) {
  const refs: AnimationRefs = {
    cpu: {
      highlightPath: useSpringRef(),
      AX: useSpringRef(),
      BX: useSpringRef(),
      CX: useSpringRef(),
      DX: useSpringRef(),
      SP: useSpringRef(),
      IP: useSpringRef(),
      IR: useSpringRef(),
      ri: useSpringRef(),
      id: useSpringRef(),
      left: useSpringRef(),
      right: useSpringRef(),
      result: useSpringRef(),
      FLAGS: useSpringRef(),
      MAR: useSpringRef(),
      MBR: useSpringRef(),
    },
  };

  return <AnimationRefsContext.Provider value={refs}>{children}</AnimationRefsContext.Provider>;
}
