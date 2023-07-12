import { Byte } from "@vonsim/common/byte";

import { atom } from "@/lib/jotai";

export const MARAtom = atom(Byte.zero(16)); // Memory Address Register
export const MBRAtom = atom(Byte.zero(8)); // Memory Buffer Register
