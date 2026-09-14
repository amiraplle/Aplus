import React from 'react';
import { Disc3, Radio, Sliders, FolderCode, ShieldCheck, Cpu } from 'lucide-react';

export type NavTab = 'player' | 'radios' | 'dsp' | 'code' | 'device';

interface MinimalBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isPlaying: boolean;
  isPoweredOn: boolean;
  trackTitle?: string;
  artist?: string;
}

export const MinimalBottomNav: React.FC<MinimalBottomNavProps> = ({
  activeTab,
  onChangeTab,
  isPlaying,
  isPoweredOn,
  trackTitle,
  artist
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'player', label: 'Player', icon: Disc3 },
    { id: 'radios', label: 'Stations', icon: Radio },
    { id: 'dsp', label: 'EQ', icon: Sliders },
    { id: 'code', label: 'Firmware', icon: FolderCode },
    { id: 'device', label: 'Device', icon: Cpu }
  ];

  return (
    <nav 
      aria-label="Audio player navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                isActive 
                  ? 'text-zinc-100 font-medium' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-105 text-zinc-100' : 'text-zinc-500'
                  }`} 
                />
                {tab.id === 'player' && isPlaying && isPoweredOn && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-[#09090b]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-zinc-300" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
