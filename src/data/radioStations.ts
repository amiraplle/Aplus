import { RadioStation, DspPreset } from '../types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'somafm-groovesalad',
    name: 'SomaFM Groove Salad',
    genre: 'Chill / Ambient',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#10b981',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves.'
  },
  {
    id: 'somafm-dronezone',
    name: 'SomaFM Drone Zone',
    genre: 'Ambient / Space',
    url: 'https://ice2.somafm.com/dronezone-128-mp3',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#6366f1',
    description: 'Served best chilled, safe with most medications. Atmospheric textures.'
  },
  {
    id: 'somafm-defcon',
    name: 'SomaFM DEF CON Radio',
    genre: 'Chill Synth / Hacker',
    url: 'https://ice4.somafm.com/defcon-128-mp3',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#06b6d4',
    description: 'Music for hackers, makers and electronic music fans.'
  },
  {
    id: 'jazz24',
    name: 'Jazz24 Seattle',
    genre: 'Smooth Jazz',
    url: 'https://live.wostreaming.net/manifest/knkx-jazz24mp3-ibc2',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#f59e0b',
    description: 'Live jazz legends: Miles Davis, Ella Fitzgerald, John Coltrane.'
  },
  {
    id: 'lofi-chill',
    name: 'Lofi Cafe Radio',
    genre: 'Lofi Hip Hop',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    codec: 'MP3',
    bitrate: '192 kbps',
    logoColor: '#ec4899',
    description: 'Relaxing beats to study, chill, and code to 24/7.'
  },
  {
    id: 'swiss-classic',
    name: 'Radio Swiss Classic',
    genre: 'Classical',
    url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#8b5cf6',
    description: 'Pure classical music without commercial interruptions.'
  },
  {
    id: 'fip-paris',
    name: 'FIP Radio Paris',
    genre: 'Eclectic / World',
    url: 'https://stream.radiofrance.fr/fip/fip.m3u8?id=radiofrance',
    codec: 'AAC',
    bitrate: '192 kbps',
    logoColor: '#ef4444',
    description: 'World-renowned musical journey from Paris across all genres.'
  },
  {
    id: 'deep-house-ibiza',
    name: 'Ibiza Global Radio',
    genre: 'Electronic / Deep House',
    url: 'https://listento.ibizaglobalradio.com:8024/stream',
    codec: 'MP3',
    bitrate: '128 kbps',
    logoColor: '#14b8a6',
    description: 'The finest underground electronic soundscapes from the White Isle.'
  }
];

export const DSP_PRESETS: DspPreset[] = [
  {
    id: 'flat',
    name: 'Flat / Studio',
    bass: 0,
    mid: 0,
    treble: 0,
    icon: 'Volume2'
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    bass: 6,
    mid: 0,
    treble: -1,
    icon: 'Zap'
  },
  {
    id: 'vocal',
    name: 'Vocal Clarity',
    bass: -2,
    mid: 5,
    treble: 2,
    icon: 'Mic'
  },
  {
    id: 'rock',
    name: 'Rock / Dynamic',
    bass: 4,
    mid: -1,
    treble: 3,
    icon: 'Flame'
  },
  {
    id: 'acoustic',
    name: 'Acoustic / Warm',
    bass: 2,
    mid: 2,
    treble: 1,
    icon: 'Music'
  },
  {
    id: 'jazz',
    name: 'Jazz Lounge',
    bass: 3,
    mid: 1,
    treble: 2,
    icon: 'Coffee'
  },
  {
    id: 'classical',
    name: 'Classical Air',
    bass: 1,
    mid: 0,
    treble: 3,
    icon: 'Sparkles'
  },
  {
    id: 'night',
    name: 'Night Mode',
    bass: -4,
    mid: 1,
    treble: -3,
    icon: 'Moon'
  }
];
