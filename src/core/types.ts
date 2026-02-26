export type Planet =
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export type LuminousBody = Planet | "Sun" | "Moon";

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type MoonPhaseName =
  | "New Moon"
  | "First Quarter"
  | "Full Moon"
  | "Last Quarter";

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface MoonPhaseEvent {
  name: MoonPhaseName;
  date: Date;
  longitude: number;
  sign: ZodiacSign;
}

export interface SignIngress {
  planet: LuminousBody;
  sign: ZodiacSign;
  date: Date;
  prevSign: ZodiacSign;
}

export interface RetrogradeStation {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  startSign: ZodiacSign;
  endSign: ZodiacSign;
  startLongitude: number;
  endLongitude: number;
}

export interface EclipseEvent {
  type: "solar" | "lunar";
  kind: string;
  date: Date;
  magnitude?: number;
  obscuration?: number;
}

export interface PlanetaryAspect {
  body1: LuminousBody;
  body2: LuminousBody;
  aspect: AspectType;
  orb: number;
  date: Date;
}

export interface CommonOptions {
  from: string;
  to: string;
  json: boolean;
}
