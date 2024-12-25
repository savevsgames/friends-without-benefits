import { Schema, model, Document } from "mongoose";

export interface IPlayer extends Document {
  user: Schema.Types.ObjectId; // User Model reference
  score: number;
  isReady: boolean;
  isHost: boolean;
}

const playerSchema = new Schema<IPlayer>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: { type: Number, default: 0 },
  isReady: { type: Boolean, default: false },
  isHost: { type: Boolean, default: false },
});

const Player = model<IPlayer>("Player", playerSchema);

export default Player;
