import { createContext } from "solid-js";
import type { Session } from "../schema";
import type { SetStoreFunction } from "solid-js/store";

export const SessionContext = createContext<{
  state: Session;
  setState: SetStoreFunction<Session>;
}>();
