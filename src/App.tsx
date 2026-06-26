import { useEffect } from 'react';
import { useImageConverter } from './hooks/useImageConverter';
import { ConverterCard } from './components/ConverterCard';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { Controls } from './components/Controls';
import { Sparkles } from 'lucide-react';

function App() {
  const {
    items,
    globalFormat,
    globalQuality,
    globalResizeMax,
    isConverting,
    error,
    namingType,
    customPrefix,
    customSuffix,
    setGlobalResizeMax,
    setNamingType,
    setCustomPrefix,
    setCustomSuffix,
    handleFilesAdd,
    removeFile,
    clearFiles,
    setGlobalFormat,
    setGlobalQuality,
    convertAll,
    downloadAllZip,
  } = useImageConverter();

  const successCount = items.filter((item) => item.status === 'success').length;

  // Support pasting images from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        handleFilesAdd(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleFilesAdd]);


  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between py-12 px-4 md:px-8 select-none overflow-hidden z-10">
      {/* Floating Aero bubbles (Skeuomorphic organic elements) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-24 h-24 aero-bubble animate-float-slow left-[8%] bottom-[-100px]"></div>
        <div className="absolute w-16 h-16 aero-bubble animate-float-medium left-[25%] bottom-[-150px] [animation-delay:4s]"></div>
        <div className="absolute w-32 h-32 aero-bubble animate-float-slow left-[42%] bottom-[-200px] [animation-delay:8s]"></div>
        <div className="absolute w-12 h-12 aero-bubble animate-float-fast left-[58%] bottom-[-80px] [animation-delay:2s]"></div>
        <div className="absolute w-20 h-20 aero-bubble animate-float-medium left-[73%] bottom-[-120px] [animation-delay:6s]"></div>
        <div className="absolute w-28 h-28 aero-bubble animate-float-slow left-[88%] bottom-[-180px] [animation-delay:11s]"></div>
        <div className="absolute w-14 h-14 aero-bubble animate-float-fast left-[18%] bottom-[-100px] [animation-delay:7s]"></div>
        <div className="absolute w-26 h-26 aero-bubble animate-float-slow left-[34%] bottom-[-130px] [animation-delay:14s]"></div>
        <div className="absolute w-18 h-18 aero-bubble animate-float-medium left-[64%] bottom-[-140px] [animation-delay:5s]"></div>
        <div className="absolute w-30 h-30 aero-bubble animate-float-slow left-[80%] bottom-[-200px] [animation-delay:3s]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-2xl mx-auto text-center mb-8 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/60 text-xs font-bold text-sky-700 tracking-wider uppercase backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Пакетная конвертация в браузере</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-900 via-sky-700 to-emerald-800 drop-shadow-sm">
          Web Image Converter
        </h1>
        <p className="text-sm md:text-base font-semibold text-sky-900/80 max-w-md">
          Конвертируйте несколько изображений за раз прямо в браузере и скачивайте готовый архив ZIP. Быстро и безопасно.
        </p>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center my-4">
        {items.length === 0 ? (
          <ConverterCard className="max-w-2xl mx-auto">
            <DropZone onFileSelect={handleFilesAdd} />
          </ConverterCard>
        ) : (
          <ConverterCard className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              {/* Left pane: File List & Compact Uploader */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <FileList
                  items={items}
                  globalFormat={globalFormat}
                  namingType={namingType}
                  customPrefix={customPrefix}
                  customSuffix={customSuffix}
                  onRemove={removeFile}
                />
                <DropZone onFileSelect={handleFilesAdd} compact />
              </div>
              
              {/* Vertical Divider (Desktop) */}
              <div className="hidden md:block w-px bg-white/50 self-stretch my-1 col-span-1 justify-self-center"></div>

              {/* Right pane: Controls & Summary */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <Controls
                  totalCount={items.length}
                  successCount={successCount}
                  outputFormat={globalFormat}
                  quality={globalQuality}
                  globalResizeMax={globalResizeMax}
                  isConverting={isConverting}
                  error={error}
                  namingType={namingType}
                  customPrefix={customPrefix}
                  customSuffix={customSuffix}
                  setOutputFormat={setGlobalFormat}
                  setQuality={setGlobalQuality}
                  setGlobalResizeMax={setGlobalResizeMax}
                  setNamingType={setNamingType}
                  setCustomPrefix={setCustomPrefix}
                  setCustomSuffix={setCustomSuffix}
                  onConvert={convertAll}
                  onDownloadZip={downloadAllZip}
                  onClear={clearFiles}
                  items={items}
                />
              </div>
            </div>
          </ConverterCard>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-sky-900/60 font-semibold mt-8">
        <p>
          &copy; {new Date().getFullYear()} Web Image Converter.
        </p>
        <p className="mt-1">
          Все вычисления выполняются локально в браузере с помощью Canvas API.
        </p>
      </footer>
    </div>
  );
}

export default App;
