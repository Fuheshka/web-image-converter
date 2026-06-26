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
    <div className="relative min-h-screen w-full flex flex-col justify-between py-12 px-4 md:px-8 select-none overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-2xl mx-auto text-center mb-8 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-400 tracking-wider uppercase backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Batch Client-Side Conversion</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Web Image Converter
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-md">
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
              <div className="hidden md:block w-px bg-white/10 self-stretch my-1 col-span-1 justify-self-center"></div>

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
      <footer className="relative z-10 w-full text-center text-xs text-slate-500 mt-8">
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
