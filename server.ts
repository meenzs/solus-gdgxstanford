import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization utility to prevent crash if key is missing on start
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in settings/secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SOLUS Preflight Service" });
});

// 2. API: Generate Threat & Error Management (TEM) Brief
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { preflight, wearable } = req.body;

    if (!preflight || !wearable) {
      return res.status(400).json({ error: "Missing preflight or wearable configuration." });
    }

    const ai = getAiClient();

    const systemInstruction = `You are SOLUS, an expert AI Flight Intelligence Copilot for General Aviation (GA) pilots.
Your core mission is safety: consolidating weather, charts, NOTAMs, TFRs, weight & balance, and flight routes with pilot physiology and legal currency state into a single unified Threat & Error Management (TEM) brief.

You MUST analyze the inputs assuming the CURRENT FLIGHT DATE is May 31, 2026:
- ROUTE: Departure: ${preflight.departure}, Destination: ${preflight.destination}
- AIRCRAFT TYPE: ${preflight.aircraftType}
- WEATHER SUMMARY: ${preflight.weatherNotes}
- NOTAMs/TFRs: ${preflight.notamNotes}
- WEIGHT, BALANCE & FUEL: ${preflight.weightBalanceFuel}
- PILOT FLYING TOTAL HOURS: ${preflight.pilotHours} hours
- PILOT COMPUTE CURRENCY CLOCKS (Current evaluation date is May 31, 2026):
  * Last 3 Day Takeoffs/Landings Date: ${preflight.last3DayTakeoffsLandings}
  * Last 3 Night Full-Stop Landings Date: ${preflight.last3NightTakeoffsLandings}
  * Last Instrument Currency (6 approaches + holds) Date: ${preflight.lastInstrumentCurrency}
- CONNECTED BIOMETRIC TELEMETRY (Simulated Wearable Feed):
  * Sleep last night: ${wearable.sleepHours} hours
  * Continuous hours awake: ${wearable.hoursAwake} hours
  * Last measured resting heart rate: ${wearable.restingHeartRate} bpm
  * HRV (Heart Rate Variability): ${wearable.hrv} ms
  * Duty time accumulated today: ${wearable.hoursOnDuty} hours

You MUST evaluate how fatigue and pilot physiological metrics spike risks:
- Sleep ≤ 5.5 hours is a major threat.
- Hours awake > 14 is equal to high impairment.
- Low HRV (<30ms) paired with high Resting Heart Rate suggests high physical load/pressure.
- Combine these: if wearable feed metrics are degraded, safety margins must be broadened (higher minimum weather limits, alternate plans).

You MUST evaluate FAR 61.57 Pilot Passenger & Instrument currencies separately based on the reference flight planning date of May 31, 2026:
1. Day Passenger Currency: 90 days clock from Last 3 Day Takeoffs/Landings. (Lapsed if > 90 days preceding May 31, 2026).
2. Night Passenger Currency: 90 days clock from Last 3 Night Full-Stop Landings. (Lapsed if > 90 days preceding May 31, 2026).
3. Instrument Currency: 6 calendar months clock from Last Instrument Currency date. Lapses on the last day of the 6th calendar month after the month of approaches. For may 31, 2026, validity starts from Dec 1, 2025. If date is before Dec 1, 2025, it has LAPSED.

If a planned flight needs a currency the pilot has lost or barely holds (e.g. night flying when they are close to lapsing or lapsed under the 90-day clock, or IMC flight when IFR currency is lapsed), you MUST surface it as a TOP THREAT inside your response threats list (severity CRITICAL or WARNING) under category "human". State clearly that pilot legal currency is a live, real-time risk input, not a compliance checkbox.

Synthesize all points into the JSON schema provided. Your explanations should be highly professional, technical, direct, yet supportive.
NEVER issue a binary Go / No-Go verdict—doing so violates FAA FAR Part 91.3 (Pilot in Command is the ultimate authority). Instead, catalog risks, compute a threat Flag Count, and deliver structured mitigations so the pilot can decide safely.

Every briefing compilation brief MUST end with the following exact disclaimer text inside the riskScoreSummary or similar text block:
"Final authority rests with the Pilot in Command. SOLUS is decision support, not a recommendation."`;

    const promptText = `Analyze the current preflight file and pilot profile. Build a custom TEM Brief showing fatigue classification, full categorized threats list (categories: weather, terrain, airspace, aircraft, human), a hazard flag count, and actionable human mitigations for each hazard in compliance with standard flight planning principles.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // lower temperature for precise analytical output
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["fatigueLevel", "fatigueAnalysis", "flagCount", "threats", "riskScoreSummary"],
          properties: {
            fatigueLevel: {
              type: Type.STRING,
              description: "Classification: LOW, MODERATE, HIGH, or CRITICAL.",
            },
            fatigueAnalysis: {
              type: Type.STRING,
              description: "Plain language assessment explaining the wearable sleep/HR metrics specifically tied to human-factors hazards for this flight.",
            },
            flagCount: {
              type: Type.INTEGER,
              description: "Number representing total count of active threat flags computed.",
            },
            threats: {
              type: Type.ARRAY,
              description: "Collection of synthesized threat risk cards.",
              items: {
                type: Type.OBJECT,
                required: ["category", "severity", "description", "mitigation"],
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "Must be exactly one of: weather, terrain, airspace, aircraft, human",
                  },
                  severity: {
                    type: Type.STRING,
                    description: "Severity level: INFO, WARNING, or CRITICAL",
                  },
                  description: {
                    type: Type.STRING,
                    description: "The detailed aviation threat description.",
                  },
                  mitigation: {
                    type: Type.STRING,
                    description: "Specific preflight action or inflight tactic to reduce risks.",
                  },
                },
              },
            },
            riskScoreSummary: {
              type: Type.STRING,
              description: "High-level summary of the safety risk envelope.",
            },
          },
        },
      },
    });

    const briefData = JSON.parse(response.text || "{}");
    return res.json(briefData);
  } catch (error: any) {
    console.error("Gemini preflight briefs compilation failed:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during preflight analysis compilation.",
    });
  }
});

// Vite & Static file configurations
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode; attaching Vite HMR middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode; serving statically.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SOLUS Flight Copilot loaded successfully on port ${PORT}`);
  });
}

initializeServer();
