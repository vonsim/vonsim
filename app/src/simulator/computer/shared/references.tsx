import { SpringRef } from "@react-spring/web";

import type { ControlLine } from "@/simulator/computer/bus";
import type { RegisterRef } from "@/simulator/computer/shared/Register";

export type { ControlLine, RegisterRef };

/**
 * Spring references
 * @see {@link https://react-spring.dev/docs/advanced/spring-ref}
 */
export const animationRefs = {
  bus: {
    address: SpringRef<{ stroke: string }>(),
    data: SpringRef<{ stroke: string }>(),
    rd: SpringRef<{ stroke: string }>(),
    wr: SpringRef<{ stroke: string }>(),
    iom: SpringRef<ControlLine>(),
    mem: SpringRef<{ stroke: string }>(),
    pic: SpringRef<ControlLine>(),
    timer: SpringRef<ControlLine>(),
    intr: SpringRef<ControlLine>(),
    inta: SpringRef<ControlLine>(),
    int0: SpringRef<ControlLine>(),
    int1: SpringRef<ControlLine>(),
    int2: SpringRef<ControlLine>(),
  },
  clock: SpringRef<{ angle: number }>(),
  cpu: {
    internalBus: {
      address: SpringRef<{ strokeDashoffset: number; opacity: number; path: string }>(),
      data: SpringRef<{ strokeDashoffset: number; opacity: number; path: string }>(),
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
    AX: SpringRef<RegisterRef>(),
    BX: SpringRef<RegisterRef>(),
    CX: SpringRef<RegisterRef>(),
    DX: SpringRef<RegisterRef>(),
    SP: SpringRef<RegisterRef>(),
    IP: SpringRef<RegisterRef>(),
    IR: SpringRef<RegisterRef>(),
    ri: SpringRef<RegisterRef>(),
    id: SpringRef<RegisterRef>(),
    left: SpringRef<RegisterRef>(),
    right: SpringRef<RegisterRef>(),
    result: SpringRef<RegisterRef>(),
    FLAGS: SpringRef<RegisterRef>(),
    MAR: SpringRef<RegisterRef>(),
    MBR: SpringRef<RegisterRef>(),
  },
  pic: {
    IMR: SpringRef<RegisterRef>(),
    IRR: SpringRef<RegisterRef>(),
    ISR: SpringRef<RegisterRef>(),
    INT0: SpringRef<RegisterRef>(),
    INT1: SpringRef<RegisterRef>(),
    INT2: SpringRef<RegisterRef>(),
    INT3: SpringRef<RegisterRef>(),
    INT4: SpringRef<RegisterRef>(),
    INT5: SpringRef<RegisterRef>(),
    INT6: SpringRef<RegisterRef>(),
    INT7: SpringRef<RegisterRef>(),
  },
  timer: {
    CONT: SpringRef<RegisterRef>(),
    COMP: SpringRef<RegisterRef>(),
  },
} as const;
