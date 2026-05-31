import React from "react";
import { WearableInputs } from "../types";
import { Heart, Moon, Sun, ShieldAlert, Cpu } from "lucide-react";

interface WearableFeedProps {
  wearable: WearableInputs;
  onChange: (wearable: WearableInputs) => void;
}

export const WearableFeed: React.FC<WearableFeedProps> = ({ wearable, onChange }) => {
  const handleSliderChange = (key: keyof WearableInputs, value: number) => {
    onChange({
      ...wearable,
      [key]: value,
    });
  };

  // Derive autonomic stress indicator based on HRV & Sleep
  const hrvStatus = wearable.hrv > 65 ? "Optimal" : wearable.hrv > 40 ? "Balanced" : "Severely Fatigued";
  const heartRateColor = wearable.restingHeartRate > 80 ? "text-[#FF3D00]" : wearable.restingHeartRate < 55 ? "text-[#00F0FF]" : "text-sky-300";
  const sleepStatusColor = wearable.sleepHours < 5.5 ? "text-[#FF3D00]" : wearable.sleepHours < 7 ? "text-[#FFAB00]" : "text-[#00F0FF]";

  return (
    <div className="bg-[#11161D] border border-[#2D3848] rounded-sm p-3 hover:border-brand-cyan/20 transition-all shadow-md flex flex-col h-full" id="wearable-mock-panel">
      
      {/* Title block */}
      <div className="flex flex-col mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-4 h-4 text-[#FFAB00]" />
          <h2 className="text-[10px] font-semibold tracking-wider font-mono text-[#FFAB00] uppercase">
            02 // BIOMECHANIC FEED
          </h2>
        </div>
        <h1 className="text-sm font-bold font-display text-white tracking-tight flex items-center gap-2">
          CONNECTED WEARABLE{" "}
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-[#FFAB00]/10 text-[#FFAB00] border border-[#FFAB00]/20 tracking-wider">
            Live Link
          </span>
        </h1>
        <p className="text-[10px] text-[#64748B] mt-1">
          Smartwatch telemetry stream. Models human impairment factors & cognitive capacity drop-offs.
        </p>
      </div>

      {/* Main dashboard body */}
      <div className="flex-1 space-y-4 bg-[#0A0D12] p-3 rounded-sm border border-[#2D3848]">
        
        {/* Dynamic Visual Status Indicator */}
        <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#2D3848]/85">
          <div className="bg-[#11161D] p-2 rounded-sm border border-[#2D3848]">
            <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-widest">
              AUTONOMIC STATUS
            </span>
            <span className={`text-[11px] font-bold mt-0.5 block font-display ${wearable.hrv < 40 ? 'text-[#FF3D00]' : wearable.hrv < 65 ? 'text-[#FFAB00]' : 'text-[#00F0FF]'}`}>
              {hrvStatus}
            </span>
            <span className="text-[9px] text-[#64748B] font-mono">
              Parasympathetic Load
            </span>
          </div>
          
          <div className="bg-[#11161D] p-2 rounded-sm border border-[#2D3848]">
            <span className="block text-[8px] font-mono text-[#64748B] uppercase tracking-widest">
              DIALED COGNITION
            </span>
            <span className={`text-[11px] font-bold mt-0.5 block font-display ${wearable.sleepHours < 5.8 || wearable.hoursAwake > 14 ? 'text-[#FF3D00]' : 'text-[#00F0FF]'}`}>
              {wearable.sleepHours < 5.8 ? "Degraded" : wearable.hoursAwake > 14 ? "Reactive" : "Alert"}
            </span>
            <span className="text-[9px] text-[#64748B] font-mono">
              Task-Saturation Cap
            </span>
          </div>
        </div>

        {/* Sliders Area */}

        {/* 1. Sleep Hours Last Night */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-mono text-[#E0E6ED] uppercase tracking-wider flex items-center gap-1">
              <Moon className="w-3 h-3 text-[#FFAB00]" /> Sleep Last Night
            </span>
            <span className={`text-xs font-mono font-bold ${sleepStatusColor}`}>
              {wearable.sleepHours.toFixed(1)} HRS
            </span>
          </div>
          <input
            id="slider-sleep-hours"
            type="range"
            min={4.0}
            max={12.0}
            step={0.1}
            value={wearable.sleepHours}
            onChange={(e) => handleSliderChange("sleepHours", parseFloat(e.target.value))}
            className="w-full accent-[#FFAB00] bg-[#11161D] rounded-full appearance-none h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#64748B] font-mono mt-0.5">
            <span>4.0 Hrs (Fatigue)</span>
            <span>8.0 Hrs (Optimal)</span>
            <span>12.0 Hrs</span>
          </div>
        </div>

        {/* 2. Hours Awake */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-mono text-[#E0E6ED] uppercase tracking-wider flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#FFAB00]" /> Continuous Awake
            </span>
            <span className={`text-xs font-mono font-bold ${wearable.hoursAwake > 14 ? "text-[#FF3D00] animate-pulse" : wearable.hoursAwake > 10 ? "text-[#FFAB00]" : "text-[#00F0FF]"}`}>
              {wearable.hoursAwake.toFixed(1)} HRS
            </span>
          </div>
          <input
            id="slider-hours-awake"
            type="range"
            min={1.0}
            max={24.0}
            step={0.5}
            value={wearable.hoursAwake}
            onChange={(e) => handleSliderChange("hoursAwake", parseFloat(e.target.value))}
            className="w-full accent-[#FFAB00] bg-[#11161D] rounded-full appearance-none h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#64748B] font-mono mt-0.5">
            <span>1.0 Hr</span>
            <span>12.0 Hrs</span>
            <span>24.0 Hrs (Critical)</span>
          </div>
        </div>

        {/* 3. Resting Heart Rate */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-mono text-[#E0E6ED] uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#FF3D00] animate-pulse" /> Resting Heart Rate
            </span>
            <span className={`text-xs font-mono font-bold ${heartRateColor}`}>
              {wearable.restingHeartRate} BPM
            </span>
          </div>
          <input
            id="slider-resting-hr"
            type="range"
            min={40}
            max={120}
            step={1}
            value={wearable.restingHeartRate}
            onChange={(e) => handleSliderChange("restingHeartRate", parseInt(e.target.value))}
            className="w-full accent-[#FFAB00] bg-[#11161D] rounded-full appearance-none h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#64748B] font-mono mt-0.5">
            <span>40 Bpm</span>
            <span>70 Bpm</span>
            <span>120 Bpm (Stress)</span>
          </div>
        </div>

        {/* 4. HRV (Heart Rate Variability, ms) */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-mono text-[#E0E6ED] uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#00F0FF]" /> HRV (Variability)
            </span>
            <span className={`text-xs font-mono font-bold ${wearable.hrv < 30 ? "text-[#FF3D00]" : wearable.hrv < 60 ? "text-[#FFAB00]" : "text-[#00F0FF]"}`}>
              {wearable.hrv} ms
            </span>
          </div>
          <input
            id="slider-hrv-variability"
            type="range"
            min={10}
            max={150}
            step={1}
            value={wearable.hrv}
            onChange={(e) => handleSliderChange("hrv", parseInt(e.target.value))}
            className="w-full accent-[#FFAB00] bg-[#11161D] rounded-full appearance-none h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#64748B] font-mono mt-0.5">
            <span>10 ms</span>
            <span>60 ms (Nominal)</span>
            <span>150 ms</span>
          </div>
        </div>

        {/* 5. Duty Hours Today */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-mono text-[#E0E6ED] uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#FF3D00]" /> Accumulated Duty
            </span>
            <span className={`text-xs font-mono font-bold ${wearable.hoursOnDuty > 10 ? "text-[#FF3D00]" : wearable.hoursOnDuty > 6 ? "text-[#FFAB00]" : "text-[#00F0FF]"}`}>
              {wearable.hoursOnDuty.toFixed(1)} HRS
            </span>
          </div>
          <input
            id="slider-duty-hours"
            type="range"
            min={0}
            max={16}
            step={0.5}
            value={wearable.hoursOnDuty}
            onChange={(e) => handleSliderChange("hoursOnDuty", parseFloat(e.target.value))}
            className="w-full accent-[#FFAB00] bg-[#11161D] rounded-full appearance-none h-1 cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#64748B] font-mono mt-0.5">
            <span>0.0 Hrs (Off)</span>
            <span>8.0 Hrs</span>
            <span>16.0 Hrs (FAA Limit)</span>
          </div>
        </div>

      </div>

      {/* Telemetry metadata footer */}
      <div className="mt-3 bg-[#0A0D12] border border-[#2D3848] rounded-sm p-1.5 text-[8px] font-mono text-[#64748B] text-center uppercase tracking-widest">
        ✦ SIMULATED WEARABLE FEED ✦
      </div>
    </div>
  );
};
