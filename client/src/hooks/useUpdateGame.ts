import { useMutation } from "@apollo/client";
import { UPDATE_GAME } from "../utils/mutations";

interface UpdateGameInput {
  gameId: string;
  isComplete: boolean;
  duration: number;
  itemsFound: number;
  winnerId: string;
}

export const useUpdateGame = () => {
  const [updateGameMutation] = useMutation(UPDATE_GAME);

  const updateGame = async ({
    gameId,
    isComplete,
    duration,
    itemsFound,
    winnerId,
  }: UpdateGameInput) => {

    if(!gameId || gameId === "") {
      throw new Error("Game ID is required to update a game");
    }
    try {
      const response = await updateGameMutation({
        variables: {
          input: {
            gameId,
            isComplete,
            duration,
            itemsFound,
            winnerId,
          },
        },
      });
      console.log("Game updated successfully:", response.data.updateGame);
      return response.data.updateGame;
    } catch (error) {
      console.error("Failed to update game:", error);
      throw error;
    }
  };

  return { updateGame };
};
