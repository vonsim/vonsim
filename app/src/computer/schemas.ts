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
 * Devices configurations from metadata.
 * @see https://vonsim.github.io/en/reference/metadata#devices
 */
export const devicesMetadataSchema = z
  .string()
  .transform(s => {
    const devices: Partial<z.infer<typeof devicesSchema>> = {};

    if (s === "none") {
      return { keyboardAndScreen: false, pic: false, pio: null, handshake: null };
    }

    for (const item of s.split(/\s*,\s*/g)) {
      switch (item) {
        case "keyboard":
        case "screen":
          devices.keyboardAndScreen = true;
          break;
        case "pic":
          devices.pic = true;
          break;
        case "switches-pio":
        case "leds-pio":
          devices.pio = "switches-and-leds";
          break;
        case "printer-pio":
          devices.pio = "printer";
          if (devices.handshake === "printer") devices.handshake = null;
          break;
        case "printer-handshake":
          devices.handshake = "printer";
          if (devices.pio === "printer") devices.pio = null;
          break;
        default:
          break;
      }
    }
    return devices;
  })
  .catch({});

/**
 * Program metadata schema used to set devices and other options.
 * @see https://vonsim.github.io/en/reference/metadata
 */
export const programMetadataSchema = z.object({
  name: z.string().min(1).optional().catch(undefined),
  author: z.string().min(1).optional().catch(undefined),
  date: z.iso.date().optional().catch(undefined),
  url: z.url().optional().catch(undefined),
  devices: devicesMetadataSchema,
});
