import { Match, Switch, createEffect, createSignal } from "solid-js";

import {
  type Question as QuestionType,
  type Session as SessionType,
} from "../schema";
import { createStore } from "solid-js/store";
import { createTimer } from "@solid-primitives/timer";
import { Question } from "./question";
import { questionTemplates } from "../data/questions";

interface Props {
  id: string;
}

export function Session(props: Props) {
  const [seconds, setSeconds] = createSignal(0);
  const [session, setSession] = createStore<SessionType>({
    id: props.id,
    questions: {},
    questionTemplates: questionTemplates,
    state: "question",
  });

  const chooseQuestion = async () => {
    const keys = Object.keys(session.questionTemplates);
    const key = keys[Math.floor(Math.random() * keys.length)];

    const question: QuestionType = {
      id: Math.random().toString(36).substring(7),
      template: session.questionTemplates[key],
    };
    setSession("current", question);
    setSession("state", "question");
  };

  createEffect(() => {
    switch (session.state) {
      case "connecting":
        break;

      case "question":
        chooseQuestion();
        setSeconds(5);
        break;

      case "answer":
        setSeconds(5);
        break;

      case "leaderboard":
        setSeconds(5);
        break;
    }
  });

  createTimer(
    async () => {
      setSeconds((prev) => Math.max(prev - 1, 0));

      if (seconds() == 0) {
        switch (session.state) {
          case "question":
            setSession("state", "answer");
            break;

          case "answer":
            setSession("state", "leaderboard");
            break;

          case "leaderboard":
            setSession("state", "question");
            break;
        }
      }
    },
    1000,
    setInterval,
  );

  return (
    <Switch fallback={<div>Loading...</div>}>
      <Match when={session.state == "question" && session.current}>
        <Question question={session.current} seconds={seconds()} />
      </Match>

      <Match when={session.state == "answer" && session.current}>
        <Question question={session.current} showAnswer />
      </Match>

      <Match when={session.state == "leaderboard"}>Showing Leaderboard</Match>
    </Switch>
  );
}
