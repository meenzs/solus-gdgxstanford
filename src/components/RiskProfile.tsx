import React from "react";
import { LoggedDecision } from "../types";
import { FileText, Award, Calendar, RefreshCw, BarChart2, Lightbulb } from "lucide-react";

interface RiskProfileProps {
  logs: LoggedDecision[];
  onClearLogs: () => void;
}

export const RiskProfile: React.FC<RiskProfileProps> = ({ logs, onClearLogs }) => {
  // Compute analytics
  const totalLogs = logs.length;
  
  const choiceStats = logs.reduce((acc, log) => {
    acc[log.pilotChoice] = (acc[log.pilotChoice] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const goAsPlanned = choiceStats["GO_AS_PLANNED"] || 0;
  const goWithMitigations = choiceStats["GO_WITH_MITIGATIONS"] || 0;
  const delayPercent = choiceStats["DELAY_FLIGHT"] || 0;
  const cancelPercent = choiceStats["CANCEL_FLIGHT"] || 0;

  const averageFlags = totalLogs
    ? (logs.reduce((sum, log) => sum + log.flagCount, 0) / totalLogs).toFixed(1)
    : "0.0";

  const getChoiceLabel = (choice: string) => {
    switch (choice) {
      case "GO_AS_PLANNED":
        return { text: "Go as Planned", color: "text-[#00F0FF]", bg: "bg-[#00F0FF]/15 border-brand-cyan/20" };
      case "GO_WITH_MITIGATIONS":
        return { text: "Go with Mitig.", color: "text-[#00F0FF]", bg: "bg-[#00F0FF]/5 border-brand-cyan/10" };
      case "DELAY_FLIGHT":
        return { text: "Delayed / Held", color: "text-[#FFAB00]", bg: "bg-[#FFAB00]/15 border-brand-amber/20" };
      default:
        return { text: "Cancelled Flight", color: "text-[#FF3D00]", bg: "bg-[#FF3D00]/15 border-brand-red/20" };
    }
  };

  return (
    <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-3 hover:border-brand-cyan/20 transition-all shadow-md flex flex-col h-full" id="personal-risk-profile-panel">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart2 className="w-3.5 h-3.5 text-[#00F0FF]" />
            <h2 className="text-[10px] font-semibold tracking-wider font-mono text-[#00F0FF] uppercase">
              03 // DECISION LOGS
            </h2>
          </div>
          <h1 className="text-sm font-bold font-display text-white tracking-tight">
            YOUR RISK PROFILE
          </h1>
        </div>
        
        {totalLogs > 0 && (
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="text-[9px] uppercase font-mono text-[#64748B] hover:text-[#FF3D00] flex items-center gap-1 bg-[#0A0D12] border border-[#2D3848] px-2 py-0.5 rounded-sm transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Clear History
          </button>
        )}
      </div>

      {/* Profile behavioral training callout banner */}
      <div className="bg-[#0A0D12] p-2.5 rounded-sm border border-[#2D3848] mb-3 relative overflow-hidden flex gap-2.5 text-[10px] text-[#E0E6ED]">
        <Lightbulb className="w-4 h-4 text-[#FFAB00] shrink-0 mt-0.5" />
        <p className="leading-snug font-sans text-slate-300">
          <span className="font-semibold text-[#00F0FF]">Behavioral Moat:</span> Every logged decision feeds SOLUS's behavioral dataset, the foundation for insurer risk pricing and operator fleet safety. This is what makes SOLUS smarter than any chart app.
        </p>
      </div>

      {/* Main Panel Content */}
      {totalLogs === 0 ? (
        <div className="flex-1 bg-[#0A0D12]/40 border border-dashed border-[#2D3848] rounded-sm p-4 text-center flex flex-col items-center justify-center min-h-[140px]">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest block mb-1">
            No Command History Logs Found
          </span>
          <p className="text-[10px] text-[#64748B] max-w-[220px]">
            Log a flight decision in the central briefing layout to populate cumulative pilot stress profiles.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-[#0A0D12] p-1.5 border border-[#2D3848] rounded-sm text-center">
              <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-wider">
                FLIGHTS COMMITTED
              </span>
              <span className="text-sm font-bold font-display text-white block mt-0.5">
                {totalLogs}
              </span>
            </div>
            <div className="bg-[#0A0D12] p-1.5 border border-[#2D3848] rounded-sm text-center">
              <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-wider">
                AVG FLAGS COMPUTED
              </span>
              <span className="text-sm font-bold font-display text-[#FFAB00] block mt-0.5">
                {averageFlags}
              </span>
            </div>
            <div className="bg-[#0A0D12] p-1.5 border border-[#2D3848] rounded-sm text-center">
              <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-wider">
                SCRUBPED RATE
              </span>
              <span className="text-sm font-bold font-display text-[#FF3D00] block mt-0.5">
                {Math.round(((cancelPercent + delayPercent) / totalLogs) * 100)}%
              </span>
            </div>
          </div>

          {/* Graphical bar chart of decisions */}
          <div className="space-y-1.5 bg-[#0A0D12] p-2 rounded-sm border border-[#2D3848]">
            <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-widest font-bold mb-1">
              DECISION ARCHITECTURE MATRIX:
            </span>
            <div className="space-y-1 text-[10px]">
              {/* Go as planned row */}
              <div>
                <div className="flex justify-between font-mono text-[9px] text-[#64748B] mb-0.5">
                  <span>Go as Planned</span>
                  <span>{goAsPlanned} ({totalLogs ? Math.round((goAsPlanned / totalLogs) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#11161D] h-1 rounded-sm overflow-hidden">
                  <div className="bg-[#00F0FF] h-full" style={{ width: `${totalLogs ? (goAsPlanned / totalLogs) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Go with mitigations */}
              <div>
                <div className="flex justify-between font-mono text-[9px] text-[#64748B] mb-0.5">
                  <span>With Mitigations</span>
                  <span>{goWithMitigations} ({totalLogs ? Math.round((goWithMitigations / totalLogs) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#11161D] h-1 rounded-sm overflow-hidden">
                  <div className="bg-sky-400 h-full" style={{ width: `${totalLogs ? (goWithMitigations / totalLogs) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Delayed */}
              <div>
                <div className="flex justify-between font-mono text-[9px] text-[#64748B] mb-0.5">
                  <span>Delayed / Held Flight</span>
                  <span>{delayPercent} ({totalLogs ? Math.round((delayPercent / totalLogs) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#11161D] h-1 rounded-sm overflow-hidden">
                  <div className="bg-[#FFAB00] h-full" style={{ width: `${totalLogs ? (delayPercent / totalLogs) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Cancelled */}
              <div>
                <div className="flex justify-between font-mono text-[9px] text-[#64748B] mb-0.5">
                  <span>Cancelled/Scrubbed</span>
                  <span>{cancelPercent} ({totalLogs ? Math.round((cancelPercent / totalLogs) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#11161D] h-1 rounded-sm overflow-hidden">
                  <div className="bg-[#FF3D00] h-full" style={{ width: `${totalLogs ? (cancelPercent / totalLogs) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical scrollable listing of previous logs */}
          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[160px] pr-1">
            <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-widest font-bold">
              LOGGED PREFLIGHT HISTORY MATRIX:
            </span>
            
            <div className="space-y-1.5">
              {logs.map((log) => {
                const badge = getChoiceLabel(log.pilotChoice);
                return (
                  <div 
                    id={`log-item-${log.id}`}
                    key={log.id} 
                    className="p-2 bg-[#0A0D12] rounded-sm border border-[#2D3848] hover:border-[#64748B]/30 transition-colors text-[10px] space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#E0E6ED] font-display text-[10px] uppercase">
                        {log.departure} ➔ {log.destination}
                      </span>
                      <span className="text-[8px] font-mono text-[#64748B] flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-[8px]">
                      <span className={`px-1.5 py-0.5 rounded-sm font-mono font-bold tracking-tight text-[8px] border ${badge.bg} ${badge.color}`}>
                        {badge.text}
                      </span>
                      <div className="space-x-1.5 text-[#64748B] font-mono">
                        <span>SLP: {log.sleepHours}h</span>
                        <span>FLAGS: <strong className="text-[#FFAB00]">{log.flagCount}</strong></span>
                      </div>
                    </div>

                    {log.pilotNotes && (
                      <p className="text-[9px] text-[#64748B] bg-[#11161D]/40 p-1 rounded-sm border border-[#2D3848] leading-normal italic">
                        "{log.pilotNotes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
