import { Download, RefreshCw, ChevronRight, Check } from 'lucide-react';
import type { OutputFormat } from '../hooks/useImageConverter';


interface ResultAreaProps {
  originalFile: File;
  convertedUrl: string;
  convertedSize: number;
  outputFormat: OutputFormat;
  onReset: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getConvertedFilename = (originalName: string, format: string): string => {
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `${baseName}_converted.${ext}`;
};

export function ResultArea({
  originalFile,
  convertedUrl,
  convertedSize,
  outputFormat,
  onReset,
}: ResultAreaProps) {
  const originalSize = originalFile.size;
  const sizeDiff = originalSize - convertedSize;
  const savingsPercent = originalSize > 0 ? Math.round((sizeDiff / originalSize) * 100) : 0;
  const isSmaller = sizeDiff > 0;

  const downloadFilename = getConvertedFilename(originalFile.name, outputFormat);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Success Title */}
      <div className="flex items-center gap-2 text-emerald-400 font-medium justify-center text-lg">
        <div className="p-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <Check className="w-5 h-5" />
        </div>
        <span>Изображение успешно сконвертировано!</span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-center">
          <span className="text-xs text-slate-400 block mb-1">Было</span>
          <span className="text-base font-semibold text-slate-300">{formatSize(originalSize)}</span>
          <span className="text-[10px] text-slate-500 block uppercase mt-0.5">
            {originalFile.type.split('/')[1]?.toUpperCase() || 'RAW'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-slate-500 py-2 sm:py-0">
          <ChevronRight className="w-6 h-6 rotate-90 sm:rotate-0 text-slate-400" />
          {isSmaller && savingsPercent > 0 ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
              -{savingsPercent}%
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1">
              {savingsPercent > 0 ? `-${savingsPercent}%` : `+${Math.abs(savingsPercent)}%`}
            </span>
          )}
        </div>

        <div className="text-center">
          <span className="text-xs text-slate-400 block mb-1">Стало</span>
          <span className="text-base font-semibold text-cyan-300">{formatSize(convertedSize)}</span>
          <span className="text-[10px] text-slate-500 block uppercase mt-0.5">
            {outputFormat.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Converted Preview */}
      <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center group">
        <img
          src={convertedUrl}
          alt="Converted Output"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <a
            href={convertedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 hover:text-cyan-200 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-lg transition-all duration-200"
          >
            Открыть в новой вкладке
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-1/3 py-3 rounded-xl glass-button text-slate-300 hover:text-white font-medium flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Сбросить</span>
        </button>

        <a
          href={convertedUrl}
          download={downloadFilename}
          className="w-full sm:w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer text-center order-1 sm:order-2"
        >
          <Download className="w-5 h-5" />
          <span>Скачать результат</span>
        </a>
      </div>
    </div>
  );
}
