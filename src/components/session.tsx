import {
  JSONCodec,
  connect,
  jwtAuthenticator,
  type ConnectionOptions,
  type KV,
  type KvEntry,
} from "nats.ws";
import {
  Show,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";

import { questions } from "../data/questions";
import type {
  Question as QuestionType,
  QuestionTemplate,
  Session as SessionType,
} from "../schema";
import { createStore } from "solid-js/store";
import { SessionContext } from "./session-context";
import { Question } from "./question";
import { createTimer } from "@solid-primitives/timer";

interface Props {
  id: string;
  connectOptions: ConnectionOptions;
}

type Status = "connecting" | "question" | "answer" | "leaderboard";
const QuestionSeconds = 5;
const AnswerSeconds = 3;
const LeaderboardSeconds = 3;

export function Session(props: Props) {
  const [status, setStatus] = createSignal<Status>("connecting");
  const [state, setState] = createStore<SessionType>({
    id: props.id,
    questions: {},
    questionTemplates: {},
  });
  const [kv, setKv] = createSignal<KV>();
  const [seconds, setSeconds] = createSignal(0);

  const opts: ConnectionOptions = {
    servers: ["wss://connect.ngs.global"],
    name: "trivia-host",
    authenticator: jwtAuthenticator(
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIUEJKS01SNkpHMlJKRlg3N1ZWQU1MUjNPVldCRENMSUpYSkwzMklGWExGM1lRTkRQTkhRIiwiaWF0IjoxNzEzOTA3MDUzLCJpc3MiOiJBQ0MyTllZRFFSWkFBTk5WNkNHNDdYUklBWkxZMlhSTjVNMkpWUkZWUFFZQ083WUU1SU9aSFlSSCIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVRFk2QUJPTFJNNlhMTFY3RTQ3UVlCWE42S04zT0ZQWkFORzQzR1lOVVdUN01WVEFBQ1FLNUlKVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFBRDdUS1JMTE5LRFdFQlZMREY0S0FZRFNYM1FPUERENE80QzZONFlZUk0zREpOV002TFdXVEpDIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.UkMAAFj7YyrQEWE7Qq3grxxL1Qs90oGibd6kl_DNw-sBV7YVtctGbSIAZExUGkjvPIFbKi3rsRAkjb52Gje2AQ",
    ),
  };
  const jc = JSONCodec();

  const onKVUpdate = (e: KvEntry) => {
    console.log("KV Update", e.key);

    const parts = e.key.split(".");
    const resource = parts[2];

    switch (resource) {
      case "question_templates":
        const q = jc.decode(e.value) as QuestionTemplate;
        setState("questionTemplates", q.id, q);
        break;

      case "questions":
        if (parts[4] !== "answers") {
          const q = jc.decode(e.value) as QuestionType;
          setState("questions", q.id, q);
        } else {
          console.log("Got answers", jc.decode(e.value));
        }
        break;

      case "current":
        const question = jc.decode(e.value) as QuestionType;
        setState("current", question);
        break;

      case "players":
        console.log("Got player update", jc.decode(e.value));
        break;

      default:
        console.log("Unknown resource", resource);
    }
  };

  const [conn] = createResource(props.connectOptions, async () => {
    const nc = await connect(opts);
    return nc;
  });

  createEffect(async () => {
    const nc = conn();
    if (!nc) return;

    const js = nc.jetstream();

    const kv = await js.views.kv("trivia");
    setKv(kv);

    // put seed question templates in here for now
    questions.forEach(async (q) => {
      await kv.put(
        `session.${props.id}.question_templates.${q.id}`,
        JSON.stringify(q),
      );
    });

    // watch for various resource changes and update our local state
    (async () => {
      console.log("Watching for question templates");
      const w = await kv.watch({
        key: `session.${props.id}.>`,
        initializedFn: () => {
          chooseQuestion();
        },
      });
      for await (const e of w) {
        onKVUpdate(e);
      }
    })();
  });

  onCleanup(async () => {
    await conn()?.close();
    console.log("Closed NATS connection");
  });

  const chooseQuestion = async () => {
    console.log("Choosing question");
    const keys = Object.keys(state.questionTemplates);
    const key = keys[Math.floor(Math.random() * keys.length)];

    const question: QuestionType = {
      id: Math.random().toString(36).substring(7),
      template: state.questionTemplates[key],
    };
    await kv()?.put(`session.${props.id}.current`, jc.encode(question));
    setStatus("question");
    setSeconds(QuestionSeconds);
  };

  createTimer(
    async () => {
      setSeconds((prev) => Math.max(prev - 1, 0));

      if (seconds() == 0) {
        switch (status()) {
          case "question":
            setStatus("answer");
            setSeconds(AnswerSeconds);
            break;

          case "answer":
            setStatus("leaderboard");
            setSeconds(LeaderboardSeconds);
            break;

          case "leaderboard":
            await chooseQuestion();
            break;
        }
      }
    },
    1000,
    setInterval,
  );

  return (
    <SessionContext.Provider value={{ state, setState }}>
      <Show when={status() == "connecting"}>Connecting to NATS...</Show>
      <Show when={status() == "question" && state.current}>
        <Question seconds={seconds()} />
      </Show>
      <Show when={status() == "answer"}>This is the answer component</Show>
      <Show when={status() == "leaderboard"}>
        This is the leaderboard component
      </Show>
    </SessionContext.Provider>
  );
}
