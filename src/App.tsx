import React, { useState, useEffect } from 'react';
import { MinimalHeader } from './components/MinimalHeader';
import { MinimalBottomNav, NavTab } from './components/MinimalBottomNav';
import { AudioPlayerView } from './components/AudioPlayerView';
import { DspEqualizer } from './components/DspEqualizer';
import { DirectStreamInput } from './components/DirectStreamInput';
import { StationBrowser } from './components/StationBrowser';
import { OtaManager } from './components/OtaManager';
import { FirmwareExplorer } from './components/FirmwareExplorer';
import { HardwareSettingsModal } from './components/HardwareSettingsModal';
import { HardwareAndSetupView } from './components/HardwareAndSetupView';
import { AudioReceiverState, AudioSource, RadioStation } from './types';
import { RADIO_STATIONS } from './data/radioStations';
import { FIRMWARE_FILES } from './data/firmwareFiles';
import { audioEngine } from './utils/audioPlayer';
import { downloadSingleFile } from './utils/zipExporter';

const NVS_STORAGE_KEY = 'esp32_audio_nvs_state';

export default function App() {
  // Load saved state or use initial defaults
  const [state, setState] = useState<AudioReceiverState>(() => {
    try {
      const saved = localStorage.getItem(NVS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read NVS local state:', e);
    }

    const defaultStation = RADIO_STATIONS[0];
    return {
      isPoweredOn: true,
      isPlaying: false,
      volume: 65,
      isMuted: false,
      source: 'radio',
      metadata: {
        title: defaultStation.name,
        artist: 'SomaFM Broadcast',
        stationOrSource: defaultStation.name,
        streamUrl: defaultStation.url,
        codec: defaultStation.codec,
        bitrate: defaultStation.bitrate,
        sampleRate: '44.1 kHz',
        bitDepth: '16-bit',
        bufferHealth: 100,
        duration: 0,
        currentTime: 0,
        source: 'radio'
      },
      dsp: {
        bass: 0,
        mid: 0,
        treble: 0,
        activePreset: 'flat'
      },
      network: {
        connected: true,
        ssid: 'Home_WiFi_5G',
        ip: '192.168.1.142',
        hostname: 'audio-receiver.local',
        rssi: -58,
        mac: '34:85:18:9A:C2:54'
      },
      system: {
        psramFreeKb: 7168,
        psramTotalKb: 8192,
        heapFreeKb: 284,
        uptimeSeconds: 1420,
        otaPartition: 'app0 (Active)',
        firmwareVersion: '2.4.0-release'
      }
    };
  });

  const [activeTab, setActiveTab] = useState<NavTab>('player');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Persist state changes to simulated NVS flash (localStorage)
  useEffect(() => {
    try {
      localStorage.setItem(NVS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to commit state to storage:', e);
    }
  }, [state]);

  // Sync DSP to browser Web Audio
  useEffect(() => {
    audioEngine.setDsp(state.dsp.bass, state.dsp.mid, state.dsp.treble);
  }, [state.dsp.bass, state.dsp.mid, state.dsp.treble]);

  // Sync Volume to browser Web Audio
  useEffect(() => {
    audioEngine.setVolume(state.volume, state.isMuted);
  }, [state.volume, state.isMuted]);

  // Power On / Off manual toggle with state preservation
  const handleTogglePower = () => {
    const nextPower = !state.isPoweredOn;
    if (!nextPower) {
      audioEngine.pause();
      setState(prev => ({
        ...prev,
        isPoweredOn: false,
        isPlaying: false
      }));
      showToast('Receiver Powered Off • State saved to NVS');
    } else {
      setState(prev => ({
        ...prev,
        isPoweredOn: true
      }));
      showToast('Receiver Powered On');
    }
  };

  // Playback handlers
  const handleTogglePlay = async () => {
    if (!state.isPoweredOn) return;

    if (state.isPlaying) {
      audioEngine.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const ok = await audioEngine.play(state.metadata.streamUrl, state.volume, state.isMuted);
      setState(prev => ({ ...prev, isPlaying: ok }));
      if (!ok) {
        showToast('Streaming direct audio');
      }
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleNextStation = async () => {
    if (!state.isPoweredOn) return;
    const currentIndex = RADIO_STATIONS.findIndex(s => s.url === state.metadata.streamUrl);
    const nextIndex = (currentIndex + 1) % RADIO_STATIONS.length;
    await handleStationSelect(RADIO_STATIONS[nextIndex]);
  };

  const handlePrevStation = async () => {
    if (!state.isPoweredOn) return;
    const currentIndex = RADIO_STATIONS.findIndex(s => s.url === state.metadata.streamUrl);
    const prevIndex = (currentIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    await handleStationSelect(RADIO_STATIONS[prevIndex]);
  };

  const handleStationSelect = async (station: RadioStation) => {
    if (!state.isPoweredOn) return;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      source: 'radio',
      metadata: {
        ...prev.metadata,
        title: station.name,
        artist: station.genre,
        stationOrSource: station.name,
        streamUrl: station.url,
        codec: station.codec,
        bitrate: station.bitrate,
        source: 'radio'
      }
    }));

    await audioEngine.play(station.url, state.volume, state.isMuted);
    showToast(`Playing ${station.name}`);
  };

  const handlePlayDirectStream = async (url: string, streamTitle = 'Custom Stream') => {
    if (!state.isPoweredOn) return;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      source: 'web',
      metadata: {
        ...prev.metadata,
        title: streamTitle,
        artist: 'Direct Stream',
        stationOrSource: streamTitle,
        streamUrl: url,
        codec: url.endsWith('.m3u8') ? 'HLS' : url.endsWith('.aac') ? 'AAC' : 'MP3',
        source: 'web'
      }
    }));

    await audioEngine.play(url, state.volume, state.isMuted);
    showToast(`Streaming ${streamTitle}`);
  };

  const handleVolumeChange = (vol: number) => {
    setState(prev => ({
      ...prev,
      volume: vol,
      isMuted: false
    }));
  };

  const handleToggleMute = () => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const handleSelectSource = (src: AudioSource) => {
    setState(prev => ({
      ...prev,
      source: src,
      metadata: {
        ...prev.metadata,
        source: src,
        title: src === 'airplay' ? 'Waiting for AirPlay...' : src === 'dlna' ? 'DLNA Active' : prev.metadata.title,
        artist: src === 'airplay' ? 'Apple AirPlay 2' : src === 'dlna' ? 'UPnP MediaRenderer' : prev.metadata.artist
      }
    }));
    showToast(`Source: ${src.toUpperCase()}`);
  };

  const handleUpdateDsp = (bass: number, mid: number, treble: number, presetId = 'custom') => {
    setState(prev => ({
      ...prev,
      dsp: {
        bass,
        mid,
        treble,
        activePreset: presetId
      }
    }));
  };

  const handleUpdateHostIp = (host: string) => {
    setState(prev => ({
      ...prev,
      network: {
        ...prev.network,
        hostname: host.includes('.local') ? host : prev.network.hostname,
        ip: !host.includes('.local') ? host : prev.network.ip
      }
    }));
    showToast(`Receiver: ${host}`);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-zinc-200">
      {/* Top minimal status bar */}
      <MinimalHeader
        state={state}
        onTogglePower={handleTogglePower}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDownloadPlatformIni={() => {
          const ini = FIRMWARE_FILES.find(f => f.name === 'platformio.ini') || FIRMWARE_FILES[0];
          downloadSingleFile('platformio.ini', ini.content, 'text/plain');
          showToast('Downloaded platformio.ini for VS Code');
        }}
      />

      {/* Main Content Area (padded at bottom to clear the bottom navigation bar) */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-28">
        {/* View 1: Focused Audio Player View */}
        {activeTab === 'player' && (
          <AudioPlayerView
            state={state}
            onTogglePlay={handleTogglePlay}
            onStop={handleStop}
            onPrev={handlePrevStation}
            onNext={handleNextStation}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onSelectSource={handleSelectSource}
            onOpenEq={() => setActiveTab('dsp')}
          />
        )}

        {/* View 2: Radio Station Browser & Direct Stream */}
        {activeTab === 'radios' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <StationBrowser
              currentStationUrl={state.metadata.streamUrl}
              isPlaying={state.isPlaying}
              isPoweredOn={state.isPoweredOn}
              onSelectStation={handleStationSelect}
            />

            <DirectStreamInput
              currentUrl={state.metadata.streamUrl}
              isPoweredOn={state.isPoweredOn}
              onPlayDirectStream={handlePlayDirectStream}
            />
          </div>
        )}

        {/* View 3: 3-Tone DSP Equalizer */}
        {activeTab === 'dsp' && (
          <div className="animate-in fade-in duration-200">
            <DspEqualizer
              bass={state.dsp.bass}
              mid={state.dsp.mid}
              treble={state.dsp.treble}
              activePreset={state.dsp.activePreset}
              isPoweredOn={state.isPoweredOn}
              onUpdateDsp={handleUpdateDsp}
            />
          </div>
        )}

        {/* View 4: Firmware Code & OTA Flasher */}
        {activeTab === 'code' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <FirmwareExplorer />
            <OtaManager state={state} />
          </div>
        )}

        {/* View 5: Device Setup, Pinout & NVS Flash */}
        {activeTab === 'device' && (
          <div className="animate-in fade-in duration-200">
            <HardwareAndSetupView
              state={state}
              onUpdateHostIp={handleUpdateHostIp}
              onTogglePower={handleTogglePower}
              onUpdateDsp={handleUpdateDsp}
            />
          </div>
        )}
      </main>

      {/* Minimal Bottom Audio Player Navigation */}
      <MinimalBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isPlaying={state.isPlaying}
        isPoweredOn={state.isPoweredOn}
        trackTitle={state.metadata.title}
        artist={state.metadata.artist}
      />

      {/* Settings Modal */}
      <HardwareSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateHostIp={handleUpdateHostIp}
      />

      {/* Floating subtle toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-zinc-200 border border-zinc-700/80 px-4 py-2 rounded-full text-xs font-mono shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
