import { useAtomValue } from "jotai";

import { consoleAtom } from "@/computer/console/state";

import styles from "./Monitor.module.css";

export function Monitor() {
  const value = useAtomValue(consoleAtom);
  return <pre className={styles.monitor}>{value}</pre>;
}
