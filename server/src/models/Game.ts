import { Schema, model, Document } from "mongoose";
import type { IPlayer } from "./Player";

interface IGame extends Document {
  author: Schema.Types.ObjectId;
  challengers: IPlayer[];
  duration: number;
  isComplete: boolean;
  itemsFound: number;
  items: string[];
  createdAt: Date;
  winner: Schema.Types.ObjectId;
}

const GameSchema = new Schema<IGame>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  challengers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: false,
    },
  ],
  duration: {
    type: Number,
    required: false,
  },
  isComplete: {
    type: Boolean,
    required: true,
  },
  itemsFound: {
    type: Number,
    required: false,
  },
  items: [
    {
      type: String,
      required: false,
    },
  ],
  winner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

const Game = model("Game", GameSchema);

export default Game;
