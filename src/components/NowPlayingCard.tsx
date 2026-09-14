import React, { useEffect, useState } from 'react';
import { Disc, Radio, Wifi, Zap, Music2, Layers } from 'lucide-react';
import { MediaMetadata } from '../types';
import { audioEngine } from '../utils/audioPlayer';

interface NowPlayingCardProps {
  metadata: MediaMetadata;
  isPlaying: boolean;
  isPoweredOn: boolean;
}

export const NowPlayingCard: React.FC<NowPlayingCardProps> = ({
  metadata,
  isPlaying,
  isPoweredOn
}) => {
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(8));

  // Visualizer loop reading either real Web Audio AnalyserNode or fallback wave
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const updateViz = () => {
      tick++;
      if (isPlaying && isPoweredOn) {
        const raw = audioEngine.getVisualizerData();
        const hasSignal = raw.some(v => v > 0);

        if (hasSignal) {
          // Downsample 32 bins to 16 bars
          const bars: number[] = [];
          for (let i = 0; i < 16; i++) {
            const val = (raw[i * 2] + raw[i * 2 + 1]) / 2;
            bars.push(Math.max(6, Math.min(100, Math.round((val / 255) * 100))));
          }
          setVisualizerBars(bars);
        } else {
          // Simulated organic wave for visual rhythm if stream doesn't expose CORS frequency
          const bars = Array.from({ length: 16 }, (_, i) => {
            const h = 25 + Math.sin((tick * 0.15) + (i * 0.4)) * 20 + Math.cos((tick * 0.1) + (i * 0.2)) * 15;
            return Math.max(8, Math.min(90, Math.round(h)));
          });
          setVisualizerBars(bars);
        }
      } else {
        setVisualizerBars(new Array(16).fill(6));
      }

      animId = requestAnimationFrame(updateViz);
    };

    animId = requestAnimationFrame(updateViz);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPoweredOn]);

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'airplay':
        return { label: 'AirPlay 2', color: 'bg-indigo-950/80 text-indigo-400 border-indigo-700/50' };
      case 'dlna':
        return { label: 'DLNA / UPnP', color: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50' };
      case 'web':
        return { label: 'HTTP Stream', color: 'bg-purple-950/80 text-purple-400 border-purple-700/50' };
      default:
        return { label: '24*7 Radio', color: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/50' };
    }
  };

  const sourceBadge = getSourceBadge(metadata.source);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl transition-all">
      {/* Background glow when active */}
      {isPlaying && isPoweredOn && (
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top row: Source badge, PSRAM buffer health & Codec info */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${sourceBadge.color}`}>
          {sourceBadge.label}
        </span>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
            <Zap className="w-3 h-3" /> PSRAM {metadata.bufferHealth}%
          </span>
          <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
            {metadata.codec}
          </span>
        </div>
      </div>

      {/* Center metadata layout */}
      <div className="flex items-center gap-4 mb-5">
        {/* Animated Vinyl / Artwork disk */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner">
          <Disc 
            className={`w-10 h-10 text-cyan-400 transition-transform duration-1000 ${
              isPlaying && isPoweredOn ? 'animate-[spin_4s_linear_infinite]' : 'opacity-40'
            }`} 
          />
          <div className="absolute w-3.5 h-3.5 rounded-full bg-black border border-zinc-700"></div>
        </div>

        {/* Title, Artist, and Station details */}
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
            {isPoweredOn ? metadata.title || 'Waiting for Stream...' : 'Receiver Powered Off'}
          </h2>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {isPoweredOn ? metadata.artist || 'ESP32-S3 HiFi' : 'Press ON to resume playback'}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500 font-mono">
            <span className="text-cyan-400/90">{metadata.stationOrSource || 'I2S Audio'}</span>
            <span>•</span>
            <span>{metadata.bitrate || '320 kbps'}</span>
            <span>•</span>
            <span>{metadata.sampleRate || '44.1 kHz'}</span>
          </div>
        </div>
      </div>

      {/* 16-Bar Real-Time Audio Visualizer */}
      <div className="bg-black/60 rounded-2xl p-3 border border-zinc-900/90 mb-3">
        <div className="flex items-end justify-between h-14 gap-1 px-1">
          {visualizerBars.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-full transition-all duration-75 min-w-[3px]"
              style={{
                height: `${isPoweredOn && isPlaying ? height : 6}%`,
                background: isPoweredOn && isPlaying
                  ? `linear-gradient(to top, #06b6d4, #38bdf8, ${height > 75 ? '#c084fc' : '#38bdf8'})`
                  : '#1f242e',
                boxShadow: isPoweredOn && isPlaying && height > 50 ? '0 0 6px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio Stream Telemetry footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>UDA1334A I2S (GPIO 4, 5, 6)</span>
        </div>
        <div>
          {isPlaying && isPoweredOn ? (
            <span className="text-emerald-400 font-semibold">● LIVE STREAMING</span>
          ) : (
            <span>IDLE / STANDBY</span>
          )}
        </div>
      </div>
    </div>
  );
};
