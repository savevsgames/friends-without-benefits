import {useQuery} from "@apollo/client";
import {QUERY_TOP_TEN} from "@/utils/queries.ts";

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60); // Get whole minutes
  const seconds = Math.floor(duration % 60); // Get remaining whole seconds
  const milliseconds = Math.round((duration % 1) * 100); // Get fractional part as milliseconds

  // Format the result as mm:ss.ms (zero-padded seconds if needed)
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

function formatRow(user: user) {
  if (user.shortestRound.challengers !== null) {
    return (
      <li>
        {user.username}{user.shortestRound.challengers.map((player) => (` vs. ${player.user.username}`))} | {formatDuration(user.shortestRound.duration)}
      </li>
    )
  } else {
    return (
      <li>
        {user.username} | {formatDuration(user.shortestRound.duration)}
      </li>
    )
  }
}

interface user {
  username: string;
  shortestRound: {
    duration: number;
    challengers: [
      {
        user: {
          username: string;
        }
      }
    ]
  }
}

function LeaderBoardComponent() {
  const {loading, data} = useQuery(QUERY_TOP_TEN);

  if (loading) {
    return (
      <div>
        Leader Board is loading, please wait...
      </div>
    )
  }

  console.log(data.topTen);


  return (
    <ul>
      {data.topTen.map((user: user) => (
        formatRow(user))
      )}
    </ul>
  )
}

export default LeaderBoardComponent;