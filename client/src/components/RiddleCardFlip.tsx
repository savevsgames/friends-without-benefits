import { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";

const CardFlipRiddle = ({
  itemsArr,
  numFoundItems,
}: {
  itemsArr: string[];
  numFoundItems: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState("");
  const [nextRiddle, setNextRiddle] = useState("");
  const [riddleColor, setRiddleColor] = useState("from-teal-700 to-green-500");

  // Function to retrieve riddles
  const getRiddle = (item: string) => {
    const riddles: Record<string, string> = {
      Mug: "I hold your drink, be it coffee or tea, find me! ☕",
      Headphones:
        "Put me on to hear a tune, I sit on your ears and block out the room, find me! 🎧",
      Sunglasses:
        "I protect your eyes from the sun, but you still should not look directly at it! 🕶",
      Spoon: "I am rounded but I am not a ball. I sit at the table and help you eat! 🥄",
      Remote: "I let you switch channels while you relax, find me! 📺",
    };
    return riddles[item] || "Scavenge Complete!";
  };

  useEffect(() => {
    // Update riddles for the current and next items
    setCurrentRiddle(getRiddle(itemsArr[numFoundItems]));
    setNextRiddle(getRiddle(itemsArr[numFoundItems + 1]));

    // Trigger the card flip
    setIsFlipped(true);

    // Wait for the flip animation to complete before resetting to the front side
    const flipTimeout = setTimeout(() => {
      setIsFlipped(false);

      // Alternate between teal-green gradients
      setRiddleColor((prev) =>
        prev === "from-teal-700 to-green-500"
          ? "from-teal-900 to-green-600"
          : "from-teal-700 to-green-500"
      );
    }, 500);

    return () => clearTimeout(flipTimeout);
  }, [numFoundItems]);

  return (
    <div
      className="card-flip-container"
      style={{ width: "300px", margin: "0 auto" }}
    >
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Front of the card */}
        <div
          className={`card-front flex items-center justify-center bg-gradient-to-br ${riddleColor} text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300`}
        >
          <div>
            <h2 className="text-xl font-bold mb-2">🧩 Solve This:</h2>
            <p className="text-lg font-semibold">{currentRiddle}</p>
          </div>
        </div>

        {/* Back of the card */}
        <div
          className={`card-back flex items-center justify-center bg-gradient-to-br ${riddleColor} text-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300`}
        >
          <div>
            <h2 className="text-xl font-bold mb-2">✨ Get Ready For Next:</h2>
            <p className="text-lg">{nextRiddle}</p>
          </div>
        </div>
      </ReactCardFlip>
    </div>
  );
};

export default CardFlipRiddle;
