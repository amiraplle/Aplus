import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Radio, 
  Globe, 
  Cast, 
  Smartphone, 
  SlidersHorizontal,
  Wifi,
  Disc3,
  Sparkles
} from 'lucide-react';
import { AudioReceiverState, AudioSource } from '../types';
import { audioEngine } from '../utils/audioPlayer';

interface AudioPlayerViewProps {
  state: AudioReceiverState;
  onTogglePlay: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSelectSource: (source: AudioSource) => void;
  onOpenEq: () => void;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  state,
  onTogglePlay,
  onStop,
  onPrev,
  onNext,
  onVolumeChange,
  onToggleMute,
  onSelectSource,
  onOpenEq
}) => {
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(24).fill(6));
  const { isPlaying, isPoweredOn, metadata, volume, isMuted, source } = state;

  // Real-time audio spectrum visualizer (24 bars for high fidelity, soft neutral colors)
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const updateViz = () => {
      tick++;
      if (isPlaying && isPoweredOn) {
        const raw = audioEngine.getVisualizerData();
        const hasSignal = raw.some((v) => v > 0);

        if (hasSignal) {
          const bars: number[] = [];
          for (let i = 0; i < 24; i++) {
            const index = Math.floor((i / 24) * raw.length);
            const val = raw[index];
            bars.push(Math.max(6, Math.min(100, Math.round((val / 255) * 100))));
          }
          setVisualizerBars(bars);
        } else {
          // Subtle rhythmic undulating waveform if stream doesn't expose CORS frequency
          const bars = Array.from({ length: 24 }, (_, i) => {
            const h = 20 + Math.sin((tick * 0.12) + (i * 0.35)) * 18 + Math.cos((tick * 0.08) + (i * 0.2)) * 12;
            return Math.max(6, Math.min(85, Math.round(h)));
          });
          setVisualizerBars(bars);
        }
      } else {
        setVisualizerBars(new Array(24).fill(4));
      }

      animId = requestAnimationFrame(updateViz);
    };

    animId = requestAnimationFrame(updateViz);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPoweredOn]);

  const sources: { id: AudioSource; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'web', label: 'Stream', icon: Globe },
    { id: 'airplay', label: 'AirPlay', icon: Smartphone },
    { id: 'dlna', label: 'DLNA', icon: Cast },
  ];

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="flex flex-col items-center justify-center max-w-sm mx-auto w-full px-2 py-4 sm:py-6 animate-in fade-in duration-300">
      
      {/* Album Art / Turntable Vinyl Record */}
      <div className="relative mb-6 sm:mb-8 group">
        <div 
          className={`w-52 h-52 sm:w-64 sm:h-64 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 p-3 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
            isPlaying && isPoweredOn ? 'shadow-[0_20px_40px_rgba(0,0,0,0.8)]' : 'opacity-80'
          }`}
        >
          {/* Subtle concentric vinyl record groove rings */}
          <div className="w-full h-full rounded-2xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-4 rounded-full border border-zinc-800/40" />
            <div className="absolute inset-8 rounded-full border border-zinc-800/30" />
            <div className="absolute inset-12 rounded-full border border-zinc-800/20" />
            
            {/* Spinning vinyl center badge */}
            <div 
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-900 border border-zinc-700/80 flex flex-col items-center justify-center text-center p-2 shadow-inner transition-transform duration-1000 ${
                isPlaying && isPoweredOn ? 'animate-[spin_8s_linear_infinite]' : ''
              }`}
            >
              <Disc3 className="w-8 h-8 text-zinc-400 mb-0.5" />
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 border border-zinc-700" />
            </div>

            {/* Subtle reflection gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
          </div>

          {/* Minimalist Live Status Badge */}
          <div className="absolute top-5 left-5 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-zinc-800 text-[10px] font-mono tracking-wider text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying && isPoweredOn ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              {isPlaying && isPoweredOn ? 'PLAYING' : 'IDLE'}
            </span>
          </div>

          {/* Codec & Sample Rate Badge */}
          <div className="absolute top-5 right-5 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-zinc-400">
              {metadata.codec || 'I2S'} • {metadata.sampleRate ? metadata.sampleRate.replace(' Hz', '') : '44.1k'}
            </span>
          </div>
        </div>
      </div>

      {/* Track Title & Artist Information */}
      <div className="w-full text-center mb-5 sm:mb-6 px-4">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight truncate">
          {isPoweredOn ? metadata.title || 'Ready to Stream' : 'Receiver Off'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 truncate mt-1">
          {isPoweredOn ? metadata.artist || metadata.stationOrSource || 'ESP32-S3 HiFi' : 'Power on via the switch above'}
        </p>

        {/* Stream format and bitrate subtle metadata */}
        <div className="flex items-center justify-center gap-2 mt-2 text-[11px] font-mono text-zinc-500">
          <span>{metadata.stationOrSource || 'Internet Audio'}</span>
          <span>•</span>
          <span>{metadata.bitrate || '320 kbps'}</span>
          <span>•</span>
          <span>PSRAM {metadata.bufferHealth}%</span>
        </div>
      </div>

      {/* Subtle Spectrum Visualizer Bar (Minimal Height & Soft Colors) */}
      <div className="w-full max-w-xs px-2 mb-6 sm:mb-8">
        <div className="flex items-end justify-between h-8 gap-1 px-1">
          {visualizerBars.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-full transition-all duration-75 min-w-[2px]"
              style={{
                height: `${isPoweredOn && isPlaying ? height : 4}%`,
                backgroundColor: isPoweredOn && isPlaying 
                  ? '#a1a1aa' 
                  : '#27272a'
              }}
            />
          ))}
        </div>
      </div>

      {/* Standard Audio Player Transport Controls */}
      <div className="w-full max-w-xs flex items-center justify-between px-2 mb-6 sm:mb-7">
        {/* Source Switcher / Equalizer Button */}
        <button
          onClick={onOpenEq}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Open Equalizer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Previous Station */}
        <button
          onClick={onPrev}
          disabled={!isPoweredOn}
          className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous Station"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* Primary Play / Pause Button (Clean white minimal button) */}
        <button
          id="main-play-pause"
          onClick={onTogglePlay}
          disabled={!isPoweredOn}
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-transform active:scale-95 shadow-md ${
            !isPoweredOn ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying && isPoweredOn ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Next Station */}
        <button
          onClick={onNext}
          disabled={!isPoweredOn}
          className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next Station"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          disabled={!isPoweredOn}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Stop Stream"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Volume Slider */}
      <div className="w-full max-w-xs px-2 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            disabled={!isPoweredOn}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer disabled:opacity-30"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              disabled={!isPoweredOn}
              onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 cursor-pointer disabled:opacity-30"
            />
          </div>
          <span className="font-mono text-xs text-zinc-400 w-8 text-right">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>
      </div>

      {/* Audio Source Switcher Segmented Control */}
      <div className="w-full max-w-xs bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-2xl flex items-center justify-between gap-1">
        {sources.map((s) => {
          const Icon = s.icon;
          const isSelected = source === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSource(s.id)}
              disabled={!isPoweredOn}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              } ${!isPoweredOn ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[11px]">{s.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
