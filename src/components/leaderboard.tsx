import { For, Match, Show, Switch } from "solid-js";
import type { Leaderboard as LeaderboardType } from "../schema";

interface Props {
  leaderboard?: LeaderboardType;
  currentPlayerId?: string | null;
}

export function Leaderboard(props: Props) {
  if (!props.leaderboard) {
    return <div>...</div>;
  }
  console.log("Rendering leaderboard", props.leaderboard.players.length);

  const sortedPlayers = [...props.leaderboard.players].sort(
    (a, b) => b.score - a.score,
  );

  const topPlayers = sortedPlayers.slice(0, 10);

  const isTopPlayer = () => {
    return topPlayers.some((player) => player.id === props.currentPlayerId);
  };

  const currentPlayer = sortedPlayers.find(
    (player) => player.id === props.currentPlayerId,
  );
  const currentPlayerIndex = sortedPlayers.findIndex(
    (player) => player.id === props.currentPlayerId,
  );

  return (
    <div class="w-full h-full">
      <div class="flex flex-col gap-8 w-full">
        <h1 class="text-2xl md:text-5xl font-bold">Leaderboard</h1>
        <div class="grid grid-cols-[auto,1fr,auto] items-center gap-x-4 gap-y-3 text-zinc-300">
          <span class="text-sm uppercase text-zinc-300">Rank</span>
          <span class="text-sm uppercase text-zinc-300">Name</span>
          <span class="text-sm uppercase text-zinc-300">Score</span>
          <div class="col-span-3 border border-zinc-800"></div>

          <For each={topPlayers}>
            {(player, i) => (
              <Switch>
                <Match when={player == currentPlayer}>
                  <span class="leaderboard-text font-bold text-purple-400">
                    {i() + 1}
                  </span>
                  <span class="leaderboard-text font-bold text-purple-400">
                    You
                  </span>
                  <span class="leaderboard-text font-bold text-purple-400">
                    {player.score}
                  </span>
                </Match>
                <Match when={player != currentPlayer}>
                  <span class="leaderboard-text">{i() + 1}</span>
                  <span class="leaderboard-text">{player.name}</span>
                  <span class="leaderboard-text">{player.score}</span>
                </Match>
              </Switch>
            )}
          </For>
          <Show when={currentPlayer && !isTopPlayer()}>
            <span class="text-xl font-bold text-purple-400">
              {currentPlayerIndex + 1}
            </span>
            <span class="text-xl font-bold text-purple-400">
              {currentPlayer?.name}
            </span>
            <span class="text-xl font-bold text-purple-400">
              {currentPlayer?.score}
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
}
