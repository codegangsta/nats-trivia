import { For, Show, createEffect, createSignal } from "solid-js";
import type { Question as QuestionType } from "../schema";
import { cn } from "../utils/styles";

interface Props {
  question?: QuestionType;
  seconds?: number;
  showAnswer?: boolean;
  onAnswer?: (answer: string) => void;
  selectable?: boolean;
}

export function Question(props: Props) {
  const [selected, setSelected] = createSignal<string | undefined>();
  if (!props.question) {
    return <div>Loading...</div>;
  }

  const setAnswer = (answer: string) => {
    if (!props.selectable) return;

    setSelected(answer);
    props.onAnswer?.(answer);
  };

  // map answers by choice so they can be counted
  const answerCounts = () => {
    if (!props.question) return {};

    // count answers by choice
    const counts: Record<string, number> = {};
    for (const choice of props.question.template.choices) {
      counts[choice] = 0;
    }

    for (const answer of Object.values(props.question.answers)) {
      counts[answer.answer]++;
    }
    return counts;
  };

  const answerTotal = () => {
    return Object.keys(props.question?.answers ?? {}).length;
  };

  const answerPercent = (choice: string) => {
    if (!answerCounts()[choice]) return 0;
    return (answerCounts()[choice] / answerTotal()) * 100;
  };

  return (
    <>
      <div class="absolute top-8 right-8">
        <Show when={props.seconds != undefined}>
          <span class="font-semibold text-4xl bg-zinc-800 border-[6px] border-purple-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
            {props.seconds}
          </span>
        </Show>
      </div>
      <div class="flex flex-grow items-center justify-center w-full">
        <div class="w-full items-center justify-center flex flex-col lg:flex-row gap-6 lg:gap-12">
          <img
            src="/people/jeremy.jpeg"
            class="rounded-full w-36 h-36 border-[2px] border-zinc-800 lg:self-end"
          />
          <div class="flex flex-col gap-6 lg:gap-2">
            <span class="flex flex-col lg:flex-row text-center lg:gap-2">
              <span class="font-medium text-zinc-50">
                {props.question.template.employee.name}
              </span>
              <span class="text-zinc-400">
                {props.question.template.employee.title}
              </span>
            </span>
            <span class="chat-bubble self-start">
              <span class="lg:text-4xl font-semibold">
                {props.question.template.question}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-6 w-full">
        <For each={props.question.template.choices}>
          {(choice) => (
            <button
              onClick={() => setAnswer(choice)}
              class={cn(
                "btn-choice relative overflow-hidden",
                props.showAnswer && choice === props.question?.template.answer
                  ? "correct"
                  : "",
                choice === selected() ? "selected" : "",
              )}
            >
              {choice}
              <span
                class="bg-zinc-800/50 absolute inset-0 -z-10 transition-all"
                style={{
                  width: `${answerPercent(choice)}%`,
                }}
              ></span>
              <Show when={answerCounts()[choice] > 0}>
                <span class="float-right text-zinc-400">
                  {answerCounts()[choice]}
                </span>
              </Show>
            </button>
          )}
        </For>
      </div>
    </>
  );
}
