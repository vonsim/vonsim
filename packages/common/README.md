# `@vonsim/common`

This package contains common utilites used across the VonSim project.

## `@vonsim/common/address`

This package exports `MemoryAddress`, a class that represents a memory address. It ensures that the address is within the bounds of the memory, and provides utilities for convertion and manipulation of addresses.

```ts
import { MemoryAddress } from "@vonsim/common/address";

MemoryAddress.from(0x0000); // MemoryAddress { #address: 0x0000 }
MemoryAddress.from(-1); // RangeError
```

## `@vonsim/common/ascii`

This package exports utilities for converting between ASCII and binary, using a common encoding defined in by the [VonSim specification](https://vonsim.github.io/docs/reference/ascii/).

## `@vonsim/common/byte`

This package exports `Byte`, a class that represents a byte. It ensures that the byte is within the bounds of a byte, and provides utilities for convertion and manipulation of bytes.

Each `Byte` can be of either 8 or 16 bits.

```ts
import { Byte } from "@vonsim/common/byte";

Byte.fromUnsigned(0x00, 8); // Byte { #value: 0x00, #size: 8 }
Byte.fromUnsigned(0xffff, 8); // RangeError
```

## `@vonsim/common/i18n`

This package exports utilities for internationalization. It's implemented this way to achieve type safety. More information can be found in the [`src/i18n.ts`](./src/i18n.ts).

## `@vonsim/common/loops`

This package exports utilities for looping over a range of numbers.

## `@vonsim/common/position`

This package exports `Position`, a class that represents a position (or a range) inside the source assembly code, plus some utilities.
