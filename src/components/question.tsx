import { For, Show, createSignal, onCleanup, useContext } from "solid-js";
import type { Question } from "../schema";
import { SessionContext } from "./session-context";

interface Props {
  seconds: number;
}

export function Question(props: Props) {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("SessionContext is not provided");
  }
  const { state, setState } = context;
  const current = state.current;
  if (!current) {
    return null;
  }

  return (
    <>
      <div class="flex items-center w-full">
        <span class="flex-grow text-2xl font-medium text-zinc-400">
          Question {current.id}
        </span>
        <span class="font-semibold text-4xl bg-zinc-800 border-[6px] border-purple-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
          {props.seconds}
        </span>
      </div>
      <div class="flex flex-grow items-center justify-center w-full">
        <div class="w-full flex gap-12">
          <img
            src="/people/jeremy.jpeg"
            class="rounded-full w-36 h-36 border-[2px] border-zinc-800 self-end"
            alt="TV"
          />
          <div class="flex flex-col gap-2">
            <span class="flex flex-row gap-2">
              <span class="font-medium text-zinc-50">
                {current.template.employee.name}
              </span>
              <span class="text-zinc-400">
                {current.template.employee.title}
              </span>
            </span>
            <span class="chat-bubble self-start">
              <span class="text-4xl font-semibold">
                {current.template.question}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 w-full">
        <For each={current.template.choices}>
          {(choice) => <button class="btn-choice">{choice}</button>}
        </For>
      </div>
    </>
  );
}
