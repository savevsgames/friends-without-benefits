import React, { useEffect } from "react";
import { useGameStore } from "@/store";

const Countdown: React.FC = () => {
  const countdown = useGameStore((state) => state.countdown);
  //   const setCountdown = useGameStore((state) => state.setCountdown);

  useEffect(() => {
    const countdownTimer: NodeJS.Timeout = setInterval(() => {
      const currentCountdown = useGameStore.getState().countdown;
      if (currentCountdown !== null && currentCountdown > 0) {
        useGameStore.getState().setCountdown(currentCountdown - 1);
      } else {
        clearInterval(countdownTimer);
        useGameStore.getState().setCountdown(null); // Reset countdown
      }
    }, 1000);

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          fontSize: "10rem",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        {countdown}
      </h1>
    </div>
  );
};

export default Countdown;
