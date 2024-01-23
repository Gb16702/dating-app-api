import { DateTime } from "luxon";

export function isOlderThan18(dateOfBirthString: string): boolean {
  const dateOfBirth = DateTime.fromISO(dateOfBirthString);
  const now = DateTime.now();
  const age = now.diff(dateOfBirth, "years").years;
  return age >= 18;
}
