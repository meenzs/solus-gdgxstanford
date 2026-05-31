export interface PreflightInputs {
  departure: string;
  destination: string;
  aircraftType: string;
  weatherNotes: string;
  notamNotes: string;
  weightBalanceFuel: string;
  pilotHours: number;
  last3DayTakeoffsLandings: string; // "YYYY-MM-DD"
  last3NightTakeoffsLandings: string; // "YYYY-MM-DD"
  lastInstrumentCurrency: string; // "YYYY-MM-DD"
}

export interface WearableInputs {
  sleepHours: number;      // e.g. 4 to 12
  hoursAwake: number;      // e.g. 1 to 24
  restingHeartRate: number;// e.g. 40 to 120
  hrv: number;             // e.g. 10 to 150
  hoursOnDuty: number;     // e.g. 0 to 16
}

export interface Threat {
  category: "weather" | "terrain" | "airspace" | "aircraft" | "human";
  severity: "INFO" | "WARNING" | "CRITICAL";
  description: string;
  mitigation: string;
}

export interface BriefResponse {
  fatigueLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  fatigueAnalysis: string;
  flagCount: number;
  threats: Threat[];
  riskScoreSummary: string;
}

export interface LoggedDecision {
  id: string;
  timestamp: string;
  departure: string;
  destination: string;
  aircraftType: string;
  sleepHours: number;
  hoursAwake: number;
  restingHeartRate: number;
  hrv: number;
  hoursOnDuty: number;
  flagCount: number;
  fatigueLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  pilotChoice: "GO_AS_PLANNED" | "GO_WITH_MITIGATIONS" | "DELAY_FLIGHT" | "CANCEL_FLIGHT";
  pilotNotes?: string;
  last3DayTakeoffsLandings: string;
  last3NightTakeoffsLandings: string;
  lastInstrumentCurrency: string;
}
