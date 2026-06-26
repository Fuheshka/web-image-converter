import { Settings, Loader2, ArrowRight, Download, RefreshCw, Type, Maximize2 } from 'lucide-react';
import type { OutputFormat, NamingType, ConversionItem } from '../hooks/useImageConverter';

interface ControlsProps {
  totalCount: number;
  successCount: number;
  outputFormat: OutputFormat;
  quality: number;
  globalResizeMax: number | null;
  isConverting: boolean;
  error: string | null;
  namingType: NamingType;
  customPrefix: string;
  customSuffix: string;
  setOutputFormat: (format: OutputFormat) => void;
  setQuality: (quality: number) => void;
  setGlobalResizeMax: (max: number | null) => void;
  setNamingType: (type: NamingType) => void;
  setCustomPrefix: (prefix: string) => void;
  setCustomSuffix: (suffix: string) => void;
  onConvert: () => void;
  onDownloadZip: () => void;
  onClear: () => void;
  items: ConversionItem[];
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function Controls({
  totalCount,
  successCount,
  outputFormat,
  quality,
  globalResizeMax,
  isConverting,
  error,
  namingType,
  customPrefix,
  customSuffix,
  setOutputFormat,
  setQuality,
  setGlobalResizeMax,
  setNamingType,
  setCustomPrefix,
  setCustomSuffix,
  onConvert,
  onDownloadZip,
  onClear,
  items,
}: ControlsProps) {
  const showQualitySlider = outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp';
  const allConverted = successCount === totalCount && totalCount > 0;

  // Calculate total savings
  const successItems = items.filter((item) => item.status === 'success');
  const totalOriginal = successItems.reduce((acc, item) => acc + item.file.size, 0);
  const totalConverted = successItems.reduce((acc, item) => acc + (item.convertedSize || 0), 0);
  const totalSaved = totalOriginal - totalConverted;
  const totalSavedPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
  const isSmaller = totalSaved > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Settings Grid */}
      <div className="flex flex-col gap-5">
        {/* Output Format Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-sky-500" />
            Целевой формат
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['jpg', 'jpeg', 'png', 'webp'] as OutputFormat[]).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setOutputFormat(format)}
                disabled={isConverting}
                className={`py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer ${
                  outputFormat === format
                    ? 'aero-btn-blue border-transparent'
                    : 'aero-btn-glass border-transparent bg-white/20 hover:bg-white/40'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Naming Options */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/20 border border-white/40">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-1">
            <Type className="w-4 h-4 text-sky-500" />
            Имена файлов
          </label>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {([
              { key: 'original', label: 'Оригинал' },
              { key: 'suffix', label: 'Суффикс' },
              { key: 'custom', label: 'Своё имя' },
            ] as { key: NamingType; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setNamingType(opt.key)}
                disabled={isConverting}
                className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  namingType === opt.key
                    ? 'aero-btn-blue border-transparent'
                    : 'aero-btn-glass border-transparent bg-white/15 hover:bg-white/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {namingType === 'suffix' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500">Добавить к имени:</span>
              <input
                type="text"
                value={customSuffix}
                onChange={(e) => setCustomSuffix(e.target.value)}
                disabled={isConverting}
                placeholder="_converted"
                className="aero-input px-3 py-1.5 rounded-xl text-xs"
              />
            </div>
          )}

          {namingType === 'custom' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500">Префикс названия:</span>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                disabled={isConverting}
                placeholder="image"
                className="aero-input px-3 py-1.5 rounded-xl text-xs"
              />
            </div>
          )}

          {/* Example Rename Preview */}
          <div className="text-[10px] text-slate-500 mt-1 italic">
            Пример: {namingType === 'original' && `photo.${outputFormat}`}
            {namingType === 'suffix' && `photo${customSuffix || '_converted'}.${outputFormat}`}
            {namingType === 'custom' && `${customPrefix || 'image'}_001.${outputFormat}`}
          </div>
        </div>

        {/* Resize Options */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/20 border border-white/40">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={globalResizeMax !== null}
                onChange={(e) => setGlobalResizeMax(e.target.checked ? 1920 : null)}
                disabled={isConverting}
                className="w-4 h-4 rounded text-sky-600 bg-white/40 border-sky-300 focus:ring-sky-500/20 accent-sky-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-sky-500" />
                Изменить разрешение
              </span>
            </label>
          </div>

          {globalResizeMax !== null && (
            <div className="flex flex-col gap-2 mt-1.5 animate-fade-in">
              <span className="text-[10px] font-semibold text-slate-500">Максимальная сторона (px):</span>
              <div className="grid grid-cols-4 gap-1">
                {([800, 1200, 1920, 2560] as number[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setGlobalResizeMax(size)}
                    disabled={isConverting}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      globalResizeMax === size
                        ? 'aero-btn-blue border-transparent'
                        : 'aero-btn-glass border-transparent bg-white/15 hover:bg-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-500 font-medium">
                Большие стороны будут уменьшены с сохранением пропорций.
              </span>
            </div>
          )}
        </div>

        {/* Quality Slider (Conditional) */}
        {showQualitySlider && (
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/20 border border-white/40">
            <div className="flex justify-between items-center text-sm font-bold text-slate-700">
              <span>Качество сжатия</span>
              <span className="text-sky-600 font-extrabold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              disabled={isConverting}
              className="w-full h-1 my-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>Меньший размер</span>
              <span>Лучшее качество</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm font-semibold text-rose-700 bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-2xl">
          {error}
        </div>
      )}

      {/* Total Savings Summary */}
      {successCount > 0 && totalOriginal > 0 && (
        <div className="p-4 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 flex flex-col gap-1 text-center shadow-sm">
          <span className="text-xs text-emerald-800 uppercase tracking-wider font-bold">Суммарная экономия</span>
          <div className="flex justify-center items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {isSmaller ? `-${totalSavedPercent}%` : `+${Math.abs(totalSavedPercent)}%`}
            </span>
            <span className="text-sm font-semibold text-slate-600">
              ({formatSize(Math.abs(totalSaved))})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Размер уменьшился с {formatSize(totalOriginal)} до {formatSize(totalConverted)}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Main Action Button */}
        {successCount > 0 && (
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={isConverting}
            className="w-full py-3.5 rounded-2xl aero-btn-green flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>Скачать архив ZIP ({successCount})</span>
          </button>
        )}

        {(!allConverted || isConverting) && (
          <button
            type="button"
            onClick={onConvert}
            disabled={isConverting || totalCount === 0}
            className="w-full py-3.5 rounded-2xl aero-btn-blue flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Обработка...</span>
              </>
            ) : (
              <>
                <span>Конвертировать все ({totalCount})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}

        {/* Clear List Button */}
        <button
          type="button"
          onClick={onClear}
          disabled={isConverting}
          className="w-full py-3 rounded-2xl aero-btn-glass flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Очистить всё</span>
        </button>
      </div>
    </div>
  );
}
