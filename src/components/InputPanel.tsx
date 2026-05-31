import React from "react";
import { PreflightInputs } from "../types";
import { Plane, Compass, Cloud, FileText, Scale, Award, Calendar } from "lucide-react";
import { computeFARCurrency } from "../utils/currency";

interface InputPanelProps {
  inputs: PreflightInputs;
  onChange: (inputs: PreflightInputs) => void;
  onLoadPreset: (preset: { preflight: PreflightInputs; wearable: any }) => void;
}

const PRESET_SCENARIOS = [
  {
    name: "Scenario A: Mild VFR (Seattle to Portland)",
    description: "Clear skies, current pilot, well-rested metrics.",
    preset: {
      preflight: {
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
      },
      wearable: {
        sleepHours: 7.5,
        hoursAwake: 3.5,
        restingHeartRate: 62,
        hrv: 78,
        hoursOnDuty: 2,
      },
    },
  },
  {
    name: "Scenario B: Fatigued Coast IFR (New York to Boston)",
    description: "Marginal weather, ILS outage, lapsed currency, fatigue.",
    preset: {
      preflight: {
        departure: "KJFK",
        destination: "KBOS",
        aircraftType: "Piper PA-28-181 Cherokee Archer",
        weatherNotes: "KJFK OVC008 3SM -RA BR Temp 12/11 A2986. KBOS terminal forecast: IFR condition OVC004 2SM Fog, crosswinds at Boston runway 22L at 18KT.",
        notamNotes: "KBOS NOTAM: ILS Runway 4R Out of Service. Runway 33L PAPIs out of service. Cranberry MOA active along route.",
        weightBalanceFuel: "Fuel: 36 Gallons (Borderline with holding reserves). Weight: 2,545 lbs (Max Gross 2,550 lbs). CG near aft limit.",
        pilotHours: 115,
        last3DayTakeoffsLandings: "2026-03-05",
        last3NightTakeoffsLandings: "2026-02-15",
        lastInstrumentCurrency: "2025-11-05",
      },
      wearable: {
        sleepHours: 4.8,
        hoursAwake: 14.5,
        restingHeartRate: 84,
        hrv: 24,
        hoursOnDuty: 9.5,
      },
    },
  },
  {
    name: "Scenario C: Mountain Cross-Country (Denver to Aspen)",
    description: "High density altitude, mountain passes, elevated pilot stress.",
    preset: {
      preflight: {
        departure: "KAPA",
        destination: "KASE",
        aircraftType: "Cessna 182T Skylane (N182RG)",
        weatherNotes: "KAPA 311700Z 22012G18KT 10SM CLR Temp 28/05 A2992 (High DA). Destination KASE reporting moderate gusts, turbulence reported over mountain passes below 14,000ft.",
        notamNotes: "KASE NOTAM: Mountain wave activity expected. High terrain in all quadrants. Runway 15 visual absolute climb requirements apply.",
        weightBalanceFuel: "Fuel: 64 Gallons (Max). Weight: 2,980 lbs (Max Gross 3,100 lbs). Density altitude at Denver is 8,200ft.",
        pilotHours: 850,
        last3DayTakeoffsLandings: "2026-04-10",
        last3NightTakeoffsLandings: "2026-04-05",
        lastInstrumentCurrency: "2025-12-15",
      },
      wearable: {
        sleepHours: 5.5,
        hoursAwake: 8.0,
        restingHeartRate: 74,
        hrv: 41,
        hoursOnDuty: 5.5,
      },
    }
  }
];

