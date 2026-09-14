import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Radio, 
  Server, 
  Check, 
  ArrowRight, 
  Save, 
  Smartphone, 
  Cast, 
  Zap, 
  RotateCcw, 
  Sliders, 
  ShieldCheck,
  Power
} from 'lucide-react';
import { AudioReceiverState } from '../types';

interface HardwareAndSetupViewProps {
  state: AudioReceiverState;
  onUpdateHostIp: (host: string) => void;
  onTogglePower: () => void;
  onUpdateDsp: (bass: number, mid: number, treble: number, presetId?: string) => void;
}

export const HardwareAndSetupView: React.FC<HardwareAndSetupViewProps> = ({
  state,
  onUpdateHostIp,
  onTogglePower,
  onUpdateDsp
}) => {
  const [ssidInput, setSsidInput] = useState(state.network.ssid);
  const [passInput, setPassInput] = useState('••••••••••••');
  const [hostInput, setHostInput] = useState('audio-receiver');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'pinout' | 'setup' | 'protocols' | 'nvs'>('setup');

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHostIp(hostInput.endsWith('.local') ? hostInput : `${hostInput}.local`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Sub-tabs inside Hardware & Setup */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#09090b] border border-zinc-800/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('setup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'setup'
              ? 'bg-zinc-200 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Initial Setup & mDNS</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pinout')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pinout'
              ? 'bg-zinc-200 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>UDA1334A I2S Pinout</span>
        </button>

        <button
          onClick={() => setActiveSubTab('protocols')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'protocols'
              ? 'bg-zinc-200 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Cast className="w-3.5 h-3.5" />
          <span>AirPlay & DLNA Protocols</span>
        </button>

        <button
          onClick={() => setActiveSubTab('nvs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'nvs'
              ? 'bg-zinc-200 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>NVS Flash State</span>
        </button>
      </div>

      {/* TAB 1: Initial Setup & mDNS .local server */}
      {activeSubTab === 'setup' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Initial Setup & mDNS Responder</h3>
                  <p className="text-xs text-zinc-500 font-mono">SoftAP Captive Portal ➔ Local Network mDNS</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                ACTIVE: http://{state.network.hostname}
              </span>
            </div>

            {/* Explanation card of the dual setup phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-black/60 rounded-2xl border border-zinc-800/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 font-mono">
                  <span>PHASE 1: SOFTAP CAPTIVE PORTAL</span>
                  <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px]">Unconfigured</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If the ESP32-S3 boots with no saved Wi-Fi credentials or cannot connect to the stored network, it automatically broadcasts an open Wi-Fi network:
                </p>
                <div className="bg-zinc-900/90 rounded-xl p-2.5 text-xs font-mono space-y-1 text-zinc-300">
                  <div><span className="text-zinc-500">SSID:</span> <span className="text-white font-bold">ESP32-AudioReceiver-Setup</span></div>
                  <div><span className="text-zinc-500">IP:</span> <span className="text-cyan-400 font-bold">http://192.168.4.1</span></div>
                  <div><span className="text-zinc-500">DNS:</span> Captive Portal auto-redirect on port 53</div>
                </div>
              </div>

              <div className="bg-black/60 rounded-2xl border border-zinc-800/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 font-mono">
                  <span>PHASE 2: mDNS .LOCAL DISCOVERY</span>
                  <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-800/40">Connected</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Once connected to your home Wi-Fi, the ESP32 registers with multicast DNS (mDNS) responder. You no longer need to look up IP addresses:
                </p>
                <div className="bg-zinc-900/90 rounded-xl p-2.5 text-xs font-mono space-y-1 text-zinc-300">
                  <div><span className="text-zinc-500">mDNS:</span> <span className="text-emerald-400 font-bold">http://{state.network.hostname}</span></div>
                  <div><span className="text-zinc-500">HTTP:</span> Port 80 (Web UI & REST API)</div>
                  <div><span className="text-zinc-500">AirPlay:</span> Port 5000 (_raop._tcp) & 7000</div>
                </div>
              </div>
            </div>

            {/* Interactive Wi-Fi & Hostname Configuration Form */}
            <form onSubmit={handleSaveSetup} className="bg-black/40 rounded-2xl border border-zinc-900 p-4 space-y-3 pt-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Configure Network Credentials & Custom Hostname
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Wi-Fi Network SSID</label>
                  <input
                    type="text"
                    value={ssidInput}
                    onChange={(e) => setSsidInput(e.target.value)}
                    placeholder="Home Wi-Fi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Wi-Fi Password</label>
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="Network Password"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">mDNS Hostname</label>
                  <input
                    type="text"
                    value={hostInput}
                    onChange={(e) => setHostInput(e.target.value)}
                    placeholder="audio-receiver"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-zinc-500 font-mono">
                  Accessible via: <span className="text-cyan-400">http://{hostInput.replace('.local', '')}.local</span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Saved to NVS & Updated!' : 'Save & Register Hostname'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: UDA1334A I2S DAC Pinout Table */}
      {activeSubTab === 'pinout' && (
        <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">UDA1334A I2S Stereo DAC Wiring Matrix</h3>
                <p className="text-xs text-zinc-500 font-mono">High-performance 24-bit 96kHz stereo I2S pipeline</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              No MCLK Required
            </span>
          </div>

          <div className="bg-black/60 rounded-2xl border border-zinc-900 overflow-hidden text-xs font-mono">
            <div className="grid grid-cols-4 bg-zinc-900/80 p-3 font-bold text-zinc-400 border-b border-zinc-800">
              <div>UDA1334A DAC Pin</div>
              <div>ESP32-S3 Pin</div>
              <div>I2S Protocol Signal</div>
              <div>Functional Notes</div>
            </div>
            <div className="divide-y divide-zinc-900 text-zinc-300">
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-cyan-400 font-bold">BCLK / BCK</span>
                <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded w-fit">GPIO 4</span>
                <span className="text-zinc-400">Bit Clock (SCK)</span>
                <span className="text-[11px] text-zinc-500">I2S Continuous Bit Clock</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-cyan-400 font-bold">WCLK / LRC</span>
                <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded w-fit">GPIO 5</span>
                <span className="text-zinc-400">Word Select (WS)</span>
                <span className="text-[11px] text-zinc-500">Left / Right Frame Synchronization</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-cyan-400 font-bold">DIN / DATA</span>
                <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded w-fit">GPIO 6</span>
                <span className="text-zinc-400">Serial Data Out</span>
                <span className="text-[11px] text-zinc-500">24-bit / 16-bit PCM Audio Stream</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-emerald-400 font-bold">VIN / 3V3</span>
                <span className="text-emerald-400 font-bold bg-zinc-800 px-2 py-0.5 rounded w-fit">3V3</span>
                <span className="text-zinc-400">Power Supply</span>
                <span className="text-[11px] text-zinc-500">Clean 3.3V DC regulated rail</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-zinc-400 font-bold">GND</span>
                <span className="text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded w-fit">GND</span>
                <span className="text-zinc-400">Ground Reference</span>
                <span className="text-[11px] text-zinc-500">Common system audio ground</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="text-amber-400 font-bold">MCLK</span>
                <span className="text-zinc-500 italic">Leave Disconnected</span>
                <span className="text-zinc-500">Master Clock</span>
                <span className="text-[11px] text-amber-400 font-medium">UDA1334A has internal PLL from BCLK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AirPlay 2 & DLNA / UPnP Protocols */}
      {activeSubTab === 'protocols' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Apple AirPlay 2 Receiver</h3>
                <p className="text-[11px] text-zinc-500 font-mono">RAOP RTSP Protocol on Port 5000</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Advertised over mDNS as <code className="text-indigo-400">_raop._tcp</code> and <code className="text-indigo-400">_airplay._tcp</code>. Compatible with iOS Control Center, macOS audio output, and Apple Music.
            </p>
            <div className="bg-black/60 rounded-xl p-3 text-xs font-mono space-y-1 text-zinc-300">
              <div><span className="text-zinc-500">Port:</span> 5000 (RTSP 1.0 Server)</div>
              <div><span className="text-zinc-500">Handshake:</span> OPTIONS, ANNOUNCE, SETUP, RECORD</div>
              <div><span className="text-zinc-500">Volume:</span> Synchronized in real-time via SET_PARAMETER</div>
              <div><span className="text-zinc-500">Format:</span> 44.1 kHz, 16-bit, 2-channel ALAC / PCM</div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <Cast className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">DLNA / UPnP MediaRenderer</h3>
                <p className="text-[11px] text-zinc-500 font-mono">SSDP Multicast (UDP 1900) & SOAP</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Discovered automatically by Windows ("Cast to Device"), Android (BubbleUPnP, mConnect), Audirvana, and VLC over UPnP AVTransport:1.
            </p>
            <div className="bg-black/60 rounded-xl p-3 text-xs font-mono space-y-1 text-zinc-300">
              <div><span className="text-zinc-500">SSDP:</span> 239.255.255.250:1900 (MediaRenderer:1)</div>
              <div><span className="text-zinc-500">Device XML:</span> /dlna/device.xml</div>
              <div><span className="text-zinc-500">SOAP Actions:</span> SetAVTransportURI, Play, Pause, Stop</div>
              <div><span className="text-zinc-500">RenderingControl:</span> SetVolume, GetVolume, SetMute</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Stored NVS Flash Memory State */}
      {activeSubTab === 'nvs' && (
        <div className="rounded-3xl bg-[#08090d] border border-zinc-800/80 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">NVS Flash Memory Persistence</h3>
                <p className="text-xs text-zinc-500 font-mono">ESP32 Preferences Flash Partition (Non-Volatile)</p>
              </div>
            </div>

            <button
              onClick={onTogglePower}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                state.isPoweredOn
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{state.isPoweredOn ? 'Test Power Off (Commit to NVS)' : 'Test Power On (Restore from NVS)'}</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Whenever the receiver is manually powered off or modified via the Web UI / REST API, the exact state below is committed into the ESP32’s NVS flash partition. On reboot or power-on, the exact station, DSP biquad filter levels, volume, and mDNS hostname are restored seamlessly.
          </p>

          <div className="bg-black/90 rounded-2xl border border-zinc-900 p-4 font-mono text-xs text-cyan-300">
            <pre className="overflow-x-auto leading-relaxed">
{JSON.stringify({
  pwr: state.isPoweredOn,
  vol: state.volume,
  mute: state.isMuted,
  src: state.source,
  bass: state.dsp.bass,
  mid: state.dsp.mid,
  treble: state.dsp.treble,
  preset: state.dsp.activePreset,
  url: state.metadata.streamUrl,
  st_name: state.metadata.stationOrSource,
  wifi_ssid: state.network.ssid,
  hostname: state.network.hostname
}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
