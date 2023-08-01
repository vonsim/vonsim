import { SpringRef } from "@react-spring/web";

export const animationRefs = {
  cpu: {
    highlightPath: SpringRef<{ strokeDashoffset: number; opacity: number; path: string }>(),
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
