import generateToken from "../../utils/generateToken";
import Redis from "@ioc:Adonis/Addons/Redis";

export class AuthService {
  async authenticate(uid: string): Promise<string> {
    const token: string = generateToken();
    await Redis.set(`token:${token}`, uid, "EX", 60 * 60 * 24 * 30);
    return token;
  }

  async verify(t: string) {
    const userId: string | null = await Redis.get(`token:${t}`);
    if (!userId) {
      throw new Error("Invalid token");
    }
    return userId;
  }

  async revoke(t: string) {
    await Redis.del(`token:${t}`);
  }
}
