import {
  JSONCodec,
  type KvEntry,
  type NatsConnection,
  type QueuedIterator,
} from "nats.ws";
import type { Resource, ResourceReturn } from "solid-js";
import { createResource } from "solid-js";

interface KV {
  get<T>(key: string): ResourceReturn<T | undefined>;
  put<T>(key: string, value: T): ResourceReturn<void, unknown>;
  watch<T>(
    key: string,
    cb: (key: string, value: T, entry: KvEntry) => void,
  ): ResourceReturn<boolean, unknown>;
  // bucket: Resource<KV>
}

// TODO: make sure we call the cleanup function
export function createKV(nc: Promise<NatsConnection>, name: string): KV {
  const kv = (async () => {
    const conn = await nc;
    return conn.jetstream().views.kv(name); //TODO: Accept options here
  })();

  return {
    get<T>(key: string) {
      return createResource(async () => {
        const view = await kv;
        const res = await view.get(key);
        return res?.json<T>();
      });
    },

    put<T>(key: string, value: T) {
      return createResource(async () => {
        const view = await kv;
        await view.put(key, JSONCodec().encode(value));
      });
    },

    watch<T>(key: string, cb: (key: string, value: T, entry: KvEntry) => void) {
      return createResource(async () => {
        const view = await kv;
        const p = new Promise<boolean>(async (resolve) => {
          const watcher = await view.watch({
            key,
            initializedFn: () => resolve(true),
          });
          for await (const entry of watcher) {
            cb(entry.key, entry.json<T>(), entry);
          }
        });

        return await p;
      });
      // });
    },
  };
}
