import { Schema } from "mongoose";

export interface IPlayer {
  userId: Schema.Types.ObjectId; // Reference to User _id
  score: number;
  isReady: boolean;
  isHost?: boolean;
}

// Player is a subdocument of the Game document
export const PlayerSchema = new Schema<IPlayer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
    required: false,
  },
});
