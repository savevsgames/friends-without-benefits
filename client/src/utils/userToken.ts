import { jwtDecode } from "jwt-decode";
import auth from "./auth.ts";

export const getUserIdFromToken = () => {
    const token = auth.getToken();
    if (!token) {
        return null
    }
    const decoded: { id: number } = jwtDecode(token);
    return decoded.id;
}