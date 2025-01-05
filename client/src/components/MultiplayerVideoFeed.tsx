import React, { useEffect } from "react";
// import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";

const MultiplayerVideoFeed: React.FC = () => {
  const {
    peer,
    // setPeer,
    socket,
    // isConnected,
    // setIsConnected,
    playerId,
    // isHost,
  } = useMultiplayerStore();

  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  const enableOutgoingWebcamStream = async () => {
    // uses the localVideoRef to share the webcam stream
    try {
      if (!peer || !socket) {
        console.error("Peer or Socket not initialized...");
        return;
      }
      // Webcam will already be enabled for the host
      const videoElement = document.getElementById(
        "video-output"
      ) as HTMLVideoElement;

      const stream = videoElement.srcObject as MediaStream;
      // set the local ref to the host webcam stream (output in their video-output)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Outgoing Stream Enabled...");
      }

      // Notify "opponent" of incoming stream - currently by setting isReady to true
      // TODO:
      // eventually add a parameter to the store as a flag to indicate that the stream is incoming
      // for MVP it should work to just set isReady to true to enable both the incoming stream and outgoing stream

      // Request Opponent's peerId using socket io
      socket.emit("requestOpponentId", { from: playerId });
      console.log("Requesting opponentId from server...");
      socket.on("opponentId", (opponentId: string) => {
        if (!opponentId) {
          console.error("No opponentId found...");
          return;
        }
        console.log("Calling opponent with id: ", opponentId);
        // Create a call to opponent by id to send webcam stream
        const call = peer.call(opponentId, stream);
        call.on("stream", (remoteStream) => {
          console.log("Outgoing Stream Enabled...");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on("error", (error) => {
          console.error("Error calling opponent: ", error);
        });
      });
      // Update Zustand using socket.io
      socket.emit("storeUpdate", {
        updates: { isReady: true },
        playerId: playerId,
      });
    } catch (error) {
      console.error("Error sharing webcam stream", error);
    }
  };

  // Handle the incoming stream from opponent
  useEffect(() => {
    try {
      if (!peer) {
        console.log("Peer not initialized...");
        return;
      }
      peer.on("call", async (call) => {
        console.log("Incoming call from opponent: ", call.peer);
        // Enable the webcam stream for the opponent
        const stream = await enableWebcam();
        if (!stream) {
          console.error("Error enabling webcam stream...");
          return;
        }
        // Respond to the call with the webcam stream
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          console.log("Incoming Stream Enabled...");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });

      return () => {
        // Clean up the peer event listener for "call"
        peer.off("call");
      };
    } catch (error) {
      console.error("Error sharing webcam stream", error);
    }
  }, [peer]);

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
          width: "60%",
          height: "auto",
          maxHeight: "50px",
          backgroundColor: "green",
          borderRadius: "5px",
          color: "white",
          padding: "0.5rem",
          margin: "1rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        Enable Outgoing Stream
      </button>
    </div>
  );
};
export default MultiplayerVideoFeed;
