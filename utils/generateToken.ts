import { randomUUID } from "crypto";

export default function generateToken(): string {
    return randomUUID();
}
