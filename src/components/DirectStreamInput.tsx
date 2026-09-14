import React, { useState } from 'react';
import { Globe, Play, Link, Check, Sparkles, AlertCircle } from 'lucide-react';

interface DirectStreamInputProps {
  currentUrl: string;
  isPoweredOn: boolean;
  onPlayDirectStream: (url: string, name?: string) => void;
}

export const DirectStreamInput: React.FC<DirectStreamInputProps> = ({
  currentUrl,
  isPoweredOn,
  onPlayDirectStream
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [copied, setCopied] = useState(false);

  const quickStreams = [
    {
      name: 'SomaFM 320k MP3',
      url: 'https://ice1.somafm.com/groovesalad-256-mp3',
      type: 'MP3 256k'
    },
    {
      name: 'Swiss Jazz Live',
      url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
      type: 'MP3 128k'
    },
    {
      name: 'Audio Stereo Test (440Hz Tone)',
      url: 'https://cdn.freesound.org/previews/387/387600_5121236-lq.mp3',
      type: 'Audio Test'
    },
    {
      name: 'Lofi Chill Beat',
      url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
      type: 'AAC 192k'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onPlayDirectStream(inputUrl.trim(), customName.trim() || 'Custom HTTP Stream');
  };

  const handleQuickPlay = (item: { name: string; url: string }) => {
    setInputUrl(item.url);
    setCustomName(item.name);
    onPlayDirectStream(item.url, item.name);
  };

  return (
    <div className="rounded-3xl bg-[#09090b] border border-zinc-800/80 p-5 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">Direct HTTP/HTTPS Stream</h3>
          <p className="text-[11px] text-zinc-500 font-mono">Stream custom audio URLs directly to the UDA1334A DAC</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              placeholder="Paste direct stream URL (https://...)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={!isPoweredOn}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono transition-all disabled:opacity-40"
            />
          </div>

          <button
            type="submit"
            disabled={!isPoweredOn || !inputUrl.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Optional: Custom label (e.g. My Radio Stream)"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          disabled={!isPoweredOn}
          className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-sans transition-all disabled:opacity-40"
        />
      </form>

      {/* Quick Load Test Streams */}
      <div>
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
          Test Streams
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickStreams.map((qs, i) => (
            <button
              key={i}
              onClick={() => handleQuickPlay(qs)}
              disabled={!isPoweredOn}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 text-left transition-all hover:bg-zinc-800/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-zinc-200 truncate">{qs.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{qs.url}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50 whitespace-nowrap">
                {qs.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
