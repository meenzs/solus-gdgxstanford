import React, { useState, useEffect } from "react";
import { PreflightInputs, WearableInputs, BriefResponse, LoggedDecision } from "./types";
import { InputPanel } from "./components/InputPanel";
import { WearableFeed } from "./components/WearableFeed";
import { BriefOutput } from "./components/BriefOutput";
import { RiskProfile } from "./components/RiskProfile";
import { Compass, Clock, ShieldAlert, Cpu, Database, Flame } from "lucide-react";

export default function App() {
  // 1. Preflight consolidation input state with clean default values
  const [preflightInputs, setPreflightInputs] = useState<PreflightInputs>({
    departure: "KSEA",
    destination: "KPDX",
    aircraftType: "Cessna 172S Skyhawk (N172SP)",
    weatherNotes: "KSEA 311653Z 19007KT 10SM CLR 15/08 A3012. Destination KPDX is reporting 10SM scattered clouds at 5,000ft, wind calm.",
    notamNotes: "KPDX NOTAM: Taxiway Bravo closed for resurfacing. TFR in effect 12 NM East of route for active forest fire recovery below 4,000ft.",
    weightBalanceFuel: "Fuel: 42 Gallons (Full). Weight: 2,350 lbs (Max Gross 2,550 lbs). Center of Gravity within standard flight envelope.",
    pilotHours: 320,
    last3DayTakeoffsLandings: "2026-05-15",
    last3NightTakeoffsLandings: "2026-05-10",
    lastInstrumentCurrency: "2026-04-20",
  });

  // 2. Mock connected wearables biometrics state
  const [wearableInputs, setWearableInputs] = useState<WearableInputs>({
    sleepHours: 7.5,
    hoursAwake: 3.5,
    restingHeartRate: 62,
    hrv: 78,
    hoursOnDuty: 2,
  });

  // 3. Gemini Briefing Output data & status states
  const [briefResponse, setBriefResponse] = useState<BriefResponse | null>(null);
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  // 4. Command decision logging state (synced with localStorage)
  const [decisionLogs, setDecisionLogs] = useState<LoggedDecision[]>([]);
  const [isLoggedForCurrentBrief, setIsLoggedForCurrentBrief] = useState<boolean>(false);

  // 5. Digital Zulu Clock ticking state
  const [zuluTime, setZuluTime] = useState<string>(
    new Date().toISOString().replace("T", " ").substring(0, 19) + "Z"
  );

  // Sync Zulu Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setZuluTime(new Date().toISOString().replace("T", " ").substring(0, 19) + "Z");
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate decision logs from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("solus_preflight_logs");
      if (stored) {
        setDecisionLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to rehydrate local EFB flight decision history:", e);
    }
  }, []);

  // Update presets handler
  const handleLoadPreset = (scenarioPreset: { preflight: PreflightInputs; wearable: WearableInputs }) => {
    setPreflightInputs(scenarioPreset.preflight);
    setWearableInputs(scenarioPreset.wearable);
    setBriefResponse(null); // Clear active brief on load so they can see the change
    setIsLoggedForCurrentBrief(false);
    setBriefError(null);
  };

  // API Call: Request AI TEM briefing compilation from Gemini
  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    setBriefError(null);
    setBriefResponse(null);
    setIsLoggedForCurrentBrief(false);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preflight: preflightInputs,
          wearable: wearableInputs,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned response status ${res.status}`);
      }

      const data = await res.json();
      setBriefResponse(data);
    } catch (error: any) {
      console.error("Preflight briefing dispatch failed:", error);
      setBriefError(error.message || "An unexpected network error interrupted the intelligence briefing compilation.");
    } finally {
      setLoadingBrief(false);
    }
  };

  // Log command decision handler
  const handleLogDecision = (pilotChoice: string, pilotNotes: string) => {
    if (!briefResponse) return;

    const newLogItem: LoggedDecision = {
      id: "log_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      departure: preflightInputs.departure,
      destination: preflightInputs.destination,
      aircraftType: preflightInputs.aircraftType,
      sleepHours: wearableInputs.sleepHours,
      hoursAwake: wearableInputs.hoursAwake,
      restingHeartRate: wearableInputs.restingHeartRate,
      hrv: wearableInputs.hrv,
      hoursOnDuty: wearableInputs.hoursOnDuty,
      flagCount: briefResponse.flagCount,
      fatigueLevel: briefResponse.fatigueLevel,
      pilotChoice: pilotChoice as any,
      pilotNotes: pilotNotes.trim() || undefined,
      last3DayTakeoffsLandings: preflightInputs.last3DayTakeoffsLandings,
      last3NightTakeoffsLandings: preflightInputs.last3NightTakeoffsLandings,
      lastInstrumentCurrency: preflightInputs.lastInstrumentCurrency,
    };

    const updatedLogs = [newLogItem, ...decisionLogs];
    setDecisionLogs(updatedLogs);
    setIsLoggedForCurrentBrief(true);

    try {
      localStorage.setItem("solus_preflight_logs", JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("Failed to commit logged pilot choice to persistent storage:", e);
    }
  };

  // Clear logged decisions history handler
  const handleClearLogs = () => {
    if (window.confirm("Confirm deletion of your personal flight risk profile and behavioral telemetry?")) {
      setDecisionLogs([]);
      setIsLoggedForCurrentBrief(false);
      try {
        localStorage.removeItem("solus_preflight_logs");
      } catch (e) {
        console.error("Failed to clear local decision archive:", e);
      }
    }
  };

  return (
    <div className="min-h-screen text-[#E0E6ED] bg-[#0A0D12] p-2 md:p-4 lg:p-6 flex flex-col justify-between" id="solus-root-dashboard">
      
      {/* Glare/Ambient lights in cockpit margins */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#FF3D00]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full space-y-4">
        
        {/* COCKPIT HEADER WITH GPS TELEMETRY & CLOCK */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-3.5 bg-[#11161D] border border-[#2D3848] rounded-sm gap-3.5 backdrop-blur-md relative overflow-hidden" id="cockpit-header">
          {/* Subtle cyan running indicator light */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-cyan/20 via-brand-cyan to-brand-cyan/20"></div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-[#0A0D12] border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-mono font-black tracking-tight text-lg shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              SLS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono font-bold text-brand-cyan tracking-wider bg-brand-cyan/10 px-1.5 py-0.5 border border-brand-cyan/20 rounded-sm uppercase">
                  ACTIVE AIR TRAFFIC COPILOT
                </span>
                <span className="text-[8px] text-[#64748B] font-mono">SYS: NOMINAL</span>
              </div>
              <h1 className="text-base font-bold font-display tracking-tight text-[#E0E6ED] flex items-center gap-1.5">
                SOLUS Flight Intelligence Terminal
              </h1>
            </div>
          </div>

          {/* Connected System Telemetry */}
          <div className="flex flex-wrap items-center gap-2.5 md:gap-4_5">
            <div className="flex items-center gap-2 bg-[#0A0D12] px-2.5 py-1 rounded-sm border border-[#2D3848]">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" />
              <div>
                <span className="block text-[7px] font-mono text-[#64748B] uppercase leading-none">Zulu Flight Time (UTC)</span>
                <span className="text-[10px] font-mono text-[#E0E6ED] tracking-wider font-bold">
                  {zuluTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#0A0D12] px-2 py-0.5 rounded-sm border border-[#2D3848] text-[8px] font-mono text-[#64748B] uppercase">
              <span className="w-1 h-1 rounded-full bg-brand-cyan animate-pulse"></span>
              GPS LOCK
            </div>

            <div className="flex items-center gap-1 bg-[#0A0D12] px-2 py-0.5 rounded-sm border border-[#2D3848] text-[8px] font-mono text-[#64748B] uppercase">
              <span className="w-1 h-1 rounded-full bg-brand-cyan animate-pulse"></span>
              EFB LINK (G1000)
            </div>
          </div>
        </header>

        {/* THREE CORE INPUTS SECTIONS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="three-sections-cockpit-grid">
          
          {/* SEC 1: Preflight Data consolidation Panel */}
          <InputPanel 
            inputs={preflightInputs} 
            onChange={setPreflightInputs} 
            onLoadPreset={handleLoadPreset} 
          />

          {/* SEC 2: Wearables Biometrics Mock Sliders */}
          <WearableFeed 
            wearable={wearableInputs} 
            onChange={setWearableInputs} 
          />

          {/* SEC 3: Personal Risk Profile behavioral dataset */}
          <RiskProfile 
            logs={decisionLogs} 
            onClearLogs={handleClearLogs} 
          />

        </section>

        {/* GENERATE BRIEF CTA CENTER */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#11161D] border border-[#2D3848] rounded-sm gap-2.5 backdrop-blur-sm shadow-md" id="generate-brief-cta-panel">
          <p className="text-[10px] text-[#64748B] max-w-lg text-center leading-relaxed">
            Ready to compute? SOLUS uses <strong className="text-brand-cyan">Gemini AI</strong> to combine route navigation plans, METAR air pressures, airport runway NOTAMs, and sleep factors into a unified hazard briefing.
          </p>
          
          <button
            id="generate-brief-submit-btn"
            onClick={handleGenerateBrief}
            disabled={loadingBrief}
            className={`w-full max-w-sm py-2.5 px-4 rounded-sm font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] active:scale-[0.99] ${
              loadingBrief 
                ? 'bg-[#0A0D12] text-[#64748B] cursor-not-allowed border border-[#2D3848]' 
                : 'bg-brand-cyan hover:brightness-110 text-[#0A0D12] hover:scale-[1.01]'
            }`}
          >
            {loadingBrief ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#64748B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                COMPILING FLIGHT INTELLIGENCE...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                GENERATE CO-COCKPIT INTEL
              </>
            )}
          </button>
        </div>

        {/* PREFLIGHT INTEL BRIEF REVEAL SECTION */}
        <div className="mt-1 text-[#E0E6ED]" id="briefing-outcome-display">
          <div className="border border-[#2D3848] rounded-sm bg-[#11161D]/50 p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-3 pb-1.5 border-b border-[#2D3848]/60">
              <Flame className="w-4 h-4 text-brand-cyan animate-pulse" />
              <h2 className="text-[10px] font-mono tracking-widest text-brand-cyan uppercase font-bold">
                CO-COPILOT PREFLIGHT BRIEF DECK
              </h2>
            </div>
            
            <BriefOutput 
              brief={briefResponse} 
              loading={loadingBrief} 
              error={briefError} 
              onLogDecision={handleLogDecision}
              isLogged={isLoggedForCurrentBrief}
              preflightInputs={preflightInputs}
            />
          </div>
        </div>

      </div>

      <footer className="max-w-7xl mx-auto w-full text-center mt-6 mb-2 text-[9px] font-mono text-[#64748B] uppercase tracking-widest border-t border-[#2D3848] pt-3 flex flex-col sm:flex-row justify-between items-center gap-1">
        <span>SOLUS DIGITAL COPILOT COCKPIT v2.4.0</span>
        <span>CRAFTED IN GLASS-INSTRUMENT COMPLIANCE</span>
      </footer>

    </div>
  );
}
