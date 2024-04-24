import { connect, jwtAuthenticator } from "nats.ws";
import { createStore } from "solid-js/store";
import { createKV } from "../lib/nats-kv";
import type { Session } from "../schema";

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJIUEJKS01SNkpHMlJKRlg3N1ZWQU1MUjNPVldCRENMSUpYSkwzMklGWExGM1lRTkRQTkhRIiwiaWF0IjoxNzEzOTA3MDUzLCJpc3MiOiJBQ0MyTllZRFFSWkFBTk5WNkNHNDdYUklBWkxZMlhSTjVNMkpWUkZWUFFZQ083WUU1SU9aSFlSSCIsIm5hbWUiOiJ0cml2aWEiLCJzdWIiOiJVRFk2QUJPTFJNNlhMTFY3RTQ3UVlCWE42S04zT0ZQWkFORzQzR1lOVVdUN01WVEFBQ1FLNUlKVyIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFBRDdUS1JMTE5LRFdFQlZMREY0S0FZRFNYM1FPUERENE80QzZONFlZUk0zREpOV002TFdXVEpDIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.UkMAAFj7YyrQEWE7Qq3grxxL1Qs90oGibd6kl_DNw-sBV7YVtctGbSIAZExUGkjvPIFbKi3rsRAkjb52Gje2AQ";

export function KVStoreTest() {
  const [session, setSession] = createStore<Session>({
    id: "session-1",
    questions: {},
    questionTemplates: {},
    current: undefined,
  });

  const nc = connect({
    servers: ["wss://connect.ngs.global"],
    authenticator: jwtAuthenticator(jwt),
  });

  const kv = createKV(nc, "trivia");
  kv.watch("session.synadia.>", (k, v) => {
    const parts = k.split(".").slice(2);
    /*@ts-ignore*/
    setSession(...[...parts, v]);
  });

  return (
    <div>
      <div>Current: {JSON.stringify(session.current)}</div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
