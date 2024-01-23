import Hash from "@ioc:Adonis/Core/Hash";

type isPasswordValidParmas = {
  hashedPassword: string;
  plainTextPassword: string;
};

export async function isPasswordValid({
  hashedPassword,
  plainTextPassword,
}: isPasswordValidParmas): Promise<boolean> {
  return await Hash.verify(hashedPassword, plainTextPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return await Hash.make(password);
}