import React, { useState } from 'react';
import { Radio, Search, Play, Volume2, Sparkles, Filter } from 'lucide-react';
import { RADIO_STATIONS } from '../data/radioStations';
import { RadioStation } from '../types';

interface StationBrowserProps {
  currentStationUrl: string;
  isPlaying: boolean;
  isPoweredOn: boolean;
  onSelectStation: (station: RadioStation) => void;
}

export const StationBrowser: React.FC<StationBrowserProps> = ({
  currentStationUrl,
  isPlaying,
  isPoweredOn,
  onSelectStation
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = ['all', ...Array.from(new Set(RADIO_STATIONS.map((s) => s.genre.split(' / ')[0])))];

  const filtered = RADIO_STATIONS.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.genre.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || s.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="rounded-3xl bg-[#09090b] border border-zinc-800/80 p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">24/7 Live Internet Radios</h3>
            <p className="text-[11px] text-zinc-500 font-mono">Continuous lossless & high-bitrate live streams</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search stations or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 bg-zinc-950 border border-zinc-800 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
          />
        </div>
      </div>

      {/* Genre filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap transition-all cursor-pointer ${
              selectedGenre === g
                ? 'bg-zinc-200 text-zinc-950 font-medium'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/60'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((station) => {
          const isActive = currentStationUrl === station.url;
          return (
            <div
              key={station.id}
              onClick={() => isPoweredOn && onSelectStation(station)}
              className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-850 border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/80'
              } ${!isPoweredOn ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm bg-zinc-800 border border-zinc-700/80"
                >
                  <span className="text-zinc-300">
                    {station.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {station.name}
                    </span>
                    {isActive && isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {station.genre}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-500">
                    <span className="bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
                      {station.codec}
                    </span>
                    <span>{station.bitrate}</span>
                  </div>
                </div>
              </div>

              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isActive && isPlaying
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {isActive && isPlaying ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
