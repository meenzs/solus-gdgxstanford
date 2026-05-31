import React, { useState } from "react";
import { BriefResponse, Threat, LoggedDecision, PreflightInputs } from "../types";
import { 
  CloudRain, 
  Mountain, 
  ShieldAlert, 
  Activity, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  CheckSquare, 
  Square,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  PlaneTakeoff,
  XCircle,
  Clock
} from "lucide-react";

import { computeFARCurrency } from "../utils/currency";

interface BriefOutputProps {
  brief: BriefResponse | null;
  loading: boolean;
  error: string | null;
  onLogDecision: (choice: string, notes: string) => void;
  isLogged: boolean;
  preflightInputs: PreflightInputs;
}

export const BriefOutput: React.FC<BriefOutputProps> = ({ 
  brief, 
  loading, 
  error, 
  onLogDecision,
  isLogged,
  preflightInputs
}) => {
  // Pilot checklists state for interactive checking
  const [checkedThreats, setCheckedThreats] = useState<Record<number, boolean>>({});
  // Log Decision overlay state
  const [showLogModal, setShowLogModal] = useState(false);
  const [pilotChoice, setPilotChoice] = useState<string>("GO_WITH_MITIGATIONS");
  const [decisionNotes, setDecisionNotes] = useState("");

  if (loading) {
    return (
      <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-6 text-center flex flex-col items-center justify-center min-h-[380px]" id="brief-output-loading">
        <div className="relative w-16 h-16 mb-4 col-span-1">
          {/* Glowing radar scan animation */}
          <div className="absolute inset-0 rounded-full border border-brand-cyan/10"></div>
          <div className="absolute inset-0 rounded-full border-t border-brand-cyan/80 animate-radar"></div>
          <CompassGlow />
        </div>
        <h3 className="text-sm font-bold font-display text-[#E0E6ED] tracking-widest uppercase">
          SYNCHRONIZING FLIGHT DECK...
        </h3>
        <p className="text-[10px] text-[#64748B] mt-2 max-w-sm leading-relaxed">
          Retrieving meteorological forecasts, computing NOTAM airspace overlaps, analyzing connected biomechanical sleep loads, and generating threat mitigation models...
        </p>
        <div className="mt-4 flex items-center gap-2 bg-brand-cyan/15 px-2.5 py-1 rounded-sm border border-brand-cyan/30">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping"></span>
          <span className="text-[9px] font-mono text-brand-cyan uppercase tracking-widest">
            models/gemini-3.5-flash online
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#11161D] border border-brand-red/40 rounded-sm p-6 text-center flex flex-col items-center justify-center min-h-[380px]" id="brief-output-error">
        <div className="w-10 h-10 rounded-full bg-[#FF3D00]/10 border border-[#FF3D00]/40 flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-[#FF3D00]" />
        </div>
        <h3 className="text-xs font-bold font-display text-rose-200 uppercase tracking-wider">
          Preflight Sync Failed
        </h3>
        <p className="text-[10px] text-[#64748B] mt-2 max-w-md">
          {error}
        </p>
        <p className="text-[9px] text-[#64748B] mt-3 italic">
          Verify you have provided your developer API key inside Settings &gt; Secrets, and check your internet link.
        </p>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="bg-[#11161D] border border-dashed border-[#2D3848] rounded-sm p-6 text-center flex flex-col items-center justify-center min-h-[380px]" id="brief-output-empty">
        <div className="w-10 h-10 hover:scale-105 transition-transform rounded-full bg-[#0A0D12] border border-[#2D3848] flex items-center justify-center mb-3 text-brand-cyan/65">
          <BookOpen className="w-4.5 h-4.5" />
        </div>
        <h3 className="text-xs font-semibold font-mono text-[#E0E6ED] uppercase tracking-widest">
          CO-COCKPIT RADAR DETECTOR STATUS: IDLE
        </h3>
        <p className="text-[10px] text-[#64748B] mt-2 max-w-xs leading-relaxed">
          Input your route data, adjust biometric simulator metrics, and click <strong className="text-brand-cyan">"GENERATE CO-COCKPIT INTEL"</strong> above to compute threats instantly.
        </p>
      </div>
    );
  }

  // Helper to map categories to Icons
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "weather":
        return <CloudRain className="w-3.5 h-3.5 text-brand-cyan" />;
      case "terrain":
        return <Mountain className="w-3.5 h-3.5 text-[#FFAB00]" />;
      case "airspace":
      case "airspace/notam":
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
      case "aircraft":
      case "aircraft/w&b":
        return <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />;
      default:
        return <UserX className="w-3.5 h-3.5 text-[#FFAB00]" />;
    }
  };

  // Helper for color values
  const getFatigueColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return { bg: "bg-[#FF3D00]/5", border: "border-[#FF3D00]/30", text: "text-[#FF3D00]", badge: "bg-[#FF3D00] text-white animate-pulse" };
      case "HIGH":
        return { bg: "bg-[#FFAB00]/5", border: "border-[#FFAB00]/30", text: "text-[#FFAB00]", badge: "bg-[#FFAB00] text-[#0A0D12]" };
      case "MODERATE":
        return { bg: "bg-[#FFAB00]/5", border: "border-[#FFAB00]/20", text: "text-[#FFAB00]", badge: "bg-[#FFAB00]/70 text-[#0A0D12]" };
      default:
        return { bg: "bg-[#00F0FF]/5", border: "border-[#00F0FF]/25", text: "text-[#00F0FF]", badge: "bg-[#00F0FF] text-[#0A0D12]" };
    }
  };

  const fatigueStyle = getFatigueColor(brief.fatigueLevel);
  
  const toggleCheck = (idx: number) => {
    setCheckedThreats(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const totalThreats = brief.threats?.length || 0;
  const checkedCount = Object.values(checkedThreats).filter(Boolean).length;
  const checklistProgress = totalThreats ? Math.round((checkedCount / totalThreats) * 100) : 0;

  const handleOpenLogModal = () => {
    setDecisionNotes("");
    setShowLogModal(true);
  };

  const handleConfirmLog = () => {
    onLogDecision(pilotChoice, decisionNotes);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-4" id="solus-ai-brief-content">
      
      {/* 1. Header & Dynamic Gauge Column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Fatigue & Biometric Analysis Box */}
        <div className={`md:col-span-2 rounded-sm p-4 border ${fatigueStyle.bg} ${fatigueStyle.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-sm font-bold ${fatigueStyle.badge}`}>
              FATIGUE RISK: {brief.fatigueLevel}
            </span>
          </div>
          <h3 className="text-[10px] font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-1">
            Human Factors & Fatigue Readout
          </h3>
          <p className="text-[11px] text-[#E0E6ED] leading-relaxed font-sans">
            {brief.fatigueAnalysis}
          </p>
        </div>

        {/* Flag count circular gauge */}
        <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-3.5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-cyan via-brand-amber to-[#FF3D00]"></div>
          <span className="text-[8px] font-mono font-bold text-[#64748B] tracking-widest uppercase mb-1">
            HAZARD RISK RANGE
          </span>
          <div className="relative flex items-center justify-center w-18 h-18 my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#0A0D12"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke={brief.flagCount > 4 ? "#FF3D00" : brief.flagCount > 2 ? "#FFAB00" : "#00F0FF"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - Math.min(brief.flagCount, 8) / 8)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-[#E0E6ED]">
                {brief.flagCount}
              </span>
              <span className="text-[7px] font-mono text-[#64748B] uppercase tracking-tighter">
                ACTIVE FLAGS
              </span>
            </div>
          </div>
          <span className="text-[8px] leading-tight text-[#64748B] max-w-[130px] mt-1 font-sans">
            Final authority rests with the Pilot in Command.
          </span>
        </div>

      </div>

      {/* 2. CURRENCY AS RISK CLOCKS (FAA FAR 61.57) */}
      <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-4 relative" id="pilot-currency-clocks-panel">
        <div className="absolute top-0 right-0 py-1 px-2.5 bg-[#0A0D12] rounded-bl-sm border-l border-b border-[#2D3848]">
          <span className="text-[7px] font-mono text-brand-cyan uppercase tracking-widest font-bold">
            Live Risk Signal
          </span>
        </div>
        
        <h3 className="text-[10px] font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-cyan" />
          02 // CURRENCY AS RISK CLOCKS (FAA FAR 61.57)
        </h3>

        <p className="text-[10px] text-[#64748B] mb-3 leading-relaxed">
          SOLUS evaluates administrative pilot currencies as active physiological decay envelopes rather than legal compliance checkboxes. Lapsed statuses or tight margins are surfaced as major flight constraints.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Day Passenger Currency */}
          <div className="bg-[#0A0D12] border border-[#2D3848] rounded-sm p-3 flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-mono text-[#64748B] uppercase tracking-wider block">
                90-Day Passenger Day
              </span>
              <strong className="text-[11px] text-slate-200 mt-1 block">
                Last 3 Day T/Os & Landings
              </strong>
              <span className="text-[9px] text-[#64748B] font-mono block mt-0.5">
                {preflightInputs.last3DayTakeoffsLandings}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              {(() => {
                const currency = computeFARCurrency(
                  preflightInputs.last3DayTakeoffsLandings,
                  preflightInputs.last3NightTakeoffsLandings,
                  preflightInputs.lastInstrumentCurrency
                );
                const status = currency.day.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold"
                };
                return <span className={badges[status]}>{currency.day.text}</span>;
              })()}
            </div>
          </div>

          {/* Night Passenger Currency */}
          <div className="bg-[#0A0D12] border border-[#2D3848] rounded-sm p-3 flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-mono text-[#64748B] uppercase tracking-wider block">
                90-Day Passenger Night (Full-Stop)
              </span>
              <strong className="text-[11px] text-slate-200 mt-1 block">
                Last 3 Night T/Os & Landings
              </strong>
              <span className="text-[9px] text-[#64748B] font-mono block mt-0.5">
                {preflightInputs.last3NightTakeoffsLandings}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              {(() => {
                const currency = computeFARCurrency(
                  preflightInputs.last3DayTakeoffsLandings,
                  preflightInputs.last3NightTakeoffsLandings,
                  preflightInputs.lastInstrumentCurrency
                );
                const status = currency.night.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold"
                };
                return <span className={badges[status]}>{currency.night.text}</span>;
              })()}
            </div>
          </div>

          {/* Instrument Currency */}
          <div className="bg-[#0A0D12] border border-[#2D3848] rounded-sm p-3 flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-mono text-[#64748B] uppercase tracking-wider block">
                6-Month IFR Rating
              </span>
              <strong className="text-[11px] text-slate-200 mt-1 block">
                Last 6 Approaches & Holds
              </strong>
              <span className="text-[9px] text-[#64748B] font-mono block mt-0.5">
                {preflightInputs.lastInstrumentCurrency}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              {(() => {
                const currency = computeFARCurrency(
                  preflightInputs.last3DayTakeoffsLandings,
                  preflightInputs.last3NightTakeoffsLandings,
                  preflightInputs.lastInstrumentCurrency
                );
                const status = currency.instrument.status;
                const badges = {
                  LAPSED: "bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold",
                  SOON: "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold animate-pulse",
                  CURRENT: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold"
                };
                return <span className={badges[status]}>{currency.instrument.text}</span>;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Structured Threat list grouped by status */}
      <div className="border border-[#2D3848] bg-[#11161D] rounded-sm overflow-hidden shadow-inner">
        <div className="px-3 py-2 border-b border-[#2D3848]/80 bg-[#0A0D12] flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#00F0FF]">
            COMPUTED THREAT LIST & MITIGATIONS
          </span>
          <span className="text-[8px] bg-[#11161D] font-mono text-[#64748B] px-1.5 py-0.5 rounded-sm border border-[#2D3848]">
            {brief.threats?.length || 0} ITEMS IDENTIFIED
          </span>
        </div>

        <div className="divide-y divide-[#2D3848]/50">
          {brief.threats?.map((threat, index) => {
            const isChecked = !!checkedThreats[index];
            const severityColor = threat.severity === "CRITICAL" ? "text-[#FF3D00]" : threat.severity === "WARNING" ? "text-[#FFAB00]" : "text-[#00F0FF]";
            return (
              <div 
                id={`threat-row-${index}`}
                key={index} 
                className={`p-3.5 transition-colors flex flex-col sm:flex-row gap-3 items-start ${isChecked ? 'bg-[#0A0D12]/40' : 'hover:bg-[#0A0D12]/20'}`}
              >
                
                {/* Checkbox item */}
                <button 
                  id={`threat-toggle-btn-${index}`}
                  onClick={() => toggleCheck(index)}
                  className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-sm hover:text-brand-cyan transition-colors shrink-0"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4.5 h-4.5 text-brand-cyan fill-brand-cyan/5" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-[#64748B]" />
                  )}
                </button>
 
                {/* Threat description */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-300 uppercase bg-[#0A0D12] px-1.5 py-0.5 rounded-sm border border-[#2D3848]">
                      {getCategoryIcon(threat.category)}
                      {threat.category}
                    </span>
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${severityColor}`}>
                      • {threat.severity} THREAT
                    </span>
                  </div>

                  <p className="text-[10px] text-[#E0E6ED] leading-relaxed">
                    {threat.description}
                  </p>

                  {/* Mitigation block */}
                  <div className="bg-[#0A0D12] rounded-sm p-2 border border-[#2D3848] mt-1 flex items-start gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isChecked ? "text-brand-cyan" : "text-[#64748B]"}`} />
                    <div className="flex-1">
                      <p className="text-[8px] font-mono tracking-wider font-bold text-[#64748B] uppercase">
                        Actionable Pilot Mitigation:
                      </p>
                      <p className="text-[10px] text-[#E0E6ED] leading-relaxed mt-0.5 italic">
                        {threat.mitigation}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* 3. Preflight Checklist Tracking and progress bar */}
        <div className="bg-[#0A0D12] border-t border-[#2D3848] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-sm bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              <ClipboardCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold text-[#E0E6ED]">
                Threat Mitigation Counter
              </span>
              <p className="text-[8px] text-[#64748B] font-mono">
                {checkedCount} OF {totalThreats} MITIGATION STRATEGIES VERIFIED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 sm:max-w-xs">
            <div className="w-full bg-[#11161D] rounded-full h-1.5 overflow-hidden border border-[#2D3848]">
              <div 
                className="bg-brand-cyan h-full rounded-sm transition-all duration-500" 
                style={{ width: `${checklistProgress}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand-cyan w-8 text-right">
              {checklistProgress}%
            </span>
          </div>
        </div>

      </div>

      {/* 4. Risk Profile Logging Action Center */}
      <div className="bg-[#11161D] p-4 rounded-sm border border-[#2D3848] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F0FF]/5 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <h3 className="text-xs font-bold text-white uppercase font-display tracking-tight flex items-center gap-1">
            LOG FLIGHT COMMAND DECISION
          </h3>
          <p className="text-[10px] text-[#64748B] max-w-md leading-relaxed mt-0.5">
            Record preflight environment factors and PIC go/no-go status to refine cognitive forecasting filters.
          </p>
        </div>

        {isLogged ? (
          <div className="flex items-center gap-2 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold">
            <CheckSquare className="w-3.5 h-3.5" /> DECISION PERSISTED IN SYSTEM
          </div>
        ) : (
          <button
            id="log-decision-trigger-btn"
            onClick={handleOpenLogModal}
            className="w-full sm:w-auto px-4 py-1.5 bg-[#00F0FF] text-[#0A0D12] rounded-sm font-bold text-[10px] uppercase tracking-widest shadow-[0_0_12px_rgba(0,240,255,0.25)] hover:brightness-110 active:translate-y-0.5"
          >
            LOG DECISION
          </button>
        )}
      </div>

      {/* Authority Clause Disclaimer (Mandatory) */}
      <footer className="text-center pt-1 border-t border-[#2D3848]">
        <p className="text-[8px] font-mono text-[#64748B] uppercase tracking-widest py-1 bg-[#0A0D12] rounded-sm border border-[#2D3848]">
          ⚠️ Final authority rests with the Pilot in Command. SOLUS is decision support, not a recommendation.
        </p>
      </footer>

      {/* Logging modal Overlay */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all" id="log-decision-modal">
          <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-5 w-full max-w-md space-y-3.5 shadow-xl">
            
            <div className="flex justify-between items-center border-b border-[#2D3848] pb-2">
              <h3 className="font-bold text-sm font-display text-white">
                Log Command Decision
              </h3>
              <button 
                id="close-log-modal-btn"
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[9px] font-mono text-[#64748B] uppercase tracking-widest">
                SELECT PRIMARY PIC DECISION:
              </label>
              
              <div className="space-y-1.5">
                <button
                  id="decision-choice-gp"
                  onClick={() => setPilotChoice("GO_AS_PLANNED")}
                  className={`w-full p-2 rounded-sm border text-[11px] flex items-center justify-between transition-all ${pilotChoice === "GO_AS_PLANNED" ? 'bg-[#00F0FF]/15 border-brand-cyan text-brand-cyan font-bold' : 'bg-[#0A0D12] border-[#2D3848] text-slate-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <PlaneTakeoff className="w-3.5 h-3.5 text-brand-cyan" /> Go as Planned
                  </span>
                  {pilotChoice === "GO_AS_PLANNED" && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="decision-choice-gwm"
                  onClick={() => setPilotChoice("GO_WITH_MITIGATIONS")}
                  className={`w-full p-2 rounded-sm border text-[11px] flex items-center justify-between transition-all ${pilotChoice === "GO_WITH_MITIGATIONS" ? 'bg-[#00F0FF]/10 border-brand-cyan text-brand-cyan font-bold' : 'bg-[#0A0D12] border-[#2D3848] text-slate-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" /> Go With Mitigations (Checked above)
                  </span>
                  {pilotChoice === "GO_WITH_MITIGATIONS" && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="decision-choice-df"
                  onClick={() => setPilotChoice("DELAY_FLIGHT")}
                  className={`w-full p-2 rounded-sm border text-[11px] flex items-center justify-between transition-all ${pilotChoice === "DELAY_FLIGHT" ? 'bg-[#FFAB00]/15 border-brand-amber text-brand-amber font-bold' : 'bg-[#0A0D12] border-[#2D3848] text-slate-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-amber" /> Delay Flight / Wait for Weather
                  </span>
                  {pilotChoice === "DELAY_FLIGHT" && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="decision-choice-cf"
                  onClick={() => setPilotChoice("CANCEL_FLIGHT")}
                  className={`w-full p-2 rounded-sm border text-[11px] flex items-center justify-between transition-all ${pilotChoice === "CANCEL_FLIGHT" ? 'bg-[#FF3D00]/15 border-brand-red text-[#FF3D00] font-bold' : 'bg-[#0A0D12] border-[#2D3848] text-slate-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-[#FF3D00]" /> Cancel / Scrub Flight Mission
                  </span>
                  {pilotChoice === "CANCEL_FLIGHT" && <CheckSquare className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-[#64748B] uppercase tracking-widest mb-0.5" htmlFor="pilot-thoughts">
                  DECISION EXPLANATION NOTES / LOG COMMENT
                </label>
                <textarea
                  id="pilot-thoughts"
                  placeholder="Optional notes regarding alternate routes, gusts, or hold patterns..."
                  rows={2}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full p-2 bg-[#0A0D12] border border-[#2D3848] rounded-sm text-[10px] text-slate-200 focus:outline-none focus:border-brand-cyan resize-none h-12"
                />
              </div>

            </div>

            <div className="flex gap-1.5 pt-1.5">
              <button
                id="submit-log-confirm-btn"
                onClick={handleConfirmLog}
                className="flex-1 py-1.5 bg-[#00F0FF] text-[#0A0D12] font-mono uppercase text-[10px] tracking-widest font-bold rounded-sm transition-colors"
              >
                CONFIRM & STORE RECORD
              </button>
              <button
                id="cancel-log-btn"
                onClick={() => setShowLogModal(false)}
                className="px-3 py-1.5 bg-[#0A0D12] border border-[#2D3848] hover:bg-[#11161D] text-slate-300 rounded-sm text-[10px] transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Simple compass wheel svg visualizer for loading dashboard 
const CompassGlow = () => (
  <div className="absolute inset-1 rounded-full bg-[#0A0D12]/80 p-0.5 flex items-center justify-center">
    <svg className="w-full h-full text-brand-cyan/40" viewBox="0 0 100 100">
      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M50 15 L53 30 L47 30 Z" fill="#00F0FF" />
      <path d="M50 85 L53 70 L47 70 Z" fill="currentColor" />
      <text x="48" y="12" fontSize="6" fill="#00F0FF" fontStyle="normal" fontWeight="bold">N</text>
    </svg>
  </div>
);
