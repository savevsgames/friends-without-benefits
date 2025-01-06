import ReactModal from "react-modal";
import StartGameButton from "./buttons/StartGameButton";
import LoadWebcamButton from "./buttons/LoadWebcamButton";
import { useGameStore } from "@/store";
import MultiPlayerModal from "./MultiplayerModal";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../utils/mutations";
import { useUserSession, useMultiplayerStore } from "@/store";

const ChoiceScreen = ({
  isOpen,
  onClose,
  onStartTuto,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartTuto: () => void;

  onTurnOnCamera: () => void;
}) => {
  const setIsSingle = useGameStore((state) => state.setIsSingle);
  const setIsMulti = useGameStore((state) => state.setIsMulti);
  // Access the create game mutation
  const [createGameMutation, { data, loading, error }] =
    useMutation(CREATE_GAME);
  // state.user or state?
  const user = useUserSession((state) => state.user);
  const socket = useMultiplayerStore((state) => state.socket);
  const setRoomId = useMultiplayerStore((state) => state.setRoomId);
  const setIsHost = useMultiplayerStore((state) => state.setIsHost);

  const handleGameCreation = async () => {
    try {
      if (!user) {
        console.log("There is no authorized user");
        return;
      }
      // call the db with the mutation
      const response = await createGameMutation({
        variables: {
          input: {
            authorId: user.data.id,
            items: [], // TODO: might need to sync items here - can be done in updateGame instead
            challengerIds: [],
          },
        },
      });

      // get the new game data from the response
      const newGameData = response.data?.createGame;
      if (!newGameData) {
        console.error("No game was created/returned.");
        return;
      }
      // Set the gameId for the server/user link
      const gameId = newGameData._id;
      console.log(
        `Host with user data: ${user} has created a game with id: `,
        gameId
      );

      // Emit to the server that a new user is registering (first register)
      if (!socket) {
        console.error("❌ No socket exists to broadcast new game.");
      } else {
        console.log("Emitting registerUser: ", user?.data.id, gameId);
        socket.emit("registerUser", {
          userId: user?.data.id,
          gameId,
        });
      }

      // Update the zustand store
      setIsHost(true);
      setRoomId(gameId);
    } catch (error) {
      console.log("Error creating game in Choice Screen: ", error);
    }
  };

  const handleMultiplayerGameCreation = () =>{
    // TODO: Add DB call to createGame
    // if (mode === "single") {
    //   setIsSingle(true);
    //   setIsMulti(false);
    // } else if (mode === "multi") {
    //   setIsMulti(true);
    //   setIsSingle(false);
    // }
  }
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Choice Screen"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "2rem",
          maxWidth: "600px",
          borderRadius: "10px",
          overflow: "auto",
          zIndex: 1001,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
      }}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <>
          <button
            onClick={handleMultiplayerGameCreation}
            className="card bg-teal-100 text-teal-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
          >
            <h2 className="text-2xl font-bold mb-2">
              <MultiPlayerModal />
            </h2>
            <p className="text-sm text-gray-600">
              Playing with friends is always fun!
            </p>
          </button>
        </>

        {/* start game */}

        <StartGameButton onClose={onClose} />

        {/* start tutorial */}
        <button
          onClick={onStartTuto}
          className="card bg-teal-100 text-teal-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 w-full"
        >
          <h2 className="text-2xl font-bold mb-2">📘 Start Tutorial</h2>
          <p className="text-sm text-gray-600">
            Learn how to play before starting.
          </p>
        </button>

        {/* turn on Webcam */}
        <LoadWebcamButton />
      </div>
    </ReactModal>
  );
};

export default ChoiceScreen;
