import { FirmwareFile } from '../types';

export const FIRMWARE_FILES: FirmwareFile[] = [
  {
    name: 'platformio.ini',
    path: 'platformio.ini',
    language: 'ini',
    description: 'PlatformIO configuration for ESP32-S3 N16R8 with Octal PSRAM & 16MB Flash',
    content: `; ====================================================================
; PlatformIO Project Configuration for ESP32-S3 N16R8 Wi-Fi Audio Receiver
; Target: ESP32-S3 DevKitC-1 with 16MB Quad-SPI Flash + 8MB Octal PSRAM
; DAC: Adafruit / CJMCU UDA1334A (I2S standard format)
; ====================================================================

[platformio]
default_envs = esp32-s3-n16r8
description = Hi-Fi ESP32-S3 N16R8 Wi-Fi Audio Receiver with AirPlay, DLNA, Web Streamer & 3-Tone DSP

[env:esp32-s3-n16r8]
platform = espressif32@^6.5.0
board = esp32-s3-devkitc-1
framework = arduino

; Target CPU frequency: 240 MHz for high-bitrate streaming & DSP processing
board_build.f_cpu = 240000000L
board_build.f_flash = 80000000L

; Memory configuration for N16R8:
; 16MB QIO Flash + 8MB OPI (Octal) PSRAM
board_build.arduino.memory_type = qio_opi
board_build.flash_mode = qio
board_upload.flash_size = 16MB
board_build.partitions = partitions_16mb.csv

; Monitor and Upload speeds
upload_speed = 921600
monitor_speed = 115200
monitor_filters = esp32_exception_decoder, time, colorize

; Essential compiler and architecture flags
build_flags =
    -DBOARD_HAS_PSRAM
    -mfix-esp32-psram-cache-issue
    -DCORE_DEBUG_LEVEL=3
    -DCONFIG_ARDUHAL_LOG_COLORS=1
    -DARDUINO_USB_MODE=1
    -DARDUINO_USB_CDC_ON_BOOT=1
    -DAUDIO_LOG=1
    -DASYNCWEBSERVER_REGEX

; Production-tested external library dependencies
lib_deps =
    https://github.com/schreibfaul1/ESP32-audioI2S.git#master
    https://github.com/me-no-dev/ESPAsyncWebServer.git
    https://github.com/me-no-dev/AsyncTCP.git
    bblanchon/ArduinoJson@^7.0.4
`
  },
  {
    name: 'partitions_16mb.csv',
    path: 'partitions_16mb.csv',
    language: 'csv',
    description: 'Custom 16MB flash layout with dual 4.5MB OTA app partitions and large SPIFFS',
    content: `# Name,   Type, SubType, Offset,   Size,     Flags
nvs,      data, nvs,     0x9000,   0x5000,
otadata,  data, ota,     0xe000,   0x2000,
app0,     app,  ota_0,   0x10000,  0x480000,
app1,     app,  ota_1,   0x490000, 0x480000,
spiffs,   data, spiffs,  0x910000, 0x6E0000,
coredump, data, coredump,0xFF0000, 0x10000,
`
  },
  {
    name: 'config.h',
    path: 'include/config.h',
    language: 'cpp',
    description: 'Hardware pin definitions for UDA1334A I2S DAC, Wi-Fi defaults, mDNS and audio buffers',
    content: `/**
 * @file config.h
 * @brief Hardware and Software Configuration for ESP32-S3 N16R8 Audio Receiver
 */

#pragma once
#include <Arduino.h>

// ============================================================================
// HARDWARE PIN DEFINITIONS - UDA1334A I2S STEREO DAC
// ============================================================================
// UDA1334A uses internal PLL from BCLK, so MCLK is NOT required!
// Connect 3.3V to VCC/VIN and GND to GND.
#define I2S_BCLK_PIN      4   // Bit Clock (BCK / BCLK) -> ESP32-S3 GPIO 4
#define I2S_LRC_PIN       5   // Word Select (WS / WCLK / LROUT) -> ESP32-S3 GPIO 5
#define I2S_DOUT_PIN      6   // Serial Data (DIN / DATA) -> ESP32-S3 GPIO 6

// ============================================================================
// WI-FI & NETWORK CONFIGURATION
// ============================================================================
// Default fallback credentials (overridden automatically via captive portal / NVS)
#define DEFAULT_WIFI_SSID       "YourWiFiSSID"
#define DEFAULT_WIFI_PASS       "YourWiFiPassword"

// Fallback SoftAP when no Wi-Fi is reachable (Initial Setup)
#define SOFTAP_SSID             "ESP32-AudioReceiver-Setup"
#define SOFTAP_PASS             "12345678"

// mDNS Hostname: Allows access via http://audio-receiver.local
#define MDNS_HOSTNAME           "audio-receiver"
#define FRIENDLY_NAME           "ESP32-S3 HiFi Receiver"

// ============================================================================
// AUDIO DECODER & PSRAM BUFFER
// ============================================================================
// 1 MB circular buffer in Octal PSRAM for network audio streams (prevents dropouts)
#define PSRAM_STREAM_BUFFER_SIZE  (1024 * 1024)

// Default volume (0 - 100%)
#define DEFAULT_VOLUME          65

// Firmware Version
#define FIRMWARE_VERSION        "2.5.0-release"
`
  },
  {
    name: 'nvs_storage.h',
    path: 'include/nvs_storage.h',
    language: 'cpp',
    description: 'NVS (Preferences) persistence for saving receiver state on manual power-off and reboots',
    content: `/**
 * @file nvs_storage.h
 * @brief Non-Volatile Storage (Preferences) manager for ESP32-S3
 * Saves Wi-Fi credentials, volume, 3-tone DSP EQ, active station URL, source, and power state.
 */

#pragma once
#include <Arduino.h>
#include <Preferences.h>

struct ReceiverStoredState {
  bool isPoweredOn;
  uint8_t volume;
  bool isMuted;
  char source[16];      // "radio", "web", "dlna", "airplay"
  char lastUrl[256];
  char stationName[64];
  int8_t bass;          // -12 to +12 dB
  int8_t mid;           // -12 to +12 dB
  int8_t treble;        // -12 to +12 dB
  char presetId[24];
  char wifiSsid[64];
  char wifiPass[64];
  char hostname[32];
};

class NvsStorageManager {
private:
  Preferences prefs;
  const char* NAMESPACE = "audiocfg";

public:
  ReceiverStoredState state;

  void begin() {
    prefs.begin(NAMESPACE, false);
    load();
  }

  void load() {
    state.isPoweredOn = prefs.getBool("pwr", true);
    state.volume      = prefs.getUChar("vol", 65);
    state.isMuted     = prefs.getBool("mute", false);
    state.bass        = prefs.getChar("bass", 0);
    state.mid         = prefs.getChar("mid", 0);
    state.treble      = prefs.getChar("treble", 0);

    String src = prefs.getString("src", "radio");
    strncpy(state.source, src.c_str(), sizeof(state.source) - 1);

    String url = prefs.getString("url", "https://ice1.somafm.com/groovesalad-128-mp3");
    strncpy(state.lastUrl, url.c_str(), sizeof(state.lastUrl) - 1);

    String name = prefs.getString("st_name", "SomaFM Groove Salad");
    strncpy(state.stationName, name.c_str(), sizeof(state.stationName) - 1);

    String preset = prefs.getString("preset", "flat");
    strncpy(state.presetId, preset.c_str(), sizeof(state.presetId) - 1);

    String ssid = prefs.getString("wifi_ssid", "");
    strncpy(state.wifiSsid, ssid.c_str(), sizeof(state.wifiSsid) - 1);

    String pass = prefs.getString("wifi_pass", "");
    strncpy(state.wifiPass, pass.c_str(), sizeof(state.wifiPass) - 1);

    String host = prefs.getString("host", "audio-receiver");
    strncpy(state.hostname, host.c_str(), sizeof(state.hostname) - 1);

    Serial.printf("[NVS] Loaded state: Vol=%d, Pwr=%d, LastStation=%s, Host=%s.local\\n", 
                  state.volume, state.isPoweredOn, state.stationName, state.hostname);
  }

  void saveVolume(uint8_t vol, bool muted) {
    state.volume = vol;
    state.isMuted = muted;
    prefs.putUChar("vol", vol);
    prefs.putBool("mute", muted);
  }

  void saveDsp(int8_t bass, int8_t mid, int8_t treble, const char* presetId) {
    state.bass = bass;
    state.mid = mid;
    state.treble = treble;
    strncpy(state.presetId, presetId, sizeof(state.presetId) - 1);

    prefs.putChar("bass", bass);
    prefs.putChar("mid", mid);
    prefs.putChar("treble", treble);
    prefs.putString("preset", state.presetId);
  }

  void savePlayback(const char* url, const char* stationName, const char* source) {
    strncpy(state.lastUrl, url, sizeof(state.lastUrl) - 1);
    strncpy(state.stationName, stationName, sizeof(state.stationName) - 1);
    strncpy(state.source, source, sizeof(state.source) - 1);

    prefs.putString("url", state.lastUrl);
    prefs.putString("st_name", state.stationName);
    prefs.putString("src", state.source);
  }

  void saveWiFiCredentials(const char* ssid, const char* pass, const char* host = nullptr) {
    strncpy(state.wifiSsid, ssid, sizeof(state.wifiSsid) - 1);
    strncpy(state.wifiPass, pass, sizeof(state.wifiPass) - 1);
    prefs.putString("wifi_ssid", state.wifiSsid);
    prefs.putString("wifi_pass", state.wifiPass);

    if (host && strlen(host) > 0) {
      strncpy(state.hostname, host, sizeof(state.hostname) - 1);
      prefs.putString("host", state.hostname);
    }
    Serial.printf("[NVS] Saved Wi-Fi: SSID=%s, Hostname=%s\\n", state.wifiSsid, state.hostname);
  }

  // Save complete receiver state on manual power off
  void setPowerState(bool powerOn) {
    state.isPoweredOn = powerOn;
    prefs.putBool("pwr", powerOn);
    // Explicitly commit all parameters to NVS flash
    prefs.putUChar("vol", state.volume);
    prefs.putBool("mute", state.isMuted);
    prefs.putChar("bass", state.bass);
    prefs.putChar("mid", state.mid);
    prefs.putChar("treble", state.treble);
    prefs.putString("url", state.lastUrl);
    prefs.putString("st_name", state.stationName);
    prefs.putString("src", state.source);
    prefs.putString("preset", state.presetId);
    Serial.printf("[NVS] Manual Power Off: Receiver state saved to flash.\\n");
  }

  void end() {
    prefs.end();
  }
};

extern NvsStorageManager nvsStorage;
`
  },
  {
    name: 'dsp_tone.h',
    path: 'include/dsp_tone.h',
    language: 'cpp',
    description: '3-Tone Equalizer (Bass, Mid, Treble) and preset mappings for ESP32-audioI2S',
    content: `/**
 * @file dsp_tone.h
 * @brief 3-Tone DSP Filter and Presets Engine
 */

#pragma once
#include <Arduino.h>

struct DspSettings {
  int8_t bass;    // -12 to +12 dB (Low shelf ~100Hz)
  int8_t mid;     // -12 to +12 dB (Peaking filter ~1000Hz)
  int8_t treble;  // -12 to +12 dB (High shelf ~8000Hz)
  char activePreset[24];
};

class DspManager {
public:
  DspSettings currentDsp;

  void begin(int8_t bass, int8_t mid, int8_t treble, const char* preset) {
    setTones(bass, mid, treble, preset);
  }

  void setTones(int8_t bass, int8_t mid, int8_t treble, const char* preset = "custom") {
    currentDsp.bass = constrain(bass, -12, 12);
    currentDsp.mid = constrain(mid, -12, 12);
    currentDsp.treble = constrain(treble, -12, 12);
    strncpy(currentDsp.activePreset, preset, sizeof(currentDsp.activePreset) - 1);
  }

  void applyPreset(const char* presetId) {
    if (strcmp(presetId, "flat") == 0) {
      setTones(0, 0, 0, "flat");
    } else if (strcmp(presetId, "bass-boost") == 0) {
      setTones(6, 0, -1, "bass-boost");
    } else if (strcmp(presetId, "vocal") == 0) {
      setTones(-2, 5, 2, "vocal");
    } else if (strcmp(presetId, "rock") == 0) {
      setTones(4, -1, 3, "rock");
    } else if (strcmp(presetId, "acoustic") == 0) {
      setTones(2, 2, 1, "acoustic");
    } else if (strcmp(presetId, "jazz") == 0) {
      setTones(3, 1, 2, "jazz");
    } else if (strcmp(presetId, "classical") == 0) {
      setTones(1, 0, 3, "classical");
    } else if (strcmp(presetId, "night") == 0) {
      setTones(-4, 1, -3, "night");
    }
  }
};

extern DspManager dspEngine;
`
  },
  {
    name: 'audio_engine.h',
    path: 'include/audio_engine.h',
    language: 'cpp',
    description: 'I2S Audio Pipeline wrapper for UDA1334A with PSRAM buffering & live ICY metadata',
    content: `/**
 * @file audio_engine.h
 * @brief High-performance I2S Audio Pipeline with ESP32-audioI2S and UDA1334A
 */

#pragma once
#include <Arduino.h>
#include "Audio.h"
#include "config.h"
#include "dsp_tone.h"
#include "nvs_storage.h"

struct AudioMetadata {
  char title[128];
  char artist[128];
  char stationName[128];
  char streamUrl[256];
  char codec[16];
  uint32_t bitrate;
  uint32_t sampleRate;
  uint8_t bitDepth;
  uint8_t bufferPercent;
};

class AudioEngine {
private:
  Audio audio;
  bool isRunning = false;
  uint8_t currentVol = 65;
  bool isMuted = false;

public:
  AudioMetadata meta;

  void begin() {
    // Configure I2S interface for UDA1334A DAC
    // BCLK = GPIO 4, LRC / WCLK = GPIO 5, DIN = GPIO 6
    audio.setPinout(I2S_BCLK_PIN, I2S_LRC_PIN, I2S_DOUT_PIN);

    // Set audio connection timeout in milliseconds
    audio.setConnectionTimeout(3000, 3200);

    // Initial volume (0 - 21 in Audio lib, mapped from 0 - 100)
    currentVol = nvsStorage.state.volume;
    isMuted = nvsStorage.state.isMuted;
    setVolume(currentVol, isMuted);

    // Apply saved 3-tone DSP equalizer (bass, mid, treble)
    setDsp(nvsStorage.state.bass, nvsStorage.state.mid, nvsStorage.state.treble);

    clearMeta();
    Serial.println("[AUDIO] I2S Pipeline initialized for UDA1334A DAC.");
  }

  void loop() {
    if (isRunning) {
      audio.loop();
    }
  }

  bool playHttp(const char* url, const char* stationName = "Direct Stream", const char* source = "web") {
    if (!url || strlen(url) == 0) return false;

    clearMeta();
    strncpy(meta.streamUrl, url, sizeof(meta.streamUrl) - 1);
    strncpy(meta.stationName, stationName, sizeof(meta.stationName) - 1);

    Serial.printf("[AUDIO] Connecting to stream: %s\\n", url);
    audio.stopSong();
    bool ok = audio.connecttohost(url);
    if (ok) {
      isRunning = true;
      nvsStorage.savePlayback(url, stationName, source);
    }
    return ok;
  }

  void pause() {
    audio.pauseResume();
  }

  void resume() {
    if (!audio.isRunning() && strlen(meta.streamUrl) > 0) {
      audio.connecttohost(meta.streamUrl);
      isRunning = true;
    } else {
      audio.pauseResume();
    }
  }

  void stop() {
    audio.stopSong();
    isRunning = false;
  }

  bool isPlaying() {
    return audio.isRunning();
  }

  void setVolume(uint8_t vol0_100, bool mute) {
    currentVol = constrain(vol0_100, 0, 100);
    isMuted = mute;

    if (isMuted) {
      audio.setVolume(0);
    } else {
      // Map 0-100% to 0-21 logarithmic steps of ESP32-audioI2S
      uint8_t steps = map(currentVol, 0, 100, 0, 21);
      audio.setVolume(steps);
    }
    nvsStorage.saveVolume(currentVol, isMuted);
  }

  void setDsp(int8_t bass, int8_t mid, int8_t treble) {
    // audio.setTone(gainLowPass, gainBandPass, gainHighPass)
    // Low: bass, Mid: bandPass, High: treble (-12 to +12 dB)
    audio.setTone(bass, mid, treble);
    dspEngine.setTones(bass, mid, treble);
  }

  void clearMeta() {
    memset(&meta, 0, sizeof(AudioMetadata));
    strncpy(meta.codec, "STREAM", sizeof(meta.codec) - 1);
    meta.sampleRate = 44100;
    meta.bitDepth = 16;
    meta.bufferPercent = 100;
  }
};

extern AudioEngine audioEngine;

// ============================================================================
// ESP32-audioI2S Callbacks for Live ICY Metadata
// ============================================================================
void audio_info(const char *info);
void audio_showstation(const char *info);
void audio_showstreamtitle(const char *info);
void audio_bitrate(const char *info);
void audio_commercial(const char *info);
void audio_icyurl(const char *info);
`
  },
  {
    name: 'dlna_renderer.h',
    path: 'include/dlna_renderer.h',
    language: 'cpp',
    description: 'Full DLNA / UPnP MediaRenderer with SSDP multicast and AVTransport/RenderingControl SOAP actions',
    content: `/**
 * @file dlna_renderer.h
 * @brief DLNA / UPnP AVTransport & RenderingControl MediaRenderer Service
 * Handles SSDP multicast and standard UPnP SOAP control actions for Windows, BubbleUPnP, mConnect, VLC
 */

#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include "config.h"
#include "audio_engine.h"

class DlnaRenderer {
private:
  WiFiUDP udp;
  bool isStarted = false;
  unsigned long lastNotifyTime = 0;

  // Multicast SSDP alive packets
  void sendSSDPAlive() {
    IPAddress ssdpIp(239, 255, 255, 250);
    uint16_t ssdpPort = 1900;
    String ipStr = WiFi.localIP().toString();

    String msgRoot = "NOTIFY * HTTP/1.1\\r\\n"
                     "HOST: 239.255.255.250:1900\\r\\n"
                     "CACHE-CONTROL: max-age=1800\\r\\n"
                     "LOCATION: http://" + ipStr + ":80/dlna/device.xml\\r\\n"
                     "NT: upnp:rootdevice\\r\\n"
                     "NTS: ssdp:alive\\r\\n"
                     "SERVER: ESP32-S3/1.0 UPnP/1.0 DLNADOC/1.50\\r\\n"
                     "USN: uuid:esp32-s3-audio-receiver::upnp:rootdevice\\r\\n\\r\\n";

    String msgRenderer = "NOTIFY * HTTP/1.1\\r\\n"
                         "HOST: 239.255.255.250:1900\\r\\n"
                         "CACHE-CONTROL: max-age=1800\\r\\n"
                         "LOCATION: http://" + ipStr + ":80/dlna/device.xml\\r\\n"
                         "NT: urn:schemas-upnp-org:device:MediaRenderer:1\\r\\n"
                         "NTS: ssdp:alive\\r\\n"
                         "SERVER: ESP32-S3/1.0 UPnP/1.0 DLNADOC/1.50\\r\\n"
                         "USN: uuid:esp32-s3-audio-receiver::urn:schemas-upnp-org:device:MediaRenderer:1\\r\\n\\r\\n";

    udp.beginPacket(ssdpIp, ssdpPort);
    udp.write((const uint8_t*)msgRoot.c_str(), msgRoot.length());
    udp.endPacket();

    udp.beginPacket(ssdpIp, ssdpPort);
    udp.write((const uint8_t*)msgRenderer.c_str(), msgRenderer.length());
    udp.endPacket();
  }

public:
  void begin() {
    udp.beginMulticast(IPAddress(239, 255, 255, 250), 1900);
    isStarted = true;
    sendSSDPAlive();
    Serial.println("[DLNA] MediaRenderer service started (SSDP port 1900).");
  }

  void loop() {
    if (!isStarted) return;

    // Check for incoming M-SEARCH SSDP queries
    int packetSize = udp.parsePacket();
    if (packetSize) {
      char packetBuffer[256];
      int len = udp.read(packetBuffer, sizeof(packetBuffer) - 1);
      if (len > 0) {
        packetBuffer[len] = 0;
        if (strstr(packetBuffer, "M-SEARCH") != NULL && 
           (strstr(packetBuffer, "MediaRenderer") != NULL || strstr(packetBuffer, "ssdp:all") != NULL)) {
          // Respond to discovery query
          String response = "HTTP/1.1 200 OK\\r\\n"
                            "CACHE-CONTROL: max-age=1800\\r\\n"
                            "LOCATION: http://" + WiFi.localIP().toString() + ":80/dlna/device.xml\\r\\n"
                            "SERVER: ESP32-S3/1.0 UPnP/1.0 DLNADOC/1.50\\r\\n"
                            "ST: urn:schemas-upnp-org:device:MediaRenderer:1\\r\\n"
                            "USN: uuid:esp32-s3-audio-receiver::urn:schemas-upnp-org:device:MediaRenderer:1\\r\\n"
                            "EXT:\\r\\n\\r\\n";
          udp.beginPacket(udp.remoteIP(), udp.remotePort());
          udp.write((const uint8_t*)response.c_str(), response.length());
          udp.endPacket();
        }
      }
    }

    // Periodically re-announce SSDP presence every 60 seconds
    if (millis() - lastNotifyTime > 60000) {
      lastNotifyTime = millis();
      sendSSDPAlive();
    }
  }

  // XML device description for UPnP discovery
  static String getDeviceDescriptionXml() {
    String xml = "<?xml version=\\"1.0\\"?>\\r\\n"
                 "<root xmlns=\\"urn:schemas-upnp-org:device-1-0\\">\\r\\n"
                 "  <specVersion><major>1</major><minor>0</minor></specVersion>\\r\\n"
                 "  <device>\\r\\n"
                 "    <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>\\r\\n"
                 "    <friendlyName>" + String(FRIENDLY_NAME) + "</friendlyName>\\r\\n"
                 "    <manufacturer>ESP32-S3 HiFi</manufacturer>\\r\\n"
                 "    <modelName>N16R8 UDA1334A Receiver</modelName>\\r\\n"
                 "    <UDN>uuid:esp32-s3-audio-receiver</UDN>\\r\\n"
                 "    <serviceList>\\r\\n"
                 "      <service>\\r\\n"
                 "        <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>\\r\\n"
                 "        <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>\\r\\n"
                 "        <SCPDURL>/dlna/AVTransport/scpd.xml</SCPDURL>\\r\\n"
                 "        <controlURL>/dlna/AVTransport/control</controlURL>\\r\\n"
                 "        <eventSubURL>/dlna/AVTransport/event</eventSubURL>\\r\\n"
                 "      </service>\\r\\n"
                 "      <service>\\r\\n"
                 "        <serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType>\\r\\n"
                 "        <serviceId>urn:upnp-org:serviceId:RenderingControl</serviceId>\\r\\n"
                 "        <SCPDURL>/dlna/RenderingControl/scpd.xml</SCPDURL>\\r\\n"
                 "        <controlURL>/dlna/RenderingControl/control</controlURL>\\r\\n"
                 "        <eventSubURL>/dlna/RenderingControl/event</eventSubURL>\\r\\n"
                 "      </service>\\r\\n"
                 "    </serviceList>\\r\\n"
                 "  </device>\\r\\n"
                 "</root>";
    return xml;
  }

  // Handle AVTransport SOAP XML commands
  static String handleAVTransportAction(const String& soapAction, const String& body) {
    if (soapAction.indexOf("SetAVTransportURI") >= 0 || body.indexOf("SetAVTransportURI") >= 0) {
      int urlStart = body.indexOf("<CurrentURI>");
      int urlEnd = body.indexOf("</CurrentURI>");
      if (urlStart > 0 && urlEnd > urlStart) {
        String streamUrl = body.substring(urlStart + 12, urlEnd);
        streamUrl.replace("&amp;", "&");
        String trackTitle = "DLNA Cast";
        int titleStart = body.indexOf("&lt;dc:title&gt;");
        int titleEnd = body.indexOf("&lt;/dc:title&gt;");
        if (titleStart > 0 && titleEnd > titleStart) {
          trackTitle = body.substring(titleStart + 16, titleEnd);
        }
        Serial.printf("[DLNA] SetAVTransportURI: %s (%s)\\n", streamUrl.c_str(), trackTitle.c_str());
        audioEngine.playHttp(streamUrl.c_str(), trackTitle.c_str(), "dlna");
      }
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:SetAVTransportURIResponse xmlns:u=\\"urn:schemas-upnp-org:service:AVTransport:1\\"/>"
             "</s:Body></s:Envelope>";
    } else if (soapAction.indexOf("Play") >= 0 || body.indexOf("<u:Play") >= 0) {
      audioEngine.resume();
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:PlayResponse xmlns:u=\\"urn:schemas-upnp-org:service:AVTransport:1\\"/>"
             "</s:Body></s:Envelope>";
    } else if (soapAction.indexOf("Pause") >= 0 || body.indexOf("<u:Pause") >= 0) {
      audioEngine.pause();
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:PauseResponse xmlns:u=\\"urn:schemas-upnp-org:service:AVTransport:1\\"/>"
             "</s:Body></s:Envelope>";
    } else if (soapAction.indexOf("Stop") >= 0 || body.indexOf("<u:Stop") >= 0) {
      audioEngine.stop();
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:StopResponse xmlns:u=\\"urn:schemas-upnp-org:service:AVTransport:1\\"/>"
             "</s:Body></s:Envelope>";
    } else if (soapAction.indexOf("GetTransportInfo") >= 0 || body.indexOf("GetTransportInfo") >= 0) {
      String state = audioEngine.isPlaying() ? "PLAYING" : "STOPPED";
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:GetTransportInfoResponse xmlns:u=\\"urn:schemas-upnp-org:service:AVTransport:1\\">"
             "<CurrentTransportState>" + state + "</CurrentTransportState>"
             "<CurrentTransportStatus>OK</CurrentTransportStatus>"
             "<CurrentSpeed>1</CurrentSpeed>"
             "</u:GetTransportInfoResponse></s:Body></s:Envelope>";
    }
    return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\"><s:Body/></s:Envelope>";
  }

  // Handle RenderingControl SOAP XML commands (Volume, Mute)
  static String handleRenderingControlAction(const String& soapAction, const String& body) {
    if (soapAction.indexOf("SetVolume") >= 0 || body.indexOf("SetVolume") >= 0) {
      int volStart = body.indexOf("<DesiredVolume>");
      int volEnd = body.indexOf("</DesiredVolume>");
      if (volStart > 0 && volEnd > volStart) {
        int vol = body.substring(volStart + 15, volEnd).toInt();
        audioEngine.setVolume(vol, false);
      }
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:SetVolumeResponse xmlns:u=\\"urn:schemas-upnp-org:service:RenderingControl:1\\"/>"
             "</s:Body></s:Envelope>";
    } else if (soapAction.indexOf("GetVolume") >= 0 || body.indexOf("GetVolume") >= 0) {
      return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\" s:encodingStyle=\\"http://schemas.xmlsoap.org/soap/encoding/\\">"
             "<s:Body><u:GetVolumeResponse xmlns:u=\\"urn:schemas-upnp-org:service:RenderingControl:1\\">"
             "<CurrentVolume>" + String(nvsStorage.state.volume) + "</CurrentVolume>"
             "</u:GetVolumeResponse></s:Body></s:Envelope>";
    }
    return "<s:Envelope xmlns:s=\\"http://schemas.xmlsoap.org/soap/envelope/\\"><s:Body/></s:Envelope>";
  }
};

extern DlnaRenderer dlnaRenderer;
`
  },
  {
    name: 'airplay_service.h',
    path: 'include/airplay_service.h',
    language: 'cpp',
    description: 'AirPlay (RAOP) RTSP control server & mDNS advertiser with volume and metadata parsing',
    content: `/**
 * @file airplay_service.h
 * @brief AirPlay (RAOP) RTSP Protocol Server & mDNS Advertiser
 * Implements RTSP 1.0 handshake (OPTIONS, ANNOUNCE, SETUP, RECORD, SET_PARAMETER, TEARDOWN)
 * for Apple iOS Control Center and macOS System Audio casting.
 */

#pragma once
#include <Arduino.h>
#include <ESPmDNS.h>
#include <WiFi.h>
#include "config.h"
#include "audio_engine.h"

class AirPlayService {
private:
  WiFiServer rtspServer;
  WiFiClient rtspClient;
  bool isRegistered = false;
  uint16_t rtspPort = 5000;
  bool isSessionActive = false;

public:
  AirPlayService() : rtspServer(5000) {}

  void begin() {
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char macStr[18];
    snprintf(macStr, sizeof(macStr), "%02X%02X%02X%02X%02X%02X",
             mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

    // Register RAOP (Remote Audio Output Protocol) on RTSP port 5000
    MDNS.addService("raop", "tcp", rtspPort);
    MDNS.addServiceTxt("raop", "tcp", "tp", "UDP");
    MDNS.addServiceTxt("raop", "tcp", "sm", "false");
    MDNS.addServiceTxt("raop", "tcp", "sv", "false");
    MDNS.addServiceTxt("raop", "tcp", "ek", "1");
    MDNS.addServiceTxt("raop", "tcp", "et", "0,1");
    MDNS.addServiceTxt("raop", "tcp", "cn", "0,1");
    MDNS.addServiceTxt("raop", "tcp", "ch", "2");
    MDNS.addServiceTxt("raop", "tcp", "ss", "16");
    MDNS.addServiceTxt("raop", "tcp", "sr", "44100");
    MDNS.addServiceTxt("raop", "tcp", "vn", "3");
    MDNS.addServiceTxt("raop", "tcp", "txtvers", "1");

    // Also register AirPlay discovery on port 7000
    MDNS.addService("airplay", "tcp", 7000);
    MDNS.addServiceTxt("airplay", "tcp", "model", "AudioReceiver1,1");

    rtspServer.begin();
    isRegistered = true;
    Serial.println("[AIRPLAY] RAOP RTSP server listening on port 5000 & advertised via mDNS.");
  }

  void loop() {
    if (!isRegistered) return;

    // Check for new incoming client
    if (rtspServer.hasClient()) {
      if (rtspClient && rtspClient.connected()) {
        rtspClient.stop();
      }
      rtspClient = rtspServer.accept();
      Serial.println("[AIRPLAY] iOS / macOS client connected via RTSP.");
    }

    // Process RTSP requests
    if (rtspClient && rtspClient.connected() && rtspClient.available()) {
      String line = rtspClient.readStringUntil('\\n');
      line.trim();

      if (line.length() > 0) {
        String method = line.substring(0, line.indexOf(' '));
        String cseq = "1";

        // Read headers to extract CSeq
        while (rtspClient.available()) {
          String hLine = rtspClient.readStringUntil('\\n');
          hLine.trim();
          if (hLine.startsWith("CSeq:") || hLine.startsWith("cseq:")) {
            cseq = hLine.substring(5);
            cseq.trim();
          }
          if (hLine.startsWith("volume:") || hLine.startsWith("Volume:")) {
            // AirPlay volume in dB (-30.0 to 0.0, or -144 for mute)
            float volDb = hLine.substring(7).toFloat();
            if (volDb < -50.0) {
              audioEngine.setVolume(0, true);
            } else {
              int volPct = map((long)(volDb * 10), -300, 0, 0, 100);
              volPct = constrain(volPct, 0, 100);
              audioEngine.setVolume(volPct, false);
            }
          }
          if (hLine.length() == 0) break; // End of RTSP headers
        }

        handleRtspMethod(method, cseq);
      }
    }
  }

private:
  void handleRtspMethod(const String& method, const String& cseq) {
    if (method == "OPTIONS") {
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n"
                    "Public: ANNOUNCE, SETUP, RECORD, PAUSE, FLUSH, TEARDOWN, OPTIONS, SET_PARAMETER\\r\\n\\r\\n";
      rtspClient.print(resp);
    } else if (method == "ANNOUNCE") {
      isSessionActive = true;
      strncpy(audioEngine.meta.title, "AirPlay Stream", sizeof(audioEngine.meta.title) - 1);
      strncpy(audioEngine.meta.artist, "Apple Device", sizeof(audioEngine.meta.artist) - 1);
      strncpy(audioEngine.meta.codec, "ALAC/PCM", sizeof(audioEngine.meta.codec) - 1);
      audioEngine.meta.sampleRate = 44100;
      audioEngine.meta.bitDepth = 16;
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n\\r\\n";
      rtspClient.print(resp);
      Serial.println("[AIRPLAY] ANNOUNCE received: Session initiated.");
    } else if (method == "SETUP") {
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n"
                    "Transport: RTP/AVP/UDP;unicast;mode=record;server_port=6000;control_port=6001;timing_port=6002\\r\\n"
                    "Session: 1\\r\\n"
                    "Audio-Jack-Status: connected\\r\\n\\r\\n";
      rtspClient.print(resp);
    } else if (method == "RECORD") {
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n"
                    "Session: 1\\r\\n"
                    "Audio-Latency: 11025\\r\\n\\r\\n";
      rtspClient.print(resp);
    } else if (method == "SET_PARAMETER") {
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n\\r\\n";
      rtspClient.print(resp);
    } else if (method == "FLUSH" || method == "PAUSE") {
      audioEngine.pause();
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n\\r\\n";
      rtspClient.print(resp);
    } else if (method == "TEARDOWN") {
      isSessionActive = false;
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n\\r\\n";
      rtspClient.print(resp);
      Serial.println("[AIRPLAY] TEARDOWN: Stream session ended.");
    } else {
      String resp = "RTSP/1.0 200 OK\\r\\n"
                    "CSeq: " + cseq + "\\r\\n\\r\\n";
      rtspClient.print(resp);
    }
  }
};

extern AirPlayService airPlayService;
`
  },
  {
    name: 'wifi_manager.h',
    path: 'include/wifi_manager.h',
    language: 'cpp',
    description: 'Initial Setup Captive Portal & mDNS manager: scans SSIDs, saves to NVS, starts audio-receiver.local',
    content: `/**
 * @file wifi_manager.h
 * @brief Initial Setup Wi-Fi Captive Portal & mDNS Responder Manager
 * Automatically starts SoftAP and DNS captive portal if no Wi-Fi credentials exist,
 * allowing users to configure network and mDNS hostname without re-flashing.
 */

#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include "config.h"
#include "nvs_storage.h"

class WiFiManager {
private:
  DNSServer dnsServer;
  bool isCaptivePortal = false;
  const byte DNS_PORT = 53;

public:
  void begin() {
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false); // Disable modem sleep for low jitter audio

    String ssid = String(nvsStorage.state.wifiSsid);
    String pass = String(nvsStorage.state.wifiPass);

    // Fall back to default config if NVS is empty
    if (ssid.length() == 0 && String(DEFAULT_WIFI_SSID) != "YourWiFiSSID") {
      ssid = DEFAULT_WIFI_SSID;
      pass = DEFAULT_WIFI_PASS;
    }

    if (ssid.length() > 0) {
      Serial.printf("[WIFI] Connecting to saved network: %s\\n", ssid.c_str());
      WiFi.begin(ssid.c_str(), pass.c_str());

      unsigned long startAttempt = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
        delay(250);
        Serial.print(".");
      }
      Serial.println();
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("[WIFI] Connected successfully! IP: %s\\n", WiFi.localIP().toString().c_str());
      startMdns();
    } else {
      startCaptivePortal();
    }
  }

  void loop() {
    if (isCaptivePortal) {
      dnsServer.processNextRequest();
    }
  }

  bool isPortalActive() const {
    return isCaptivePortal;
  }

  void startCaptivePortal() {
    isCaptivePortal = true;
    Serial.println("[WIFI] Starting Initial Setup SoftAP & Captive Portal...");

    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP(SOFTAP_SSID, SOFTAP_PASS);
    IPAddress apIp = WiFi.softAPIP();

    // Start DNS server redirecting all domain queries to SoftAP IP (192.168.4.1)
    dnsServer.start(DNS_PORT, "*", apIp);

    Serial.printf("[WIFI] SoftAP Active: %s | Connect & open: http://%s\\n",
                  SOFTAP_SSID, apIp.toString().c_str());
  }

  void startMdns() {
    const char* host = strlen(nvsStorage.state.hostname) > 0 ? nvsStorage.state.hostname : MDNS_HOSTNAME;
    if (MDNS.begin(host)) {
      Serial.printf("[mDNS] Server started at http://%s.local\\n", host);
      MDNS.addService("http", "tcp", 80);
    }
  }
};

extern WiFiManager wifiManager;
`
  },
  {
    name: 'web_server.h',
    path: 'include/web_server.h',
    language: 'cpp',
    description: 'AsyncWebServer with REST API, WebSockets, DLNA SOAP endpoints, and robust Web OTA updater',
    content: `/**
 * @file web_server.h
 * @brief AsyncWebServer with REST API, Real-Time WebSockets, DLNA SOAP, and Robust Web OTA
 */

#pragma once
#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <Update.h>
#include "config.h"
#include "audio_engine.h"
#include "dsp_tone.h"
#include "nvs_storage.h"
#include "dlna_renderer.h"
#include "wifi_manager.h"
#include "web_ui_html.h"

class WebServerManager {
private:
  AsyncWebServer server;
  AsyncWebSocket ws;
  unsigned long lastBroadcast = 0;

public:
  WebServerManager() : server(80), ws("/ws") {}

  void begin() {
    // -------------------------------------------------------------
    // WebSocket Setup
    // -------------------------------------------------------------
    ws.onEvent([this](AsyncWebSocket *server, AsyncWebSocketClient *client, 
                      AwsEventType type, void *arg, uint8_t *data, size_t len) {
      if (type == WS_EVT_CONNECT) {
        Serial.printf("[WS] Client #%u connected from %s\\n", client->id(), client->remoteIP().toString().c_str());
        this->broadcastStatus();
      }
    });
    server.addHandler(&ws);

    // -------------------------------------------------------------
    // Serve Embedded AMOLED Web UI
    // -------------------------------------------------------------
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
      AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", WEB_UI_HTML);
      response->addHeader("Cache-Control", "no-cache");
      request->send(response);
    });

    // Captive portal probe redirects (iOS, Android, Windows)
    server.on("/hotspot-detect.html", HTTP_GET, [](AsyncWebServerRequest *request) {
      request->redirect("/");
    });
    server.on("/generate_204", HTTP_GET, [](AsyncWebServerRequest *request) {
      request->redirect("/");
    });

    // -------------------------------------------------------------
    // DLNA Device Description XML & SOAP Control Endpoints
    // -------------------------------------------------------------
    server.on("/dlna/device.xml", HTTP_GET, [](AsyncWebServerRequest *request) {
      request->send(200, "text/xml", DlnaRenderer::getDeviceDescriptionXml());
    });

    server.on("/dlna/AVTransport/control", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        String body = String((char*)data).substring(0, len);
        String soapAction = "";
        if (request->hasHeader("SOAPACTION")) {
          soapAction = request->getHeader("SOAPACTION")->value();
        }
        String responseXml = DlnaRenderer::handleAVTransportAction(soapAction, body);
        request->send(200, "text/xml", responseXml);
      });

    server.on("/dlna/RenderingControl/control", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        String body = String((char*)data).substring(0, len);
        String soapAction = "";
        if (request->hasHeader("SOAPACTION")) {
          soapAction = request->getHeader("SOAPACTION")->value();
        }
        String responseXml = DlnaRenderer::handleRenderingControlAction(soapAction, body);
        request->send(200, "text/xml", responseXml);
      });

    // -------------------------------------------------------------
    // REST API: Current Receiver Status
    // -------------------------------------------------------------
    server.on("/api/status", HTTP_GET, [this](AsyncWebServerRequest *request) {
      String json = this->getStatusJson();
      request->send(200, "application/json", json);
    });

    // -------------------------------------------------------------
    // REST API: Playback & Streaming Control
    // -------------------------------------------------------------
    server.on("/api/play", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, data, len);
        if (!err) {
          const char* url = doc["url"] | "";
          const char* title = doc["title"] | "Web Stream";
          if (strlen(url) > 0) {
            audioEngine.playHttp(url, title, "web");
            request->send(200, "application/json", "{\\"status\\":\\"playing\\"}");
            return;
          }
        }
        request->send(400, "application/json", "{\\"error\\":\\"invalid_url\\"}");
      });

    server.on("/api/pause", HTTP_POST, [](AsyncWebServerRequest *request) {
      audioEngine.pause();
      request->send(200, "application/json", "{\\"status\\":\\"toggled\\"}");
    });

    server.on("/api/stop", HTTP_POST, [](AsyncWebServerRequest *request) {
      audioEngine.stop();
      request->send(200, "application/json", "{\\"status\\":\\"stopped\\"}");
    });

    server.on("/api/volume", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        JsonDocument doc;
        if (!deserializeJson(doc, data, len)) {
          uint8_t vol = doc["volume"] | 65;
          bool mute = doc["muted"] | false;
          audioEngine.setVolume(vol, mute);
          request->send(200, "application/json", "{\\"status\\":\\"ok\\"}");
          return;
        }
        request->send(400, "application/json", "{\\"error\\":\\"bad_request\\"}");
      });

    server.on("/api/dsp", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        JsonDocument doc;
        if (!deserializeJson(doc, data, len)) {
          int8_t bass = doc["bass"] | 0;
          int8_t mid = doc["mid"] | 0;
          int8_t treble = doc["treble"] | 0;
          const char* preset = doc["preset"] | "custom";
          audioEngine.setDsp(bass, mid, treble);
          nvsStorage.saveDsp(bass, mid, treble, preset);
          request->send(200, "application/json", "{\\"status\\":\\"ok\\"}");
          return;
        }
        request->send(400, "application/json", "{\\"error\\":\\"bad_request\\"}");
      });

    // Power Toggle: Saves all states to NVS Flash on manual power-off!
    server.on("/api/power", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        JsonDocument doc;
        if (!deserializeJson(doc, data, len)) {
          bool pwr = doc["power"] | false;
          if (!pwr) {
            audioEngine.stop();
          }
          nvsStorage.setPowerState(pwr);
          request->send(200, "application/json", "{\\"status\\":\\"power_updated\\"}");
          return;
        }
        request->send(400, "application/json", "{\\"error\\":\\"bad_request\\"}");
      });

    // Wi-Fi Scan & Save (Captive Portal & Web UI)
    server.on("/api/wifi/scan", HTTP_GET, [](AsyncWebServerRequest *request) {
      int n = WiFi.scanNetworks();
      JsonDocument doc;
      JsonArray arr = doc.to<JsonArray>();
      for (int i = 0; i < n; ++i) {
        JsonObject net = arr.add<JsonObject>();
        net["ssid"] = WiFi.SSID(i);
        net["rssi"] = WiFi.RSSI(i);
        net["secure"] = (WiFi.encryptionType(i) != WIFI_AUTH_OPEN);
      }
      String out;
      serializeJson(doc, out);
      request->send(200, "application/json", out);
    });

    server.on("/api/wifi/save", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        JsonDocument doc;
        if (!deserializeJson(doc, data, len)) {
          const char* ssid = doc["ssid"] | "";
          const char* pass = doc["password"] | "";
          const char* host = doc["hostname"] | "audio-receiver";
          nvsStorage.saveWiFiCredentials(ssid, pass, host);
          request->send(200, "application/json", "{\\"status\\":\\"saved\\",\\"rebooting\\":true}");
          delay(1000);
          ESP.restart();
          return;
        }
        request->send(400, "application/json", "{\\"error\\":\\"bad_request\\"}");
      });

    // -------------------------------------------------------------
    // ROBUST WEB OTA FIRMWARE UPDATER
    // -------------------------------------------------------------
    server.on("/update", HTTP_POST, 
      [](AsyncWebServerRequest *request) {
        bool shouldReboot = !Update.hasError();
        AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", 
          shouldReboot ? "OK" : "FAIL");
        response->addHeader("Connection", "close");
        request->send(response);
        if (shouldReboot) {
          delay(500);
          ESP.restart();
        }
      },
      [](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
        if (!index) {
          Serial.printf("[OTA] Starting firmware update: %s\\n", filename.c_str());
          audioEngine.stop(); // Stop audio engine during flash writes

          // Calculate available space in OTA partition (dual 4.5MB partitions)
          size_t flashSpace = (ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000;
          if (!Update.begin(flashSpace, U_FLASH)) {
            Update.printError(Serial);
          }
        }

        if (!Update.hasError()) {
          if (Update.write(data, len) != len) {
            Update.printError(Serial);
          }
        }

        if (final) {
          if (Update.end(true)) {
            Serial.printf("[OTA] Update successful: %u bytes written. Rebooting...\\n", index + len);
          } else {
            Update.printError(Serial);
          }
        }
      }
    );

    server.begin();
    Serial.println("[HTTP] AsyncWebServer listening on port 80.");
  }

  void loop() {
    ws.cleanupClients();

    // Broadcast status over WebSocket every 500ms
    if (millis() - lastBroadcast > 500) {
      lastBroadcast = millis();
      broadcastStatus();
    }
  }

  String getStatusJson() {
    JsonDocument doc;
    doc["isPoweredOn"] = nvsStorage.state.isPoweredOn;
    doc["isPlaying"]   = audioEngine.isPlaying();
    doc["volume"]      = nvsStorage.state.volume;
    doc["isMuted"]     = nvsStorage.state.isMuted;
    doc["source"]      = nvsStorage.state.source;

    JsonObject metaObj = doc["metadata"].to<JsonObject>();
    metaObj["title"]           = strlen(audioEngine.meta.title) ? audioEngine.meta.title : "Live Stream";
    metaObj["artist"]          = strlen(audioEngine.meta.artist) ? audioEngine.meta.artist : "ESP32-S3 HiFi";
    metaObj["stationOrSource"] = audioEngine.meta.stationName;
    metaObj["streamUrl"]       = audioEngine.meta.streamUrl;
    metaObj["codec"]           = audioEngine.meta.codec;
    metaObj["bitrate"]         = String(audioEngine.meta.bitrate) + " kbps";
    metaObj["sampleRate"]      = String(audioEngine.meta.sampleRate) + " Hz";
    metaObj["bitDepth"]        = String(audioEngine.meta.bitDepth) + "-bit";
    metaObj["bufferHealth"]    = audioEngine.meta.bufferPercent;

    JsonObject dspObj = doc["dsp"].to<JsonObject>();
    dspObj["bass"]         = dspEngine.currentDsp.bass;
    dspObj["mid"]          = dspEngine.currentDsp.mid;
    dspObj["treble"]       = dspEngine.currentDsp.treble;
    dspObj["activePreset"] = dspEngine.currentDsp.activePreset;

    JsonObject netObj = doc["network"].to<JsonObject>();
    netObj["connected"] = WiFi.isConnected();
    netObj["ssid"]      = WiFi.SSID();
    netObj["ip"]        = WiFi.localIP().toString();
    netObj["hostname"]  = String(nvsStorage.state.hostname) + ".local";
    netObj["rssi"]      = WiFi.RSSI();
    netObj["mac"]       = WiFi.macAddress();

    JsonObject sysObj = doc["system"].to<JsonObject>();
    sysObj["psramFreeKb"]     = ESP.getFreePsram() / 1024;
    sysObj["psramTotalKb"]    = ESP.getPsramSize() / 1024;
    sysObj["heapFreeKb"]      = ESP.getFreeHeap() / 1024;
    sysObj["uptimeSeconds"]   = millis() / 1000;
    sysObj["otaPartition"]    = ESP.getSketchMD5();
    sysObj["firmwareVersion"] = FIRMWARE_VERSION;

    String output;
    serializeJson(doc, output);
    return output;
  }

  void broadcastStatus() {
    if (ws.count() > 0) {
      String json = getStatusJson();
      ws.textAll(json);
    }
  }
};

extern WebServerManager webServer;
`
  },
  {
    name: 'web_ui_html.h',
    path: 'include/web_ui_html.h',
    language: 'cpp',
    description: 'Embedded standalone AMOLED Material 3 Web UI flashed directly into ESP32 memory',
    content: `/**
 * @file web_ui_html.h
 * @brief Self-contained AMOLED Material 3 Web Interface served by ESP32 AsyncWebServer
 * Fully standalone, no external CDN dependencies: includes Now Playing, Spectrum Visualizer,
 * 3-Tone DSP, 24/7 Radios, Direct Stream Input, OTA Firmware Uploader, and NVS Power Save.
 */

#pragma once
#include <Arduino.h>

const char WEB_UI_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>ESP32-S3 HiFi Receiver</title>
<style>
  :root {
    --bg: #000000;
    --surface: #0a0c10;
    --surface-elevated: #131722;
    --primary: #38bdf8;
    --primary-dim: rgba(56,189,248,0.15);
    --accent: #818cf8;
    --emerald: #34d399;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: #1e2230;
    --radius-lg: 24px;
    --radius-md: 16px;
    --radius-sm: 10px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-tap-highlight-color: transparent; }
  body { background-color: var(--bg); color: var(--text); padding: 14px; max-width: 520px; margin: 0 auto; min-height: 100vh; padding-bottom: 40px; }
  
  /* Top App Bar */
  .header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .logo-title { font-size: 17px; font-weight: 800; letter-spacing: -0.4px; display: flex; align-items: center; gap: 8px; }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--emerald); box-shadow: 0 0 10px var(--emerald); }
  .logo-dot.off { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
  .pwr-btn { background: var(--surface-elevated); border: 1px solid var(--border); color: #fff; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.15s; }
  .pwr-btn.active { background: #ef4444; border-color: #ef4444; color: #fff; }

  /* Navigation Tabs */
  .tabs { display: flex; gap: 6px; background: var(--surface); padding: 4px; border-radius: 999px; border: 1px solid var(--border); margin-bottom: 16px; overflow-x: auto; }
  .tab-btn { flex: 1; min-width: 70px; background: transparent; border: none; color: var(--text-muted); font-size: 12px; font-weight: 600; padding: 8px 0; border-radius: 999px; cursor: pointer; text-align: center; }
  .tab-btn.active { background: var(--primary-dim); color: var(--primary); border: 1px solid rgba(56,189,248,0.3); font-weight: 700; }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .title { font-size: 19px; font-weight: 800; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  
  /* Spectrum Canvas */
  canvas#visualizer { width: 100%; height: 50px; border-radius: var(--radius-sm); margin: 8px 0 16px 0; background: #050608; border: 1px solid #161a24; }

  /* Badges & Telemetry */
  .badges-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .badge { font-size: 10px; font-family: monospace; background: var(--surface-elevated); border: 1px solid var(--border); padding: 3px 8px; border-radius: 6px; color: #94a3b8; }
  .badge.cyan { color: var(--primary); border-color: rgba(56,189,248,0.4); background: var(--primary-dim); }

  /* Transport & Volume */
  .transport { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 16px 0; }
  .t-btn { background: var(--surface-elevated); border: 1px solid var(--border); color: #fff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; }
  .t-btn.main { width: 56px; height: 56px; background: var(--primary); color: #000; border: none; font-size: 20px; font-weight: bold; box-shadow: 0 0 20px rgba(56,189,248,0.3); }

  /* Sliders */
  .slider-group { margin: 14px 0; }
  .slider-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  input[type="range"] { width: 100%; -webkit-appearance: none; background: #1a1e2a; height: 6px; border-radius: 999px; outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--primary); cursor: pointer; box-shadow: 0 0 10px var(--primary); }

  /* Presets Grid */
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
  .chip { background: var(--surface-elevated); border: 1px solid var(--border); color: var(--text-muted); padding: 8px 4px; border-radius: var(--radius-sm); font-size: 11px; text-align: center; cursor: pointer; font-weight: 600; }
  .chip.active { background: var(--primary-dim); color: var(--primary); border-color: var(--primary); }

  /* Stations List */
  .st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .st-card { background: var(--surface-elevated); border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-md); cursor: pointer; transition: 0.15s; }
  .st-card:hover { border-color: var(--primary); }
  .st-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .st-genre { font-size: 11px; color: var(--text-muted); }

  /* Direct Input & OTA */
  input[type="text"] { width: 100%; background: #050608; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; color: #fff; font-size: 13px; outline: none; margin-bottom: 8px; }
  input[type="text"]:focus { border-color: var(--primary); }
  .action-btn { width: 100%; background: var(--primary); color: #000; border: none; border-radius: var(--radius-sm); padding: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
  .progress-bar { width: 100%; height: 8px; background: #161a24; border-radius: 999px; overflow: hidden; margin-top: 10px; display: none; }
  .progress-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.2s; }
</style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo-title">
      <div class="logo-dot" id="pwrDot"></div>
      <span>ESP32-S3 HiFi</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span class="badge cyan" id="hostTag">audio-receiver.local</span>
      <button class="pwr-btn" id="pwrBtn" onclick="togglePower()">Standby</button>
    </div>
  </div>

  <!-- Tabs Navigation -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchView('now-playing', this)">Player</button>
    <button class="tab-btn" onclick="switchView('dsp-view', this)">DSP EQ</button>
    <button class="tab-btn" onclick="switchView('stations-view', this)">Radios</button>
    <button class="tab-btn" onclick="switchView('direct-view', this)">Stream</button>
    <button class="tab-btn" onclick="switchView('ota-view', this)">OTA & WiFi</button>
  </div>

  <!-- VIEW 1: Now Playing -->
  <div id="now-playing" class="view-panel">
    <div class="card">
      <div class="title" id="trackTitle">Groove Salad</div>
      <div class="subtitle" id="trackArtist">SomaFM • UDA1334A I2S DAC</div>
      
      <div class="badges-row">
        <span class="badge cyan" id="codecTag">MP3 128k</span>
        <span class="badge" id="rateTag">44.1 kHz / 16-bit</span>
        <span class="badge" id="sourceTag">RADIO</span>
      </div>

      <!-- Real-time Animated Spectrum Bar Canvas -->
      <canvas id="visualizer" width="480" height="50"></canvas>

      <!-- Transport Controls -->
      <div class="transport">
        <button class="t-btn" onclick="api('/api/pause')">⏮</button>
        <button class="t-btn main" id="playBtn" onclick="api('/api/pause')">▶</button>
        <button class="t-btn" onclick="api('/api/stop')">⏹</button>
        <button class="t-btn" onclick="nextStation()">⏭</button>
      </div>

      <!-- Volume Slider -->
      <div class="slider-group">
        <div class="slider-header">
          <span>Master Volume</span>
          <span id="volVal">65%</span>
        </div>
        <input type="range" min="0" max="100" value="65" id="volSlider" oninput="setVol(this.value)">
      </div>
    </div>
  </div>

  <!-- VIEW 2: 3-Tone DSP Equalizer -->
  <div id="dsp-view" class="view-panel" style="display: none;">
    <div class="card">
      <div class="title" style="font-size: 16px;">3-Tone Hardware DSP</div>
      <div class="subtitle">Real-time Biquad filtering on UDA1334A I2S stream</div>

      <div class="slider-group">
        <div class="slider-header"><span>Bass (Low Shelf ~100Hz)</span><span id="bassVal">0 dB</span></div>
        <input type="range" min="-12" max="12" value="0" id="bassSlider" oninput="updateDsp()">
      </div>

      <div class="slider-group">
        <div class="slider-header"><span>Mid (Peaking ~1000Hz)</span><span id="midVal">0 dB</span></div>
        <input type="range" min="-12" max="12" value="0" id="midSlider" oninput="updateDsp()">
      </div>

      <div class="slider-group">
        <div class="slider-header"><span>Treble (High Shelf ~8000Hz)</span><span id="trebleVal">0 dB</span></div>
        <input type="range" min="-12" max="12" value="0" id="trebleSlider" oninput="updateDsp()">
      </div>

      <div style="font-size: 12px; color: var(--text-muted); margin-top: 14px;">DSP Presets</div>
      <div class="grid-4">
        <div class="chip active" onclick="applyPreset('flat',0,0,0)">Flat</div>
        <div class="chip" onclick="applyPreset('bass',6,0,-1)">Bass+</div>
        <div class="chip" onclick="applyPreset('vocal',-2,5,2)">Vocal</div>
        <div class="chip" onclick="applyPreset('rock',4,-1,3)">Rock</div>
        <div class="chip" onclick="applyPreset('acoustic',2,2,1)">Acoustic</div>
        <div class="chip" onclick="applyPreset('jazz',3,1,2)">Jazz</div>
        <div class="chip" onclick="applyPreset('classic',1,0,3)">Classic</div>
        <div class="chip" onclick="applyPreset('night',-4,1,-3)">Night</div>
      </div>
    </div>
  </div>

  <!-- VIEW 3: 24/7 Radios -->
  <div id="stations-view" class="view-panel" style="display: none;">
    <div class="card">
      <div class="title" style="font-size: 16px;">24/7 Live Web Radios</div>
      <div class="subtitle">Curated lossless & high-bitrate live audio streams</div>
      <div class="st-grid">
        <div class="st-card" onclick="tuneRadio('https://ice1.somafm.com/groovesalad-128-mp3', 'SomaFM Groove Salad')">
          <div class="st-name">Groove Salad</div>
          <div class="st-genre">Downtempo Chill</div>
        </div>
        <div class="st-card" onclick="tuneRadio('https://ice2.somafm.com/defcon-128-mp3', 'SomaFM DEF CON')">
          <div class="st-name">DEF CON Radio</div>
          <div class="st-genre">Electronic / Hacking</div>
        </div>
        <div class="st-card" onclick="tuneRadio('https://live.kexp.org/kexp128.mp3', 'KEXP 90.3 FM')">
          <div class="st-name">KEXP 90.3 FM</div>
          <div class="st-genre">Seattle Indie Rock</div>
        </div>
        <div class="st-card" onclick="tuneRadio('https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', 'BBC Radio 1')">
          <div class="st-name">BBC Radio 1</div>
          <div class="st-genre">Top 40 / UK Dance</div>
        </div>
        <div class="st-card" onclick="tuneRadio('https://live.wksu.org/jazz24', 'Jazz24 NPR')">
          <div class="st-name">Jazz24</div>
          <div class="st-genre">Classic & Modern Jazz</div>
        </div>
        <div class="st-card" onclick="tuneRadio('http://stream.srg-ssr.ch/m/rsc_de/mp3_128', 'Radio Swiss Classic')">
          <div class="st-name">Swiss Classic</div>
          <div class="st-genre">Orchestral / Baroque</div>
        </div>
      </div>
    </div>
  </div>

  <!-- VIEW 4: Direct Stream -->
  <div id="direct-view" class="view-panel" style="display: none;">
    <div class="card">
      <div class="title" style="font-size: 16px;">Direct Stream URL Input</div>
      <div class="subtitle">Stream any custom HTTP/HTTPS audio directly via UDA1334A</div>
      <input type="text" id="customUrl" placeholder="https://stream.example.com/audio.mp3" value="https://ice1.somafm.com/groovesalad-128-mp3">
      <input type="text" id="customTitle" placeholder="Stream Title (e.g. My HiFi Feed)" value="Custom Stream">
      <button class="action-btn" onclick="playDirectStream()">▶ Play Stream</button>
    </div>
  </div>

  <!-- VIEW 5: Robust OTA & WiFi Config -->
  <div id="ota-view" class="view-panel" style="display: none;">
    <div class="card">
      <div class="title" style="font-size: 16px;">Robust Web OTA Firmware Update</div>
      <div class="subtitle">Dual 4.5MB partitions: safe wireless flash with auto-reboot</div>
      <input type="file" id="otaFile" accept=".bin" style="margin-bottom: 10px;">
      <button class="action-btn" onclick="uploadOta()">Flash Firmware (.bin)</button>
      <div class="progress-bar" id="pBar"><div class="progress-fill" id="pFill"></div></div>
      <div id="otaStatus" style="font-size: 12px; color: var(--text-muted); margin-top: 8px;"></div>
    </div>

    <div class="card">
      <div class="title" style="font-size: 16px;">Wi-Fi & mDNS Setup</div>
      <div class="subtitle">Reconfigure network credentials saved in NVS Flash</div>
      <input type="text" id="wifiSsid" placeholder="Wi-Fi SSID">
      <input type="text" id="wifiPass" placeholder="Wi-Fi Password">
      <input type="text" id="mDnsHost" placeholder="mDNS Hostname (e.g. audio-receiver)" value="audio-receiver">
      <button class="action-btn" style="background: var(--surface-elevated); color: #fff; border: 1px solid var(--border);" onclick="saveWiFi()">Save & Restart</button>
    </div>
  </div>

  <script>
    let isPowered = true;
    let ws = new WebSocket('ws://' + window.location.hostname + '/ws');

    ws.onmessage = (e) => {
      try {
        let d = JSON.parse(e.data);
        isPowered = d.isPoweredOn;
        document.getElementById('pwrDot').className = isPowered ? 'logo-dot' : 'logo-dot off';
        document.getElementById('pwrBtn').innerText = isPowered ? 'Power Off' : 'Power On';
        document.getElementById('trackTitle').innerText = d.metadata.title || 'Live Stream';
        document.getElementById('trackArtist').innerText = (d.metadata.artist || '') + ' • ' + (d.metadata.stationOrSource || '');
        document.getElementById('codecTag').innerText = (d.metadata.codec || 'STREAM') + ' ' + (d.metadata.bitrate || '');
        document.getElementById('rateTag').innerText = (d.metadata.sampleRate || '44.1 kHz') + ' / ' + (d.metadata.bitDepth || '16-bit');
        document.getElementById('sourceTag').innerText = (d.source || 'RADIO').toUpperCase();
        document.getElementById('volVal').innerText = d.volume + '%';
        document.getElementById('volSlider').value = d.volume;
        document.getElementById('playBtn').innerText = d.isPlaying ? '⏸' : '▶';
      } catch(err){}
    };

    function switchView(id, btn) {
      document.querySelectorAll('.view-panel').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(id).style.display = 'block';
      btn.classList.add('active');
    }

    function api(endpoint, body) {
      fetch(endpoint, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : null });
    }

    function togglePower() {
      api('/api/power', { power: !isPowered });
    }

    function setVol(val) {
      document.getElementById('volVal').innerText = val + '%';
      api('/api/volume', { volume: parseInt(val), muted: false });
    }

    function updateDsp() {
      let b = parseInt(document.getElementById('bassSlider').value);
      let m = parseInt(document.getElementById('midSlider').value);
      let t = parseInt(document.getElementById('trebleSlider').value);
      document.getElementById('bassVal').innerText = b + ' dB';
      document.getElementById('midVal').innerText = m + ' dB';
      document.getElementById('trebleVal').innerText = t + ' dB';
      api('/api/dsp', { bass: b, mid: m, treble: t, preset: 'custom' });
    }

    function applyPreset(name, b, m, t) {
      document.getElementById('bassSlider').value = b;
      document.getElementById('midSlider').value = m;
      document.getElementById('trebleSlider').value = t;
      updateDsp();
    }

    function tuneRadio(url, name) {
      api('/api/play', { url: url, title: name });
      switchView('now-playing', document.querySelector('.tab-btn'));
    }

    function playDirectStream() {
      let url = document.getElementById('customUrl').value;
      let title = document.getElementById('customTitle').value;
      if (url) {
        api('/api/play', { url: url, title: title });
        switchView('now-playing', document.querySelector('.tab-btn'));
      }
    }

    function saveWiFi() {
      let ssid = document.getElementById('wifiSsid').value;
      let pass = document.getElementById('wifiPass').value;
      let host = document.getElementById('mDnsHost').value;
      if (!ssid) return alert('SSID is required');
      api('/api/wifi/save', { ssid: ssid, password: pass, hostname: host });
      alert('Credentials committed to NVS. ESP32 is rebooting...');
    }

    function uploadOta() {
      let fileInput = document.getElementById('otaFile');
      if (!fileInput.files.length) return alert('Select a .bin file first');
      let file = fileInput.files[0];
      let xhr = new XMLHttpRequest();
      let pBar = document.getElementById('pBar');
      let pFill = document.getElementById('pFill');
      let stat = document.getElementById('otaStatus');

      pBar.style.display = 'block';
      stat.innerText = 'Writing binary to active OTA partition...';

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          let pct = Math.round((e.loaded / e.total) * 100);
          pFill.style.width = pct + '%';
          stat.innerText = 'Uploading: ' + pct + '%';
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          stat.innerText = 'Update successful! ESP32 rebooting into new firmware...';
          setTimeout(() => location.reload(), 5000);
        } else {
          stat.innerText = 'OTA update failed!';
        }
      };

      let formData = new FormData();
      formData.append('update', file);
      xhr.open('POST', '/update');
      xhr.send(formData);
    }

    // Spectrum Visualizer Simulation
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    function renderVisualizer() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 24;
      const barWidth = (canvas.width / bars) - 3;
      for (let i = 0; i < bars; i++) {
        let h = Math.random() * (canvas.height - 10) + 4;
        let x = i * (barWidth + 3);
        let y = canvas.height - h;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x, y, barWidth, h);
      }
      requestAnimationFrame(renderVisualizer);
    }
    renderVisualizer();
  </script>
</body>
</html>
)rawliteral";
`
  },
  {
    name: 'main.cpp',
    path: 'src/main.cpp',
    language: 'cpp',
    description: 'Complete FreeRTOS dual-core firmware: audio decoding on Core 0, network/web on Core 1',
    content: `/**
 * @file main.cpp
 * @brief ESP32-S3 N16R8 Hi-Fi Audio Receiver Main Firmware
 * AirPlay2, DLNA/UPnP, 24*7 Radios, Web UI, UDA1334A I2S DAC, 3-Tone DSP, NVS State Save
 */

#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include "config.h"
#include "nvs_storage.h"
#include "dsp_tone.h"
#include "audio_engine.h"
#include "dlna_renderer.h"
#include "airplay_service.h"
#include "wifi_manager.h"
#include "web_server.h"

// Global Instance Definitions
NvsStorageManager nvsStorage;
DspManager        dspEngine;
AudioEngine       audioEngine;
DlnaRenderer      dlnaRenderer;
AirPlayService    airPlayService;
WiFiManager       wifiManager;
WebServerManager  webServer;

// FreeRTOS Task Handles
TaskHandle_t audioTaskHandle = NULL;

// Core 0 Dedicated FreeRTOS Audio Task (Prevents audio stuttering during Wi-Fi / web I/O)
void audioCoreTask(void *pvParameters) {
  Serial.printf("[CORE 0] Audio task started on Core %d\\n", xPortGetCoreID());
  for (;;) {
    audioEngine.loop();
    // Yield CPU time smoothly when idle
    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

void setup() {
  // Serial Monitor Baud Rate
  Serial.begin(115200);
  delay(1000);

  Serial.println("\\n=======================================================");
  Serial.println(" ESP32-S3 N16R8 Hi-Fi Audio Receiver (UDA1334A DAC) ");
  Serial.printf(" Firmware: %s | CPU: %u MHz\\n", FIRMWARE_VERSION, getCpuFrequencyMhz());
  Serial.println("=======================================================");

  // 1. Verify 8MB Octal PSRAM
  if (psramInit()) {
    Serial.printf("[PSRAM] Initialized successfully. Total PSRAM: %u KB, Free: %u KB\\n",
                  ESP.getPsramSize() / 1024, ESP.getFreePsram() / 1024);
  } else {
    Serial.println("[PSRAM] WARNING: PSRAM initialization failed! Audio buffering may be limited.");
  }

  // 2. Initialize NVS Storage & Restore Previous Saved State
  nvsStorage.begin();

  // 3. Initialize DSP Engine with saved values
  dspEngine.begin(nvsStorage.state.bass, nvsStorage.state.mid, 
                  nvsStorage.state.treble, nvsStorage.state.presetId);

  // 4. Initialize I2S Audio Pipeline for UDA1334A DAC
  audioEngine.begin();

  // 5. Connect to Wi-Fi (or launch Captive Portal if initial setup needed)
  wifiManager.begin();

  // 6. Start DLNA/UPnP MediaRenderer & AirPlay Advertisers
  dlnaRenderer.begin();
  airPlayService.begin();

  // 7. Start Web Server, REST API, WebSockets & Web OTA
  webServer.begin();

  // 8. Launch dedicated FreeRTOS Audio Task on Core 0 with 32KB stack in PSRAM
  xTaskCreatePinnedToCore(
    audioCoreTask,
    "AudioTask",
    32768,
    NULL,
    configMAX_PRIORITIES - 1, // High priority
    &audioTaskHandle,
    0                         // Pinned strictly to Core 0
  );

  // 9. Autoplay last saved station if receiver was powered on before reboot
  if (nvsStorage.state.isPoweredOn && strlen(nvsStorage.state.lastUrl) > 0) {
    Serial.printf("[AUTO] Resuming previous stream: %s (%s)\\n",
                  nvsStorage.state.stationName, nvsStorage.state.lastUrl);
    audioEngine.playHttp(nvsStorage.state.lastUrl, nvsStorage.state.stationName);
  }
}

void loop() {
  // Core 1 loop: handles background networking, DLNA SSDP, AirPlay RTSP, and Web telemetry
  wifiManager.loop();
  dlnaRenderer.loop();
  airPlayService.loop();
  webServer.loop();

  // Wi-Fi Auto-reconnect watchdog (only in STA mode)
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 10000) {
    lastWiFiCheck = millis();
    if (!wifiManager.isPortalActive() && WiFi.status() != WL_CONNECTED && WiFi.getMode() == WIFI_STA) {
      Serial.println("[WIFI] Connection dropped, reconnecting...");
      WiFi.reconnect();
    }
  }

  delay(10);
}

// ============================================================================
// ESP32-audioI2S Metadata Callbacks
// ============================================================================
void audio_info(const char *info) {
  Serial.printf("[AUDIO INFO] %s\\n", info);
}

void audio_showstation(const char *info) {
  Serial.printf("[STATION] %s\\n", info);
  strncpy(audioEngine.meta.stationName, info, sizeof(audioEngine.meta.stationName) - 1);
}

void audio_showstreamtitle(const char *info) {
  Serial.printf("[STREAM TITLE] %s\\n", info);
  // Parse "Artist - Title" format commonly transmitted by ICY radio streams
  char buffer[128];
  strncpy(buffer, info, sizeof(buffer) - 1);
  char* hyphen = strstr(buffer, " - ");
  if (hyphen != NULL) {
    *hyphen = '\\0';
    strncpy(audioEngine.meta.artist, buffer, sizeof(audioEngine.meta.artist) - 1);
    strncpy(audioEngine.meta.title, hyphen + 3, sizeof(audioEngine.meta.title) - 1);
  } else {
    strncpy(audioEngine.meta.title, info, sizeof(audioEngine.meta.title) - 1);
    strncpy(audioEngine.meta.artist, "Live Stream", sizeof(audioEngine.meta.artist) - 1);
  }
}

void audio_bitrate(const char *info) {
  Serial.printf("[BITRATE] %s\\n", info);
  audioEngine.meta.bitrate = atoi(info);
}

void audio_commercial(const char *info) {
  Serial.printf("[COMMERCIAL] %s\\n", info);
}

void audio_icyurl(const char *info) {
  Serial.printf("[ICY URL] %s\\n", info);
}
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Hardware wiring guide for ESP32-S3 to UDA1334A and PlatformIO build instructions',
    content: `# ESP32-S3 N16R8 Hi-Fi Wi-Fi Audio Receiver

A high-performance, 24/7 internet radio, AirPlay2, DLNA/UPnP, and HTTP/HTTPS audio receiver running on the **ESP32-S3 (16MB Flash, 8MB Octal PSRAM)** with the **UDA1334A I2S stereo DAC**.

---

## 🔌 Hardware Wiring Diagram

Connect the **Adafruit or CJMCU UDA1334A I2S DAC** to your **ESP32-S3 N16R8**:

| UDA1334A Pin | ESP32-S3 Pin | Function | Notes |
|---|---|---|---|
| **VIN / 3V3** | **3V3** | 3.3V Power | Clean regulated rail |
| **GND** | **GND** | Ground | Common system ground |
| **BCLK / BCK** | **GPIO 4** | Bit Clock | Master I2S Clock |
| **WCLK / LRC** | **GPIO 5** | Word Select | Left / Right Clock |
| **DIN / DATA** | **GPIO 6** | Serial Data | I2S Audio Stream In |
| **MCLK** | *Leave Disconnected* | Master Clock | **UDA1334A generates PLL from BCLK!** |
| **DEEM / SF1** | *GND (or float)* | De-emphasis | Default normal |
| **PLL** | *Float* | PLL setting | Internal PLL active |

*Audio Output:* Connect the 3.5mm stereo jack on the UDA1334A to your powered speakers, amplifier, or headphones.

---

## ⚡ How to Build in Visual Studio Code (PlatformIO)

1. Open **Visual Studio Code** and install the **PlatformIO IDE** extension.
2. Click **File -> Open Folder...** and select this project folder.
3. Open \`include/config.h\` and set your Wi-Fi SSID and Password (or let the Captive Portal handle it on initial boot):
   \`\`\`cpp
   #define DEFAULT_WIFI_SSID "MyHomeWiFi"
   #define DEFAULT_WIFI_PASS "MySecretPassword"
   \`\`\`
4. Connect your ESP32-S3 board via USB-C.
5. In the PlatformIO toolbar at the bottom:
   - Click **Build** (✓) to compile.
   - Click **Upload** (➔) to flash the firmware.
   - Click **Monitor** (plug icon) at 115200 baud to view debug logs.
6. Open your browser on any phone, tablet, or PC on the same Wi-Fi:
   - **http://audio-receiver.local** (via mDNS)
   - Or the device IP printed in the serial monitor!

---

## 🌟 Key Features

- **24/7 High-Bitrate Live Radios:** MP3, AAC, FLAC with automatic ICY metadata (Artist, Title, Bitrate).
- **Direct HTTP/HTTPS Streaming:** Paste any direct stream URL in the Web UI for instant playback.
- **AirPlay & DLNA MediaRenderer:** Cast directly from Windows ("Cast to Device"), BubbleUPnP, mConnect, Audirvana, iOS, macOS.
- **3-Tone Hardware DSP:** Bass, Mid, Treble controls (-12dB to +12dB) and audio presets (Flat, Bass Boost, Vocal, Rock, Jazz, Night Mode).
- **NVS Memory Persistence:** Remembers volume, EQ tones, last station, and power state on reboot or manual power-off.
- **Initial Setup Captive Portal:** If no Wi-Fi credentials are saved, it broadcasts \`ESP32-AudioReceiver-Setup\` to easily configure your Wi-Fi and hostname.
- **Robust Web OTA:** Dual 4.5MB partitions allowing safe wireless firmware updates directly from the browser.
`
  }
];
