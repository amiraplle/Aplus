import React, { useState } from 'react';
import { X, Sparkles, Cpu, HardDrive, Wifi, Radio, Server, Check, ArrowRight, Save } from 'lucide-react';
import { AudioReceiverState } from '../types';

interface HardwareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AudioReceiverState;
  onUpdateHostIp: (host: string) => void;
}

export const HardwareSettingsModal: React.FC<HardwareSettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateHostIp
}) => {
  const [deviceIpInput, setDeviceIpInput] = useState(state.network.ip);
  const [ipSaved, setIpSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveIp = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHostIp(deviceIpInput.trim());
    setIpSaved(true);
    setTimeout(() => setIpSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0a0c12] border border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Hardware & Connection</h3>
              <p className="text-xs text-zinc-400 font-mono">ESP32-S3 N16R8 • UDA1334A I2S DAC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* UDA1334A I2S DAC Pinout Table */}
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> UDA1334A I2S Wiring Reference
          </div>
          <div className="bg-black/60 rounded-2xl border border-zinc-900 overflow-hidden text-xs font-mono">
            <div className="grid grid-cols-4 bg-zinc-900/60 p-2.5 font-bold text-zinc-400 border-b border-zinc-800">
              <div>UDA1334A</div>
              <div>ESP32-S3</div>
              <div>Signal</div>
              <div>Description</div>
            </div>
            <div className="divide-y divide-zinc-900/80 text-zinc-300">
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-cyan-400 font-bold">BCLK / BCK</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded w-fit">GPIO 4</span>
                <span className="text-zinc-400">Bit Clock</span>
                <span className="text-[11px] text-zinc-500">I2S Master Clock</span>
              </div>
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-cyan-400 font-bold">WCLK / LRC</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded w-fit">GPIO 5</span>
                <span className="text-zinc-400">Word Select</span>
                <span className="text-[11px] text-zinc-500">Left / Right Channel</span>
              </div>
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-cyan-400 font-bold">DIN / DATA</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded w-fit">GPIO 6</span>
                <span className="text-zinc-400">Serial Data</span>
                <span className="text-[11px] text-zinc-500">PCM Audio In</span>
              </div>
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-emerald-400 font-bold">VIN / 3V3</span>
                <span className="text-emerald-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded w-fit">3V3</span>
                <span className="text-zinc-400">Power</span>
                <span className="text-[11px] text-zinc-500">3.3V Regulated</span>
              </div>
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-zinc-400 font-bold">GND</span>
                <span className="text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded w-fit">GND</span>
                <span className="text-zinc-400">Ground</span>
                <span className="text-[11px] text-zinc-500">Common System GND</span>
              </div>
              <div className="grid grid-cols-4 p-2.5 items-center">
                <span className="text-amber-400 font-bold">MCLK</span>
                <span className="text-zinc-500 italic">No Connect</span>
                <span className="text-zinc-500">Master Clock</span>
                <span className="text-[11px] text-amber-500/90 font-semibold">Not Needed (UDA1334A has internal PLL)</span>
              </div>
            </div>
          </div>
        </div>

        {/* mDNS & Network Target Bridge */}
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> mDNS & Hardware Bridge
          </div>
          <div className="bg-black/60 rounded-2xl border border-zinc-900 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">mDNS Local Address:</span>
              <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                http://{state.network.hostname}
              </span>
            </div>

            <form onSubmit={handleSaveIp} className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="text-xs text-zinc-400 block">
                Target Physical ESP32 IP / Hostname (for direct REST / WebSocket sync):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deviceIpInput}
                  onChange={(e) => setDeviceIpInput(e.target.value)}
                  placeholder="192.168.1.142 or audio-receiver.local"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {ipSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{ipSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* NVS Flash Saved State Inspector */}
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Stored NVS Flash State
          </div>
          <p className="text-xs text-zinc-400 mb-2">
            These parameters are committed to ESP32 Preferences flash whenever the power is toggled off manually or settings change:
          </p>
          <div className="bg-black rounded-2xl border border-zinc-900 p-3.5 font-mono text-xs text-cyan-300">
            <pre className="overflow-x-auto">
{JSON.stringify({
  pwr: state.isPoweredOn,
  vol: state.volume,
  mute: state.isMuted,
  src: state.source,
  bass: state.dsp.bass,
  mid: state.dsp.mid,
  treble: state.dsp.treble,
  preset: state.dsp.activePreset,
  url: state.metadata.streamUrl,
  st_name: state.metadata.stationOrSource
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
