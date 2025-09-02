import { getMetadataFromProgram } from "@vonsim/assembler";

import { programMetadataSchema } from "@/computer/schemas";
import { setDevices } from "@/lib/settings";
import type { Settings } from "@/lib/settings/schema";

import { setSavedProgram } from "./files";

/**
 * Gets editor program source code
 */
export function getProgram() {
  if (!window.codemirror) return;
  return window.codemirror.state.doc.toString();
}

/**
 * Sets editor program source code
 */
export function setProgram({
  source,
  devices,
}: {
  source: string;
  devices?: Partial<Settings["devices"]> | "infer";
}) {
  if (!window.codemirror) return;

  if (devices === "infer") {
    const metadata = getMetadataFromProgram(source);
    const result = programMetadataSchema.safeParse(metadata);
    if (result.success) setDevices(result.data.devices);
  } else if (typeof devices === "object") {
    setDevices(devices);
  }
  setSavedProgram(source);
  window.codemirror.dispatch({
    changes: {
      from: 0,
      to: window.codemirror.state.doc.length,
      insert: source,
    },
  });
}
