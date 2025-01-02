import { useEffect } from "react";
import { Peer } from "peerjs";
import { useMultiplayerStore } from "@/store";

export const usePeerJS = () => {
  const { setPeer, setPlayerId, setRoomId, setIsConnected } =
    useMultiplayerStore();

  useEffect(() => {
    const peerJs = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    peerJs.on("open", (id) => {
      console.log("✅ PeerJS connection established with ID:", id);
      setPlayerId(id); // Save player ID to store
      setRoomId(id); // Set initial room ID to player ID
      setPeer(peerJs); // Save peer instance to store
    });

    peerJs.on("connection", (conn) => {
      console.log("🔗 PeerJS Connection:", conn.peer);
      setIsConnected(true);
    });

    peerJs.on("close", () => {
      console.log("❌ PeerJS Connection closed");
    });

    peerJs.on("error", (err) => {
      console.error("❗ PeerJS Error:", err);
    });

    return () => {
      peerJs.destroy();
    };
  }, [setPeer, setPlayerId, setRoomId, setIsConnected]);
};
