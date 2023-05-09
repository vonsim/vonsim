import { useMedia } from "react-use";

export function useMobile() {
  return useMedia("(max-width: 1024px)"); // tailwind lg breakpoint
}
