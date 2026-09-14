import React from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Radio, Globe, Cast, Smartphone } from 'lucide-react';
import { AudioSource } from '../types';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPoweredOn: boolean;
  volume: number;
  isMuted: boolean;
  currentSource: AudioSource;
  onTogglePlay: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSelectSource: (source: AudioSource) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPoweredOn,
  volume,
  isMuted,
  currentSource,
  onTogglePlay,
  onStop,
  onPrev,
  onNext,
  onVolumeChange,
  onToggleMute,
  onSelectSource
}) => {
  const sources: { id: AudioSource; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'web', label: 'HTTP Web', icon: Globe },
    { id: 'airplay', label: 'AirPlay 2', icon: Smartphone },
    { id: 'dlna', label: 'DLNA / UPnP', icon: Cast },
  ];

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-5">
      {/* Source Selector Pills */}
      <div>
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Input Source</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sources.map((s) => {
            const Icon = s.icon;
            const isSelected = currentSource === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSource(s.id)}
                disabled={!isPoweredOn}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/60 hover:text-white hover:bg-zinc-800/50'
                } ${!isPoweredOn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="flex items-center justify-center gap-4 py-1">
        {/* Previous Station */}
        <button
          onClick={onPrev}
          disabled={!isPoweredOn}
          className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous Station"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Big Primary Play/Pause Button */}
        <button
          id="play-pause-btn"
          onClick={onTogglePlay}
          disabled={!isPoweredOn}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-black font-bold transition-all transform active:scale-95 shadow-lg ${
            isPlaying && isPoweredOn
              ? 'bg-gradient-to-tr from-cyan-400 to-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.4)]'
              : 'bg-white hover:bg-zinc-200 shadow-[0_0_16px_rgba(255,255,255,0.2)]'
          } ${!isPoweredOn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isPlaying ? 'Pause Stream' : 'Play Stream'}
        >
          {isPlaying && isPoweredOn ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-0.5" />
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          disabled={!isPoweredOn}
          className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-rose-400 hover:border-rose-900/40 hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Stop Stream"
        >
          <Square className="w-4 h-4" />
        </button>

        {/* Next Station */}
        <button
          onClick={onNext}
          disabled={!isPoweredOn}
          className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next Station"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Slider & Mute Toggle */}
      <div className="bg-black/50 rounded-2xl p-3.5 border border-zinc-900/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <button
              onClick={onToggleMute}
              disabled={!isPoweredOn}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-40"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <span className="font-medium text-zinc-300">Master Volume</span>
          </div>
          <span className="font-mono text-cyan-400 font-semibold text-xs">
            {isMuted ? 'MUTED' : `${volume}%`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
            disabled={!isPoweredOn}
            className="w-full h-2 cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
};
