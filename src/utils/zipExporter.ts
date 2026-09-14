import JSZip from 'jszip';
import { FIRMWARE_FILES } from '../data/firmwareFiles';

/**
 * Packs all PlatformIO files into a standard project archive ready to open in VS Code.
 */
export async function downloadPlatformIoProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root project folder name
  const root = zip.folder('esp32s3-audio-receiver-uda1334a');
  if (!root) return;

  // Add all files
  for (const file of FIRMWARE_FILES) {
    root.file(file.path, file.content);
  }

  // Add .gitignore for PlatformIO
  root.file('.gitignore', `.pio\n.vscode\n*.bin\n*.elf\n`);

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'esp32s3-audio-receiver-uda1334a-pio.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single text file directly in the browser (e.g. platformio.ini)
 */
export function downloadSingleFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
