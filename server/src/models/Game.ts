import { Schema, model, Document, Types } from "mongoose";

interface IChallenger {
  user: Types.ObjectId; // references a User document
  score: number;
  isReady: boolean;
  isHost?: boolean;
}

interface IGame extends Document {
  author: Schema.Types.ObjectId;
  challengers: IChallenger[];
  duration: number;
  isComplete: boolean;
  itemsFound: number;
  items: string[];
  createdAt: Date;
  winner: Schema.Types.ObjectId;
}

const ChallengerSchema = new Schema<IChallenger>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // <— .populate("challengers.user")
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  isReady: {
    type: Boolean,
    default: false,
  },
  isHost: {
    type: Boolean,
    default: false,
  },
});

const GameSchema = new Schema<IGame>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  challengers: [ChallengerSchema],
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
