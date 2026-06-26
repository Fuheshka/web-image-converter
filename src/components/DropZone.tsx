import React, { useRef, useState } from 'react';
import { Upload, Plus } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  compact?: boolean;
}

export function DropZone({ onFileSelect, compact = false }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const filesArray = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );
    if (filesArray.length > 0) {
      onFileSelect(filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`w-full py-4 px-6 border border-dashed rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-3 ${
          isDragActive
            ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
            : 'border-sky-300/60 bg-white/30 hover:border-sky-400 hover:bg-white/50'
        }`}
      >
        <Plus className={`w-5 h-5 ${isDragActive ? 'text-sky-600' : 'text-sky-500'}`} />
        <span className="text-sm font-semibold text-slate-700">
          {isDragActive ? 'Отпустите для загрузки' : 'Добавить еще изображения'}
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative w-full aspect-[16/10] md:aspect-[16/9] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden ${
        isDragActive
          ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.25)]'
          : 'border-sky-300/50 bg-white/30 hover:border-sky-400/80 hover:bg-white/50'
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center px-4 relative z-10">
        <div className={`p-4 rounded-full border transition-all duration-300 ${
          isDragActive 
            ? 'bg-sky-500/20 text-sky-600 border-sky-400/40 scale-110' 
            : 'bg-white/60 text-sky-500 border-sky-200/50 group-hover:text-sky-600 group-hover:scale-105 group-hover:bg-white'
        }`}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-700 group-hover:text-slate-800 transition-colors duration-200">
            Перетащите изображения сюда
          </p>
          <p className="text-sm font-medium text-slate-500 mt-1">
            или кликните для выбора на устройстве
          </p>
        </div>
        <p className="text-xs font-semibold text-sky-700/80 bg-sky-100/50 px-3 py-1 rounded-full mt-2">
          Поддерживается загрузка нескольких файлов (PNG, JPEG, WEBP, GIF и др.)
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
