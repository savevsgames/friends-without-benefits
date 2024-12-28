import React, { useEffect, useState } from "react";
// import { useGameStore } from "@/store";
import { useMultiplayerStore } from "@/store";
import { enableWebcam } from "@/utils/model-utils";

const MultiplayerVideoFeed: React.FC = () => {
  const {
    peer,
    setPeer,
    socket,
    isConnected,
    setIsConnected,
    playerId,
    isHost,
  } = useMultiplayerStore();
  return (
    <div id="challenger-video-wrapper">
      <video
        ref={localVideoRef}
        id="challenger-video-output"
        autoPlay
        muted
        style={{ width: "300px", border: "1px solid black" }}
      />
    </div>
  );
};
export default MultiplayerVideoFeed;
