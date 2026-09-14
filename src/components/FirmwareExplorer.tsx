import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, FolderCode, FileText } from 'lucide-react';
import { FIRMWARE_FILES } from '../data/firmwareFiles';
import { FirmwareFile } from '../types';
import { downloadPlatformIoProjectZip, downloadSingleFile } from '../utils/zipExporter';

export const FirmwareExplorer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FirmwareFile>(FIRMWARE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadPlatformIoProjectZip();
    } catch (err) {
      console.error('Failed to generate project zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadCurrentFile = () => {
    downloadSingleFile(activeFile.name, activeFile.content);
  };

  const handleDownloadPlatformIni = () => {
    const iniFile = FIRMWARE_FILES.find((f) => f.name === 'platformio.ini') || FIRMWARE_FILES[0];
    downloadSingleFile('platformio.ini', iniFile.content, 'text/plain');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Quick Download & PIO Instructions */}
      <div className="rounded-3xl bg-[#09090b] border border-zinc-800/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <FolderCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                PlatformIO Project (VS Code)
              </h3>
              <p className="text-xs text-zinc-400">
                ESP32-S3 N16R8 • Octal PSRAM • UDA1334A DAC • Dual Core FreeRTOS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Direct platformio.ini download */}
            <button
              onClick={handleDownloadPlatformIni}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title="Download platformio.ini directly for your VS Code project"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download platformio.ini</span>
            </button>

            {/* Complete Project ZIP download */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Zipping...' : 'Download Project (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Quick Start in VS Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-900">
          <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-850 text-xs">
            <div className="flex items-center gap-2 font-medium text-zinc-300 mb-1">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>Open in VS Code</span>
            </div>
            <p className="text-zinc-500 text-[11px]">Install PlatformIO IDE extension, then File → Open Folder.</p>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-850 text-xs">
            <div className="flex items-center gap-2 font-medium text-zinc-300 mb-1">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Set Wi-Fi in config.h</span>
            </div>
            <p className="text-zinc-500 text-[11px]">Edit your SSID and password in <code className="text-zinc-300">include/config.h</code>.</p>
          </div>

          <div className="bg-black/50 p-3 rounded-2xl border border-zinc-900 text-xs">
            <div className="flex items-center gap-2 font-semibold text-zinc-300 mb-1">
              <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>Build & Upload</span>
            </div>
            <p className="text-zinc-500 text-[11px]">Connect USB-C and hit <code className="text-zinc-300">pio run -t upload</code>.</p>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 rounded-3xl bg-[#08090d] border border-zinc-800/80 p-4 shadow-2xl">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2.5 px-2">
            Project Files ({FIRMWARE_FILES.length})
          </div>

          <div className="space-y-1">
            {FIRMWARE_FILES.map((file) => {
              const isSelected = activeFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all text-xs cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                      : 'bg-zinc-950/40 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileCode className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`} />
                    <span className="font-mono text-xs truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase flex-shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content & Copy Area */}
        <div className="lg:col-span-8 rounded-3xl bg-[#09090b] border border-zinc-800/80 p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-3 gap-2">
            <div className="min-w-0">
              <div className="font-mono text-xs font-semibold text-zinc-200 truncate">{activeFile.path}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{activeFile.description}</div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleDownloadCurrentFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                title={`Download ${activeFile.name} directly`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Copy file content to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-4 overflow-x-auto border border-zinc-900 flex-1 max-h-[500px]">
            <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
