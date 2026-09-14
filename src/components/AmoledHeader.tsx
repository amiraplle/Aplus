import React from 'react';
import { Radio, Power, Wifi, Sparkles, FolderCode, Sliders, ShieldCheck } from 'lucide-react';
import { AudioReceiverState } from '../types';

interface AmoledHeaderProps {
  state: AudioReceiverState;
  activeTab: 'controller' | 'stations' | 'firmware' | 'ota' | 'hardware';
  setActiveTab: (tab: 'controller' | 'stations' | 'firmware' | 'ota' | 'hardware') => void;
  onTogglePower: () => void;
  onOpenSettings: () => void;
}

export const AmoledHeader: React.FC<AmoledHeaderProps> = ({
  state,
  activeTab,
  setActiveTab,
  onTogglePower,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Target info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-tight text-white">ESP32-S3 Audio</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-800/40">
                N16R8 • UDA1334A
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <button 
                onClick={onOpenSettings}
                className="font-mono hover:text-cyan-300 transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
                title="Click to view device network settings"
              >
                {state.network.hostname}
              </button>
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Power toggle with NVS state indicator */}
          <button
            id="power-button"
            onClick={onTogglePower}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              state.isPoweredOn
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title={state.isPoweredOn ? 'Power Off (saves state to NVS)' : 'Power On (restores state)'}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{state.isPoweredOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Material Design 3 Mobile Navigation Pills */}
      <div className="max-w-4xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          id="nav-controller"
          onClick={() => setActiveTab('controller')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'controller'
              ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Controller</span>
        </button>

        <button
          id="nav-stations"
          onClick={() => setActiveTab('stations')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'stations'
              ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Radios</span>
        </button>

        <button
          id="nav-firmware"
          onClick={() => setActiveTab('firmware')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'firmware'
              ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/60'
          }`}
        >
          <FolderCode className="w-3.5 h-3.5" />
          <span>PlatformIO Code</span>
        </button>

        <button
          id="nav-ota"
          onClick={() => setActiveTab('ota')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'ota'
              ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OTA Update</span>
        </button>

        <button
          id="nav-hardware"
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'hardware'
              ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pinout & NVS</span>
        </button>
      </div>
    </header>
  );
};
