import { useEffect } from "react";
import { Peer } from "peerjs";
import { useMultiplayerStore } from "@/store";

// TODO: Maybe a useRef for the peer instance? to persist is across re-renders?

export const usePeerJS = () => {
  const { setPeer, setIsConnected } = useMultiplayerStore(); 

  const isDevelopment = import.meta.env.MODE === "development";

  useEffect(() => {
    const peerJs = new Peer({
      host: isDevelopment ? "localhost" : window.location.hostname,
      port: isDevelopment ? 3001 : 443, //standard HTTPS on port 443 for all requests, regardless of the server’s internal port
      path: "/peerjs",
    });

    peerJs.on("open", (id) => {
      console.log("✅ PeerJS connection established with ID:", id);
      // setPlayerId(id); // Save player ID to store playerId
      // setRoomId(id); // Set initial room ID to player ID
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
    // Setters dont re-render - they are functions
  }, [setPeer, setIsConnected, isDevelopment]);
};
