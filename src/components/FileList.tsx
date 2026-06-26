import { useEffect, useState } from 'react';
import { Trash2, Loader2, Check, AlertCircle, Download, FileImage, Search, X } from 'lucide-react';
import { getConvertedFilename } from '../hooks/useImageConverter';
import type { ConversionItem, OutputFormat, NamingType } from '../hooks/useImageConverter';

interface FileListProps {
  items: ConversionItem[];
  globalFormat: OutputFormat;
  namingType: NamingType;
  customPrefix: string;
  customSuffix: string;
  onRemove: (id: string) => void;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function FileRow({
  item,
  globalFormat,
  namingType,
  customPrefix,
  customSuffix,
  index,
  onRemove,
}: {
  item: ConversionItem;
  globalFormat: OutputFormat;
  namingType: NamingType;
  customPrefix: string;
  customSuffix: string;
  index: number;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(item.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.file]);

  const originalSizeStr = formatSize(item.file.size);
  const convertedSizeStr = item.convertedSize ? formatSize(item.convertedSize) : '';
  
  // Calculate savings
  let savingsText = '';
  let isSmaller = false;
  if (item.status === 'success' && item.convertedSize) {
    const diff = item.file.size - item.convertedSize;
    const pct = Math.round((diff / item.file.size) * 100);
    isSmaller = diff > 0;
    savingsText = pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
  }

  const downloadName = getConvertedFilename(
    item.file.name,
    globalFormat,
    namingType,
    customPrefix,
    customSuffix,
    index
  );

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors duration-150">
      {/* Mini-preview */}
      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-slate-900">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <FileImage className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate" title={downloadName}>
          {downloadName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
          <span className="truncate max-w-[120px]" title={item.file.name}>
            {item.file.name}
          </span>
          <span>({originalSizeStr})</span>
          {item.status === 'success' && (
            <>
              <span>&rarr;</span>
              <span className="text-cyan-300 font-medium">{convertedSizeStr}</span>
              {savingsText && (
                <span className={`font-semibold px-1 py-0.5 rounded text-[10px] ${
                  isSmaller ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                }`}>
                  {savingsText}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2">
        {item.status === 'converting' && (
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        )}
        
        {item.status === 'success' && item.convertedUrl && (
          <>
            <div className="text-emerald-400 p-1">
              <Check className="w-5 h-5" />
            </div>
            <a
              href={item.convertedUrl}
              download={downloadName}
              title="Скачать этот файл"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </>
        )}

        {item.status === 'error' && (
          <div className="text-rose-400 p-1" title={item.error || 'Ошибка'}>
            <AlertCircle className="w-5 h-5" />
          </div>
        )}

        {item.status === 'idle' && (
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-1"></div>
        )}

        <button
          onClick={onRemove}
          disabled={item.status === 'converting'}
          title="Удалить"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function FileList({
  items,
  globalFormat,
  namingType,
  customPrefix,
  customSuffix,
  onRemove,
}: FileListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'idle' | 'converting' | 'success' | 'error'>('all');

  const filteredItems = items.filter((item, index) => {
    const targetName = getConvertedFilename(
      item.file.name,
      globalFormat,
      namingType,
      customPrefix,
      customSuffix,
      index
    );

    const matchesSearch =
      item.file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      targetName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Очередь файлов ({items.length})
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="glass-input pl-9 pr-8 py-2 w-full rounded-xl text-sm text-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1 px-1">
          {([
            { key: 'all', label: 'Все' },
            { key: 'idle', label: 'Ожидают' },
            { key: 'converting', label: 'В процессе' },
            { key: 'success', label: 'Готово' },
            { key: 'error', label: 'Ошибки' },
          ] as { key: typeof statusFilter; label: string }[]).map((pill) => {
            const count = pill.key === 'all' 
              ? items.length 
              : items.filter((item) => item.status === pill.key).length;
            
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                  statusFilter === pill.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-300'
                }`}
              >
                {pill.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Files List Container */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            Файлы не найдены
          </div>
        ) : (
          filteredItems.map((item) => {
            const originalIndex = items.findIndex((p) => p.id === item.id);
            return (
              <FileRow
                key={item.id}
                item={item}
                globalFormat={globalFormat}
                namingType={namingType}
                customPrefix={customPrefix}
                customSuffix={customSuffix}
                index={originalIndex}
                onRemove={() => onRemove(item.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
