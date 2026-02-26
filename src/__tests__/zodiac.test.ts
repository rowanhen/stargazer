import { describe, test, expect } from "bun:test";
import { longitudeToSign } from "../core/zodiac.js";

describe("longitudeToSign", () => {
  test("0° is Aries", () => {
    expect(longitudeToSign(0)).toBe("Aries");
  });

  test("29.9° is Aries", () => {
    expect(longitudeToSign(29.9)).toBe("Aries");
  });

  test("30° is Taurus", () => {
    expect(longitudeToSign(30)).toBe("Taurus");
  });

  test("60° is Gemini", () => {
    expect(longitudeToSign(60)).toBe("Gemini");
  });

  test("90° is Cancer", () => {
    expect(longitudeToSign(90)).toBe("Cancer");
  });

  test("120° is Leo", () => {
    expect(longitudeToSign(120)).toBe("Leo");
  });

  test("150° is Virgo", () => {
    expect(longitudeToSign(150)).toBe("Virgo");
  });

  test("180° is Libra", () => {
    expect(longitudeToSign(180)).toBe("Libra");
  });

  test("210° is Scorpio", () => {
    expect(longitudeToSign(210)).toBe("Scorpio");
  });

  test("240° is Sagittarius", () => {
    expect(longitudeToSign(240)).toBe("Sagittarius");
  });

  test("270° is Capricorn", () => {
    expect(longitudeToSign(270)).toBe("Capricorn");
  });

  test("300° is Aquarius", () => {
    expect(longitudeToSign(300)).toBe("Aquarius");
  });

  test("330° is Pisces", () => {
    expect(longitudeToSign(330)).toBe("Pisces");
  });

  test("359.9° is Pisces", () => {
    expect(longitudeToSign(359.9)).toBe("Pisces");
  });

  test("360° wraps back to Aries", () => {
    expect(longitudeToSign(360)).toBe("Aries");
  });

  test("390° wraps to Taurus", () => {
    expect(longitudeToSign(390)).toBe("Taurus");
  });
});
