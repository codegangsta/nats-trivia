import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
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
          <Switch>
            <Match when={props.question.template.mystery && !props.showAnswer}>
              <div class="rounded-full w-36 h-36 border-[2px] border-zinc-800 lg:self-end bg-zinc-800 flex flex-none items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-help stroke-zinc-600"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
            </Match>
            <Match when={!props.question.template.mystery || props.showAnswer}>
              <img
                src={props.question.template.employee.image}
                class="rounded-full w-36 h-36 border-[2px] border-zinc-800 lg:self-end"
              />
            </Match>
          </Switch>
          <div class="flex flex-col gap-6 lg:gap-2">
            <Show when={!props.question.template.mystery || props.showAnswer}>
              <span class="flex flex-col lg:flex-row text-center lg:gap-2">
                <span class="font-medium text-zinc-50">
                  {props.question.template.employee.name}
                </span>
                <span class="text-zinc-400">
                  {props.question.template.employee.title}
                </span>
              </span>
            </Show>
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
