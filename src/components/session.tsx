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

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIUEJKS01SNkpHMlJKRlg3N1ZWQU1MUjNPVldCRENMSUpYSkwzMklGWExGM1lRTkRQTkhRIiwiaWF0IjoxNzEzOTA3MDUzLCJpc3MiOiJBQ0MyTllZRFFSWkFBTk5WNkNHNDdYUklBWkxZMlhSTjVNMkpWUkZWUFFZQ083WUU1SU9aSFlSSCIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVRFk2QUJPTFJNNlhMTFY3RTQ3UVlCWE42S04zT0ZQWkFORzQzR1lOVVdUN01WVEFBQ1FLNUlKVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFBRDdUS1JMTE5LRFdFQlZMREY0S0FZRFNYM1FPUERENE80QzZONFlZUk0zREpOV002TFdXVEpDIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.UkMAAFj7YyrQEWE7Qq3grxxL1Qs90oGibd6kl_DNw-sBV7YVtctGbSIAZExUGkjvPIFbKi3rsRAkjb52Gje2AQ";

interface Props {
  id: string;
}

export function Session(props: Props) {
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

    const question: QuestionType = {
      id: Math.random().toString(36).substring(7),
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
    console.log("Calculating Leaderboard");
    const questions = unwrap(session.questions);
    const leaderboard: LeaderboardType = {
      players: [],
    };

    for (const question of Object.values(questions)) {
      for (const answer of Object.values(question.answers)) {
        const player = leaderboard.players.find(
          (p) => p.id == answer.player.id,
        );

        if (!player) {
          leaderboard.players.push({
            id: answer.player.id,
            name: answer.player.name,
            score: 1,
          });
        } else {
          player.score++;
        }
      }
    }

    console.log("Leaderboard", leaderboard);
    kv.put(`session.${session.id}.leaderboard`, leaderboard);
  };

  createEffect(() => {
    switch (session.state) {
      case "question":
        chooseQuestion();
        setSeconds(10);
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

      <Match when={session.state == "leaderboard"}>Showing Leaderboard</Match>
    </Switch>
  );
}
