import React from "react";
import { useSocketIO } from "@/hooks/useSocketIO";
import { usePeerJS } from "@/hooks/usePeerJs";

// MultiplayerInitializer calls customHooks to intialize socket-io and peerjs with server separately
const MultiplayerInitializer: React.FC = () => {
  useSocketIO();
  usePeerJS();

  // No UI, just ensures initialization happens when the component is mounted
  return null;
};

export default MultiplayerInitializer;
