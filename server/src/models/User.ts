import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  friends: Schema.Types.ObjectId[];
  shortestRound: Schema.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
      }
    ],
    shortestRound: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: false
    }
  },
  {
    timestamps: true
  }
);

const User = model<IUser>("User", userSchema);

export default User;
