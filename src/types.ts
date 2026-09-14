export type AudioSource = 'radio' | 'web' | 'dlna' | 'airplay';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string;
  codec: 'MP3' | 'AAC' | 'FLAC' | 'OGG';
  bitrate: string;
  logoColor: string;
  description: string;
}

export interface DspPreset {
  id: string;
  name: string;
  bass: number;    // -12 to +12 dB
  mid: number;     // -12 to +12 dB
  treble: number;  // -12 to +12 dB
  icon: string;
}

export interface MediaMetadata {
  title: string;
  artist: string;
  stationOrSource: string;
  streamUrl: string;
  codec: string;
  bitrate: string;
  sampleRate: string;
  bitDepth: string;
  bufferHealth: number; // 0 to 100%
  duration: number;     // seconds or 0 for live
  currentTime: number;
  source: AudioSource;
}

export interface AudioReceiverState {
  isPoweredOn: boolean;
  isPlaying: boolean;
  volume: number;       // 0 - 100
  isMuted: boolean;
  source: AudioSource;
  metadata: MediaMetadata;
  dsp: {
    bass: number;       // -12 to +12
    mid: number;        // -12 to +12
    treble: number;     // -12 to +12
    activePreset: string;
  };
  network: {
    connected: boolean;
    ssid: string;
    ip: string;
    hostname: string;   // e.g. audio-receiver.local
    rssi: number;       // dBm
    mac: string;
  };
  system: {
    psramFreeKb: number;
    psramTotalKb: number;
    heapFreeKb: number;
    uptimeSeconds: number;
    otaPartition: string;
    firmwareVersion: string;
  };
}

export interface FirmwareFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
