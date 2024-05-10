import { createStore } from "solid-js/store";
import type { PlayerAnswer, Session as SessionType } from "../schema";
import { Match, Switch, createSignal } from "solid-js";
import { connect, jwtAuthenticator } from "nats.ws";
import { createKV } from "../lib/nats-kv";
import { Question } from "./question";
import { Login } from "./login";
import { Leaderboard } from "./leaderboard";
import { createId } from "@paralleldrive/cuid2";

interface Props {
  id: string;
}

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJRWUtSNFZJT1lXSUhBT0ZFWjJWQUI2NkhRWkxTNVZKRFM2RFdVWUxDNU1HTEZTTFlDTkxBIiwiaWF0IjoxNzE1MjA0MzA3LCJpc3MiOiJBQlRCS1FFV0g0SjQ0WjVTNENPUEpJNkk2V0pERUwyMzZaTkRKWkFUMlZVWEVMNVVERUtWSlZTQiIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVQUs2Rk9MWkpDQllNVEhGT1BWRjRMTUFQM1EySlNFN0ZGQkdPTklRNjdaTVhUMzI2NDRLNDJUVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFDNVBQM0lFNjVKT0RERVZRT1NWWFpITDNISVhHWVNCWDNNVEhKSkpXTjdQSUhSNko0RVZXM1VZIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.l6Qt_-bo62wbZ0_D2vSmvTcPZyGhUysATWrf9dRJCL9F2Imb_UMNxgCK_xx6Ru3DR8hGx_1BJFrwrOAMnQYXAg";

export function PlayerSession(props: Props) {
  const [username, setUsername] = createSignal(
    localStorage.getItem("username"),
  );
  const [id, setId] = createSignal(localStorage.getItem("userId"));

  const [session, setSession] = createStore<Partial<SessionType>>({
    id: props.id,
    leaderboard: {
      players: [],
    },
  });

  const login = (username: string) => {
    localStorage.setItem("username", username);
    const uid = createId();
    localStorage.setItem("userId", uid);
    setId(uid);
    setUsername(username);
  };

  const nc = connect({
    servers: ["wss://connect.ngs.global"],
    authenticator: jwtAuthenticator(jwt),
    name: "trivia-player",
  });

  const kv = createKV(nc, "trivia");
  kv.watch(`session.${session.id}.*`, (k, v) => {
    const parts = k.split(".").slice(2);
    /*@ts-ignore*/
    setSession(...[...parts, v]);
  });

  const submitAnswer = (answer: string) => {
    const userid = id();
    const name = username();

    if (!session.current) return;
    if (!userid || !name) return;

    const a: PlayerAnswer = {
      questionId: session.current.id,
      answer: answer,
      player: {
        id: userid,
        name: name,
      },
    };
    kv.put(
      `session.${session.id}.questions.${a.questionId}.answers.${a.player.id}`,
      a,
    );
  };

  return (
    <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
      <Switch fallback={<div>Loading...</div>}>
        <Match when={!username()}>
          <Login onLogin={login} />
        </Match>
        <Match when={session.state == "question" && session.current}>
          <Question
            question={session.current}
            onAnswer={submitAnswer}
            selectable
          />
        </Match>

        <Match when={session.state == "answer" && session.current}>
          <Question question={session.current} showAnswer />
        </Match>

        <Match when={session.state == "leaderboard"}>
          <Leaderboard
            leaderboard={session.leaderboard}
            currentPlayerId={id()}
          />
        </Match>
      </Switch>
    </div>
  );
}
