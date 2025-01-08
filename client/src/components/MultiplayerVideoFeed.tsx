import React, { useEffect } from "react";
// import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";
import { useUserSession } from "@/store";

const MultiplayerVideoFeed: React.FC = () => {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
  const user = useUserSession((state) => state.user);

  useEffect(() => {
    const socket = useMultiplayerStore.getState().socket;
    const peer = useMultiplayerStore.getState().peer;
    const playerId = useMultiplayerStore.getState().playerId;

    if (peer && socket && playerId) {
      console.log("📤 Registering Peer ID with Server...");
      socket.emit("registerPeerId", { userId: playerId, peerId: peer.id });
    }
  }, []);

  const enableOutgoingWebcamStream = async () => {
    try {
      const peer = useMultiplayerStore.getState().peer;
      const socket = useMultiplayerStore.getState().socket;
      const playerId = useMultiplayerStore.getState().playerId;

      if (!user) {
        console.error("❌ User not found.");
        return;
      }

      if (!peer || !socket) {
        console.error("❌ Peer or Socket not initialized.");
        return;
      }

      const videoElement = document.getElementById(
        "video-output"
      ) as HTMLVideoElement;

      if (!videoElement || !videoElement.srcObject) {
        console.error("❌ No webcam stream detected.");
        return;
      }

      const stream = videoElement.srcObject as MediaStream;

      // Set local video feed
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("📤 Requesting opponentId from server...");
      socket.emit("requestOpponentId", { from: user.data._id });

      socket.once("opponentId", (opponentId: string) => {
        if (!opponentId) {
          console.error("❌ No opponentId received from server.");
          return;
        }

        console.log("📞 Initiating call to opponent with ID:", opponentId);

        const call = peer.call(opponentId, stream);

        call.on("stream", (remoteStream) => {
          console.log("📥 Incoming remote stream from opponent...");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on("error", (error) => {
          console.error("❌ Error during call:", error);
        });
      });

      // Update Zustand state
      socket.emit("storeUpdate", {
        updates: { isReady: true },
        playerId: playerId,
      });
    } catch (error) {
      console.error("❌ Error enabling outgoing webcam stream:", error);
    }
  };

  // Handle the incoming stream from opponent
  useEffect(() => {
    const peer = useMultiplayerStore.getState().peer;

    if (!peer) {
      console.log("❌ Peer not initialized...");
      return;
    }

    peer.on("call", async (call) => {
      console.log("📞 Incoming call from:", call.peer);

      try {
        const stream = await enableWebcam();
        if (!stream) {
          console.error("❌ Failed to enable webcam for incoming call.");
          return;
        }

        call.answer(stream);

        call.on("stream", (remoteStream) => {
          console.log("📥 Remote stream received from opponent.");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        // Enable outgoing webcam stream
        enableOutgoingWebcamStream();

        call.on("error", (error) => {
          console.error("❌ Error during incoming call:", error);
        });
      } catch (error) {
        console.error("❌ Error handling incoming call:", error);
      }
    });

    return () => {
      peer.off("call");
    };
  }, []);

  return (
    <div
      id="challenger-video-wrapper"
      style={{
        display: "flex",
        gap: "1rem",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "30vh",
        border: "1px solid black",
      }}
    >
      <video
        ref={remoteVideoRef}
        id="challenger-video-output"
        autoPlay
        style={{
          width: "100%",
          height: "auto",
        }}
      />
      <button
        onClick={enableOutgoingWebcamStream}
        style={{
          // width: "60%",
          height: "auto",
          // maxHeight: "50px",
          backgroundColor: "teal",
          borderRadius: "5px",
          color: "white",
          padding: "0.5rem",
          margin: "1rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        💻
      </button>
    </div>
  );
};
export default MultiplayerVideoFeed;