export const InputPanel: React.FC<InputPanelProps> = ({ inputs, onChange, onLoadPreset }) => {

  const handleFieldChange = (key: keyof PreflightInputs, value: any) => {
    onChange({
      ...inputs,
      [key]: value
    });
  };

  return (
    <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-3 hover:border-brand-cyan/30 transition-all shadow-md flex flex-col h-full" id="preflight-input-panel">
      
      {/* Title & Consolidation Statement */}
      <div className="flex flex-col mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
          <h2 className="text-[10px] font-semibold tracking-wider font-mono text-[#00F0FF] uppercase">
            01 // CONSOLIDATION TERMINAL
          </h2>
        </div>
        <h1 className="text-sm font-bold font-display text-[#E0E6ED] tracking-tight">
          "ONE BRIEF, NOT 14 TABS"
        </h1>
        <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">
          Skip weather cameras, active NOTAM files, and paper mass charts. Load a preset below:
        </p>
      </div>

      {/* Preset Loading Dock */}
      <div className="bg-[#0A0D12] p-2 rounded-sm border border-[#2D3848] mb-3 relative overflow-hidden">
        <p className="text-[9px] font-mono text-[#00F0FF] uppercase tracking-widest font-bold mb-1.5">
          LOAD FLYING SCENARIO PRESETS:
        </p>
        <div className="flex flex-col gap-1">
          {PRESET_SCENARIOS.map((scenario, index) => (
            <button
              id={`preset-btn-${index}`}
              key={index}
              onClick={() => onLoadPreset(scenario.preset)}
              className="text-left w-full px-2 py-1 rounded-sm bg-[#11161D] hover:bg-[#1B222C] border border-[#2D3848] hover:border-brand-cyan/40 text-[10px] transition-all flex items-start gap-1.5 group"
            >
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2D3848] group-hover:bg-[#00F0FF] shrink-0 transition-colors"></div>
              <div>
                <span className="font-semibold text-slate-200 group-hover:text-brand-cyan block">
                  {scenario.name}
                </span>
                <span className="text-[9px] text-[#64748B] block mt-0.5 line-clamp-1">
                  {scenario.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="space-y-3 flex-1">
        
        {/* Route Row: Departure & Destination */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="departure-airport">
              DEPARTURE ICAO
            </label>
            <div className="relative">
              <Compass className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
              <input
                id="departure-airport"
                type="text"
                placeholder="e.g. KSEA"
                maxLength={4}
                value={inputs.departure}
                onChange={(e) => handleFieldChange("departure", e.target.value.toUpperCase())}
                className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm font-mono text-xs text-[#E0E6ED] focus:outline-none focus:border-brand-cyan uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="destination-airport">
              DESTINATION ICAO
            </label>
            <div className="relative">
              <Compass className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
              <input
                id="destination-airport"
                type="text"
                placeholder="e.g. KPDX"
                maxLength={4}
                value={inputs.destination}
                onChange={(e) => handleFieldChange("destination", e.target.value.toUpperCase())}
                className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm font-mono text-xs text-[#E0E6ED] focus:outline-none focus:border-brand-cyan uppercase"
              />
            </div>
          </div>
        </div>

        {/* Aircraft Type */}
        <div>
          <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="aircraft-model">
            AIRCRAFT MODEL & TAIL
          </label>
          <div className="relative">
            <Plane className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
            <input
              id="aircraft-model"
              type="text"
              placeholder="e.g. Cessna 172S (N172SP)"
              value={inputs.aircraftType}
              onChange={(e) => handleFieldChange("aircraftType", e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-xs text-[#E0E6ED] focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        {/* Weather Observations */}
        <div>
          <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="weather-obs">
            WEATHER (METAR, TAF, TOPO FORECAST)
          </label>
          <div className="relative">
            <Cloud className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
            <textarea
              id="weather-obs"
              placeholder="Paste METARs, winds aloft, forecasts, or convective advisories..."
              rows={2}
              value={inputs.weatherNotes}
              onChange={(e) => handleFieldChange("weatherNotes", e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] text-[#E0E6ED] focus:outline-none focus:border-brand-cyan resize-none h-14 font-mono"
            />
          </div>
        </div>

        {/* NOTAMs & airspace Restrictions */}
        <div>
          <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="notam-rest">
            NOTAMS & AIRSPACE RESTRICTIONS (TFRs)
          </label>
          <div className="relative">
            <FileText className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
            <textarea
              id="notam-rest"
              placeholder="Closed runways, active TFR areas, MOAs along flight path..."
              rows={2}
              value={inputs.notamNotes}
              onChange={(e) => handleFieldChange("notamNotes", e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] text-[#E0E6ED] focus:outline-none focus:border-brand-cyan resize-none h-12 font-mono"
            />
          </div>
        </div>

        {/* Weight & Balance + Fuel */}
        <div>
          <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="weight-balance-fuel">
            WEIGHT & BALANCE, FUEL ON BOARD
          </label>
          <div className="relative">
            <Scale className="absolute left-2 top-2 w-3.5 h-3.5 text-[#64748B]" />
            <input
              id="weight-balance-fuel"
              type="text"
              placeholder="Fuel: 40 gal, Takeoff Weight: 2400 lbs, CG index..."
              value={inputs.weightBalanceFuel}
              onChange={(e) => handleFieldChange("weightBalanceFuel", e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] text-[#E0E6ED] focus:outline-none focus:border-brand-cyan font-mono"
            />
          </div>
        </div>

        {/* Pilot Experience, Currency Indicators, & Sliders grouped */}
        <div className="space-y-2 pt-2 border-t border-[#2D3848]/60">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#A0AEC0]">
              PILOT TOTAL EXPERIENCE
            </span>
          </div>
          
          <div>
            <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider mb-0.5" htmlFor="pilot-logged-hours">
              PILOT TOTAL LOGGED FLIGHT HOURS
            </label>
            <input
              id="pilot-logged-hours"
              type="number"
              placeholder="e.g. 350"
              value={inputs.pilotHours || ""}
              onChange={(e) => handleFieldChange("pilotHours", parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] font-mono text-[#E0E6ED] focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        {/* Currency Dates with live indicator calculations */}
        <div className="space-y-2 pt-2 border-t border-[#2D3848]/60">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#A0AEC0]">
              CURRENCY LIVE RISK SIGNALS (FAR 61.57)
            </span>
          </div>

          {/* Day Passenger Currency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider" htmlFor="day-currency">
                Last 3 Day Takeoffs/Landings
              </label>
              {(() => {
                const currency = computeFARCurrency(
                  inputs.last3DayTakeoffsLandings,
                  inputs.last3NightTakeoffsLandings,
                  inputs.lastInstrumentCurrency
                );
                const status = currency.day.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono"
                };
                return <span className={badges[status]}>{currency.day.text}</span>;
              })()}
            </div>
            <input
              id="day-currency"
              type="date"
              value={inputs.last3DayTakeoffsLandings}
              onChange={(e) => handleFieldChange("last3DayTakeoffsLandings", e.target.value)}
              className="w-full px-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] font-mono text-[#E0E6ED] focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* Night Passenger Currency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider" htmlFor="night-currency">
                Last 3 Night Full-Stop Landings
              </label>
              {(() => {
                const currency = computeFARCurrency(
                  inputs.last3DayTakeoffsLandings,
                  inputs.last3NightTakeoffsLandings,
                  inputs.lastInstrumentCurrency
                );
                const status = currency.night.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono"
                };
                return <span className={badges[status]}>{currency.night.text}</span>;
              })()}
            </div>
            <input
              id="night-currency"
              type="date"
              value={inputs.last3NightTakeoffsLandings}
              onChange={(e) => handleFieldChange("last3NightTakeoffsLandings", e.target.value)}
              className="w-full px-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] font-mono text-[#E0E6ED] focus:outline-none focus:border-brand-cyan"
            />
          </div>

          {/* Instrument Currency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-wider" htmlFor="ifr-currency">
                Last IFR (6 Appr + Holds)
              </label>
              {(() => {
                const currency = computeFARCurrency(
                  inputs.last3DayTakeoffsLandings,
                  inputs.last3NightTakeoffsLandings,
                  inputs.lastInstrumentCurrency
                );
                const status = currency.instrument.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] px-1 py-0.5 rounded-sm uppercase font-mono"
                };
                return <span className={badges[status]}>{currency.instrument.text}</span>;
              })()}
            </div>
            <input
              id="ifr-currency"
              type="date"
              value={inputs.lastInstrumentCurrency}
              onChange={(e) => handleFieldChange("lastInstrumentCurrency", e.target.value)}
              className="w-full px-2 py-1 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] font-mono text-[#E0E6ED] focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
