import type { ZodiacSign } from "./types.js";

export const SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export function longitudeToSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(normalized / 30)];

  if (sign === undefined) {
    throw new RangeError(`Could not map longitude ${longitude} to a zodiac sign.`);
  }

  return sign;
}

export function signBoundary(signIndex: number): number {
  return signIndex * 30;
}
