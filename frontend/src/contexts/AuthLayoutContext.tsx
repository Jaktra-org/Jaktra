import { createContext, useContext } from "react";

export const AuthLayoutContext = createContext<boolean>(false);

export function useIsInsideAuthLayout(): boolean {
  return useContext(AuthLayoutContext);
}
