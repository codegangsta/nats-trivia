import { For, Show } from "solid-js";
import type { Question as QuestionType } from "../schema";
import { cn } from "../utils/styles";

interface Props {
  seconds: number;
  question: QuestionType;
  showAnswer?: boolean;
}

export function Question(props: Props) {
  const { question } = props;
  console.log("question", question);

  return (
    <>
      <div class="absolute top-8 right-8">
        <Show when={!props.showAnswer}>
          <span class="font-semibold text-4xl bg-zinc-800 border-[6px] border-purple-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
            {props.seconds}
          </span>
        </Show>
      </div>
      <div class="flex flex-grow items-center justify-center w-full">
        <div class="w-full items-center justify-center flex gap-12">
          <img
            src="/people/jeremy.jpeg"
            class="rounded-full w-36 h-36 border-[2px] border-zinc-800 self-end"
            alt="TV"
          />
          <div class="flex flex-col gap-2">
            <span class="flex flex-row gap-2">
              <span class="font-medium text-zinc-50">
                {question.template.employee.name}
              </span>
              <span class="text-zinc-400">
                {question.template.employee.title}
              </span>
            </span>
            <span class="chat-bubble self-start">
              <span class="text-4xl font-semibold">
                {question.template.question}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 w-full">
        <For each={question.template.choices}>
          {(choice) => (
            <button
              class={cn(
                "btn-choice",
                props.showAnswer && choice === question.template.answer
                  ? "correct"
                  : "",
              )}
            >
              {choice}
            </button>
          )}
        </For>
      </div>
    </>
  );
}
