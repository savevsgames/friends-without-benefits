import { Schema, model, Document} from "mongoose";

interface Auth extends Document {
  token: string,
  user: Schema.Types.ObjectId,
}

const AuthSchema = new Schema<Auth>(
  {
    token: {
      type: String
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  }
)

const Auth = model<Auth>("Auth", AuthSchema);

export default Auth;
