import UserLogin from "./UserLogin.ts";

export interface SignUpData extends UserLogin {
  email: string;
}
