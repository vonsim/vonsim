import { z } from "zod";

/**
 * Value of {@link ComputerOptions.data}.
 */
export const DATA_ON_LOAD_VALUES = ["randomize", "clean", "unchanged"] as const;

/**
 * Value of {@link ComputerOptions.devices}.
 */
export const devicesSchema = z.object({
  keyboardAndScreen: z.boolean(),
  pic: z.boolean(),
  pio: z.enum(["switches-and-leds", "printer"]).nullable(),
  handshake: z.enum(["printer"]).nullable(),
});

/**
 * Keys of the {@link devicesSchema}.
 */
export const DEVICES_SCHEMA_KEYS = ["keyboardAndScreen", "pic", "pio", "handshake"] as const;
