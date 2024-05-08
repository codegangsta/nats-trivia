import { createStore } from "solid-js/store";
import type { PlayerAnswer, Session as SessionType } from "../schema";
import { Match, Switch, createSignal } from "solid-js";
import { connect, jwtAuthenticator } from "nats.ws";
import { createKV } from "../lib/nats-kv";
import { Question } from "./question";
import { Login } from "./login";

interface Props {
  id: string;
}

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIUEJKS01SNkpHMlJKRlg3N1ZWQU1MUjNPVldCRENMSUpYSkwzMklGWExGM1lRTkRQTkhRIiwiaWF0IjoxNzEzOTA3MDUzLCJpc3MiOiJBQ0MyTllZRFFSWkFBTk5WNkNHNDdYUklBWkxZMlhSTjVNMkpWUkZWUFFZQ083WUU1SU9aSFlSSCIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVRFk2QUJPTFJNNlhMTFY3RTQ3UVlCWE42S04zT0ZQWkFORzQzR1lOVVdUN01WVEFBQ1FLNUlKVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFBRDdUS1JMTE5LRFdFQlZMREY0S0FZRFNYM1FPUERENE80QzZONFlZUk0zREpOV002TFdXVEpDIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.UkMAAFj7YyrQEWE7Qq3grxxL1Qs90oGibd6kl_DNw-sBV7YVtctGbSIAZExUGkjvPIFbKi3rsRAkjb52Gje2AQ";

export function PlayerSession(props: Props) {
  const id = Math.random().toString(36).substring(7);
  const name = "jeremy";
  const [username, setUsername] = createSignal(
    localStorage.getItem("username"),
  );

  const [session, setSession] = createStore<Partial<SessionType>>({
    id: props.id,
  });

  const nc = connect({
    servers: ["wss://connect.ngs.global"],
    authenticator: jwtAuthenticator(jwt),
  });

  const kv = createKV(nc, "trivia");
  kv.watch(`session.${session.id}.*`, (k, v) => {
    const parts = k.split(".").slice(2);
    /*@ts-ignore*/
    setSession(...[...parts, v]);
  });

  const submitAnswer = (answer: string) => {
    if (!session.current) return;

    const a: PlayerAnswer = {
      questionId: session.current.id,
      answer: answer,
      player: {
        id: id,
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
          <Login onLogin={console.log} />
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

        <Match when={session.state == "leaderboard"}>Showing Leaderboard</Match>
      </Switch>
    </div>
  );
}
