/**
 * Web Audio API & HTML5 Audio Engine
 * Provides live audio playback in browser, real-time 3-Tone Biquad DSP filters,
 * and FFT Analyser data for visualizer.
 */

class WebAudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isInitialized = false;

  private onMetadataCallback: ((meta: { title?: string; duration?: number; currentTime?: number }) => void) | null = null;

  public init() {
    if (this.isInitialized) return;

    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.preload = 'none';

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.audioEl && this.onMetadataCallback) {
        this.onMetadataCallback({
          currentTime: this.audioEl.currentTime,
          duration: isFinite(this.audioEl.duration) ? this.audioEl.duration : 0
        });
      }
    });

    this.isInitialized = true;
  }

  private setupAudioGraph() {
    if (!this.audioEl || this.sourceNode) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioEl);

      // 3-Tone DSP Filters:
      // Bass: Lowshelf filter around 100 Hz
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 100;
      this.bassFilter.gain.value = 0;

      // Mid: Peaking filter around 1000 Hz, Q = 1.0
      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = 0;

      // Treble: Highshelf filter around 8000 Hz
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 8000;
      this.trebleFilter.gain.value = 0;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();

      // Analyser for visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect graph: Source -> Bass -> Mid -> Treble -> Gain -> Analyser -> Destination
      this.sourceNode.connect(this.bassFilter);
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio Graph initialization failed or restricted by browser policy:', e);
    }
  }

  public async play(url: string, volume: number, isMuted: boolean): Promise<boolean> {
    this.init();
    if (!this.audioEl) return false;

    try {
      this.setupAudioGraph();

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (this.audioEl.src !== url) {
        this.audioEl.src = url;
        this.audioEl.load();
      }

      this.setVolume(volume, isMuted);
      await this.audioEl.play();
      return true;
    } catch (err) {
      console.warn('Playback error:', err);
      return false;
    }
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public stop() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl.src = '';
    }
  }

  public setVolume(volume: number, isMuted: boolean) {
    const val = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
    }
    if (this.audioEl) {
      this.audioEl.volume = val;
    }
  }

  public setDsp(bass: number, mid: number, treble: number) {
    if (this.bassFilter && this.audioCtx) {
      this.bassFilter.gain.setTargetAtTime(bass, this.audioCtx.currentTime, 0.05);
    }
    if (this.midFilter && this.audioCtx) {
      this.midFilter.gain.setTargetAtTime(mid, this.audioCtx.currentTime, 0.05);
    }
    if (this.trebleFilter && this.audioCtx) {
      this.trebleFilter.gain.setTargetAtTime(treble, this.audioCtx.currentTime, 0.05);
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16).fill(0);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public setMetadataListener(cb: (meta: { title?: string; duration?: number; currentTime?: number }) => void) {
    this.onMetadataCallback = cb;
  }
}

export const audioEngine = new WebAudioEngine();
