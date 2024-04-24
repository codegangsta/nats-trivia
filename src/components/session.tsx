import {
  JSONCodec,
  connect,
  jwtAuthenticator,
  type ConnectionOptions,
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

interface Props {
  id: string;
  connectOptions: ConnectionOptions;
}

export function Session(props: Props) {
  const [state, setState] = createStore<SessionType>({
    id: props.id,
    questions: {},
    questionTemplates: {},
  });
  const [ready, setReady] = createSignal(false);

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
    console.log("Creating kv");

    const js = nc.jetstream();

    const kv = await js.views.kv("trivia");
    console.log("Got KV", kv);

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
          setReady(true);
          const now = new Date();
          let expiry = new Date(now.getTime() + 60 * 1000);
          const question: QuestionType = {
            id: "1",
            template: state.questionTemplates["1"],
            expiryTime: expiry,
          };
          setState("current", question);
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

  return (
    <SessionContext.Provider value={{ state, setState }}>
      <Show when={!ready() && !conn()}>Connecting to NATS...</Show>
      <Show when={!ready() && conn()}>Downloading state...</Show>
      <Show when={state.current}>
        <Question />
      </Show>
    </SessionContext.Provider>
  );
}
