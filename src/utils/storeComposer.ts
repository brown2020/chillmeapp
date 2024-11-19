import { create, StateCreator } from "zustand";
import { devtools, DevtoolsOptions } from "zustand/middleware";

const composeStore = <StoreState>(
  initializer: StateCreator<StoreState, [["zustand/devtools", never]], []>,
  options: DevtoolsOptions,
) =>
  create<StoreState, [["zustand/devtools", never]]>(
    devtools(initializer, {
      ...options,
      enabled: true,
    }),
  );

export { composeStore };
