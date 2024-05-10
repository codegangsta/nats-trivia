import { Match, Switch, createEffect, createSignal } from "solid-js";

import {
  type Leaderboard as LeaderboardType,
  type Question as QuestionType,
  type Session as SessionType,
} from "../schema";
import { createStore, unwrap } from "solid-js/store";
import { createTimer } from "@solid-primitives/timer";
import { Question } from "./question";
import { questionTemplates } from "../data/questions";
import { connect, jwtAuthenticator } from "nats.ws";
import { createKV } from "../lib/nats-kv";
import { Leaderboard } from "./leaderboard";
import { createId } from "@paralleldrive/cuid2";

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRWUtSNFZJT1lXSUhBT0ZFWjJWQUI2NkhRWkxTNVZKRFM2RFdVWUxDNU1HTEZTTFlDTkxBIiwiaWF0IjoxNzE1MjA0MzA3LCJpc3MiOiJBQlRCS1FFV0g0SjQ0WjVTNENPUEpJNkk2V0pERUwyMzZaTkRKWkFUMlZVWEVMNVVERUtWSlZTQiIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVQUs2Rk9MWkpDQllNVEhGT1BWRjRMTUFQM1EySlNFN0ZGQkdPTklRNjdaTVhUMzI2NDRLNDJUVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFDNVBQM0lFNjVKT0RERVZRT1NWWFpITDNISVhHWVNCWDNNVEhKSkpXTjdQSUhSNko0RVZXM1VZIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.l6Qt_-bo62wbZ0_D2vSmvTcPZyGhUysATWrf9dRJCL9F2Imb_UMNxgCK_xx6Ru3DR8hGx_1BJFrwrOAMnQYXAg";

interface Props {
  id: string;
}

export function Session(props: Props) {
  let askedQuestions: string[] = [];
  const [seconds, setSeconds] = createSignal(0);
  const [session, setSessionInternal] = createStore<SessionType>({
    id: props.id,
    questions: {},
    questionTemplates: questionTemplates,
    state: "question",
    leaderboard: {
      players: [],
    },
  });

  const nc = connect({
    servers: ["wss://connect.ngs.global"],
    authenticator: jwtAuthenticator(jwt),
    name: "trivia-host",
  });

  const kv = createKV(nc, "trivia");
  kv.watch(`session.${session.id}.>`, (k, v) => {
    const parts = k.split(".").slice(2);
    /*@ts-ignore*/
    setSessionInternal(...[...parts, v]);
  });

  const setSession = (...args: any[]) => {
    const val = args.pop();
    kv.put(`session.${session.id}.${args.join(".")}`, val);
  };

  const chooseQuestion = async () => {
    const keys = Object.keys(session.questionTemplates);
    const key = keys[Math.floor(Math.random() * keys.length)];

    // make sure we don't choose a question that has already been asked
    // if we have asked all the questions, reset the list
    if (askedQuestions.length == keys.length) {
      console.log("resetting questions");
      askedQuestions = [];
    }

    if (askedQuestions.includes(key)) {
      console.log("Question already asked, choosing another.", key);
      chooseQuestion();
      return;
    }
    askedQuestions.push(key);

    const question: QuestionType = {
      id: createId(),
      template: session.questionTemplates[key],
      answers: {},
    };

    setSession("current", question);
    setSession("state", "question");
    setSession("questions", question.id, question);
  };

  const latest = () => {
    // return the latest question
    const key = Object.keys(session.questions).pop();
    if (!key) return null;

    return session.questions[key];
  };

  const calculateLeaderboard = () => {
    const questions = unwrap(session.questions);
    const leaderboard: LeaderboardType = {
      players: [],
    };

    for (const question of Object.values(questions)) {
      for (const answer of Object.values(question.answers)) {
        let player = leaderboard.players.find((p) => p.id == answer.player.id);

        if (!player) {
          player = {
            id: answer.player.id,
            name: answer.player.name,
            score: 0,
          };
          leaderboard.players.push(player);
        }

        if (answer.answer == question.template.answer) {
          player.score++;
        }
      }
    }

    kv.put(`session.${session.id}.leaderboard`, leaderboard);
  };

  createEffect(() => {
    switch (session.state) {
      case "question":
        chooseQuestion();
        setSeconds(15);
        break;

      case "answer":
        setSeconds(5);
        calculateLeaderboard();
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
        {/*@ts-ignore*/}
        <Question question={latest()} seconds={seconds()} />
      </Match>

      <Match when={session.state == "answer" && session.current}>
        {/*@ts-ignore*/}
        <Question question={latest()} showAnswer />
      </Match>

      <Match when={session.state == "leaderboard"}>
        <div class="mt-32 w-full h-full">
          <Leaderboard leaderboard={session.leaderboard} />
        </div>
      </Match>
    </Switch>
  );
}
