import create from "zustand";

export type ErrorsStore = {
  globalError: string | null;
  numberOfErrors: number;
};

export const useErrors = create<ErrorsStore>()(() => ({
  globalError: null,
  numberOfErrors: 0,
}));
