import { jwtDecode } from "jwt-decode";

interface UserToken {
  name: string;
  exp: number;
}

class AuthService {
  //get user data
  getProfile() {
    return jwtDecode(this.getToken() || "");
  }
  // check if the user is logged in
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
  // check if the user is logged in
  getToken() {
    const token = localStorage.getItem("id_token");
    return token;
  }
  // check if token is expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  login(idToken: string) {
    localStorage.setItem("id_token", idToken);
  }
  logout() {
    localStorage.removeItem("id_token");
  }
}

export default new AuthService();
