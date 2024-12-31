import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  friends: Schema.Types.ObjectId[];
  shortestRound: Schema.Types.ObjectId;
  avatar: string;
  isCorrectPw(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    shortestRound: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// set up pre-save middleware to create password
userSchema.pre<IUser>("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});
// compare incoming password with the existing hashed password
userSchema.methods.isCorrectPw = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = model<IUser>("User", userSchema);

export default User;
