import React from 'react';
import { Power, Radio, Download, FileText } from 'lucide-react';
import { AudioReceiverState } from '../types';

interface MinimalHeaderProps {
  state: AudioReceiverState;
  onTogglePower: () => void;
  onOpenSettings: () => void;
  onDownloadPlatformIni?: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  state,
  onTogglePower,
  onOpenSettings,
  onDownloadPlatformIni
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/60 px-4 py-3">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-between">
        {/* Title / Host status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">ESP32 Audio</h1>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                S3 • I2S
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="View connection settings"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${state.isPoweredOn ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span>{state.network.hostname}</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Direct platformio.ini download & Power Switch */}
        <div className="flex items-center gap-2">
          {onDownloadPlatformIni && (
            <button
              onClick={onDownloadPlatformIni}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              title="Direct Download platformio.ini for VS Code"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-mono">platformio.ini</span>
            </button>
          )}

          {/* Minimal Power Switch */}
          <button
            id="power-switch-button"
            onClick={onTogglePower}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
              state.isPoweredOn
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
            }`}
            title={state.isPoweredOn ? 'Power Off (saves state)' : 'Power On (restores state)'}
          >
            <Power className={`w-3.5 h-3.5 ${state.isPoweredOn ? 'text-emerald-400' : 'text-zinc-600'}`} />
            <span>{state.isPoweredOn ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
