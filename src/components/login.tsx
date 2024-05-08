import { createSignal } from "solid-js";

interface Props {
  onLogin: (username: string) => void;
}

export function Login(props: Props) {
  const [username, setUsername] = createSignal<string>("");

  const onSubmit = () => {
    if (!username()) return;
    props.onLogin(username());
  };

  return (
    <form
      action="#"
      class="w-full max-w-md px-4 py-6 md:py-6 md:px-9 border border-zinc-800 rounded-lg flex flex-col gap-6"
    >
      <div class="flex flex-col gap-2 text-center">
        <h1 class="text-2xl font-bold">Synadia Trivia</h1>
        <p class="text-zinc-400">
          Fill out your name and see if you can take your Synadia knowledge to
          the top of the leaderboard
        </p>
      </div>
      <input
        class="p-2 border border-zinc-800 rounded bg-transparent"
        type="text"
        placeholder="Username"
        value={username()}
        onInput={(e) => setUsername(e.target.value)}
      />
      <button
        type="submit"
        class="text-zinc-950 font-medium bg-zinc-50 rounded p-2 disabled:opacity-50"
        disabled={!username()}
        onClick={onSubmit}
      >
        Play
      </button>
    </form>
  );
}
