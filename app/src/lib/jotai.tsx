import { createStore, Provider } from "jotai";

// I use this global store instead of the default one because
// I want to import it and use it outside of React components.
// Having one declared verbosely helps finding bugs.

export const store = createStore();

export function JotaiProvider(props: React.PropsWithChildren) {
  return <Provider store={store}>{props.children}</Provider>;
}
