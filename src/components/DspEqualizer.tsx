import React from 'react';
import { Sliders, RotateCcw, Zap, Mic, Flame, Music, Coffee, Sparkles, Moon, Volume2 } from 'lucide-react';
import { DSP_PRESETS } from '../data/radioStations';
import { DspPreset } from '../types';

interface DspEqualizerProps {
  bass: number;
  mid: number;
  treble: number;
  activePreset: string;
  isPoweredOn: boolean;
  onUpdateDsp: (bass: number, mid: number, treble: number, presetId?: string) => void;
}

export const DspEqualizer: React.FC<DspEqualizerProps> = ({
  bass,
  mid,
  treble,
  activePreset,
  isPoweredOn,
  onUpdateDsp
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'Mic': return <Mic className="w-3.5 h-3.5" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5" />;
      case 'Music': return <Music className="w-3.5 h-3.5" />;
      case 'Coffee': return <Coffee className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Moon': return <Moon className="w-3.5 h-3.5" />;
      default: return <Volume2 className="w-3.5 h-3.5" />;
    }
  };

  const handlePresetSelect = (preset: DspPreset) => {
    onUpdateDsp(preset.bass, preset.mid, preset.treble, preset.id);
  };

  const handleReset = () => {
    onUpdateDsp(0, 0, 0, 'flat');
  };

  return (
    <div className="rounded-3xl bg-[#09090b] border border-zinc-800/80 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">3-Tone DSP Equalizer</h3>
            <p className="text-[11px] text-zinc-500 font-mono">Biquad Hardware Filter (-12 dB to +12 dB)</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={!isPoweredOn}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
          title="Reset to Flat EQ"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Flat</span>
        </button>
      </div>

      {/* 3-Tone Sliders: Bass, Mid, Treble */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Bass Slider */}
        <div className="bg-zinc-950/60 rounded-2xl p-3.5 border border-zinc-850">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-zinc-300">Bass (Low Shelf)</span>
            <span className="font-mono text-zinc-200 font-medium">
              {bass > 0 ? `+${bass}` : bass} dB
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mb-2.5">~100 Hz sub & punch</div>
          <input
            id="bass-slider"
            type="range"
            min="-12"
            max="12"
            value={bass}
            disabled={!isPoweredOn}
            onChange={(e) => onUpdateDsp(parseInt(e.target.value, 10), mid, treble, 'custom')}
            className="w-full h-2 disabled:opacity-40"
          />
        </div>

        {/* Mid Slider */}
        <div className="bg-zinc-950/60 rounded-2xl p-3.5 border border-zinc-850">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-zinc-300">Mid (Peaking)</span>
            <span className="font-mono text-zinc-200 font-medium">
              {mid > 0 ? `+${mid}` : mid} dB
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mb-2.5">~1 kHz vocals & presence</div>
          <input
            id="mid-slider"
            type="range"
            min="-12"
            max="12"
            value={mid}
            disabled={!isPoweredOn}
            onChange={(e) => onUpdateDsp(bass, parseInt(e.target.value, 10), treble, 'custom')}
            className="w-full h-2 disabled:opacity-40"
          />
        </div>

        {/* Treble Slider */}
        <div className="bg-zinc-950/60 rounded-2xl p-3.5 border border-zinc-850">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-zinc-300">Treble (High Shelf)</span>
            <span className="font-mono text-zinc-200 font-medium">
              {treble > 0 ? `+${treble}` : treble} dB
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mb-2.5">~8 kHz air & sparkle</div>
          <input
            id="treble-slider"
            type="range"
            min="-12"
            max="12"
            value={treble}
            disabled={!isPoweredOn}
            onChange={(e) => onUpdateDsp(bass, mid, parseInt(e.target.value, 10), 'custom')}
            className="w-full h-2 disabled:opacity-40"
          />
        </div>
      </div>

      {/* DSP Audio Presets */}
      <div>
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2.5">
          Audio Presets
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DSP_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                disabled={!isPoweredOn}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs text-left transition-all border ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                } ${!isPoweredOn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                  {getIcon(preset.icon)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate text-[11px]">{preset.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {preset.bass > 0 ? `+${preset.bass}` : preset.bass}/
                    {preset.mid > 0 ? `+${preset.mid}` : preset.mid}/
                    {preset.treble > 0 ? `+${preset.treble}` : preset.treble}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
