import { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';

export type OutputFormat = 'jpg' | 'jpeg' | 'png' | 'webp';
export type NamingType = 'original' | 'suffix' | 'custom';

export interface ConversionItem {
  id: string;
  file: File;
  status: 'idle' | 'converting' | 'success' | 'error';
  convertedUrl: string | null;
  convertedSize: number | null;
  convertedBlob: Blob | null;
  error: string | null;
}

export interface UseImageConverterReturn {
  items: ConversionItem[];
  globalFormat: OutputFormat;
  globalQuality: number;
  globalResizeMax: number | null;
  isConverting: boolean;
  error: string | null;
  namingType: NamingType;
  customPrefix: string;
  customSuffix: string;
  setGlobalResizeMax: (max: number | null) => void;
  setNamingType: (type: NamingType) => void;
  setCustomPrefix: (prefix: string) => void;
  setCustomSuffix: (suffix: string) => void;
  handleFilesAdd: (files: File[] | FileList) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setGlobalFormat: (format: OutputFormat) => void;
  setGlobalQuality: (quality: number) => void;
  convertAll: () => Promise<void>;
  downloadAllZip: () => Promise<void>;
}

export const getConvertedFilename = (
  originalName: string,
  format: OutputFormat,
  namingType: NamingType,
  customPrefix: string,
  customSuffix: string,
  index: number
): string => {
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
  const ext = format;
  
  if (namingType === 'original') {
    return `${baseName}.${ext}`;
  } else if (namingType === 'suffix') {
    const suffix = customSuffix !== undefined ? customSuffix : '_converted';
    return `${baseName}${suffix}.${ext}`;
  } else {
    const prefix = customPrefix || 'image';
    const paddedIndex = String(index + 1).padStart(3, '0');
    return `${prefix}_${paddedIndex}.${ext}`;
  }
};

export function useImageConverter(): UseImageConverterReturn {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>('jpg');
  const [globalQuality, setGlobalQuality] = useState<number>(0.85);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Resize state
  const [globalResizeMax, setGlobalResizeMax] = useState<number | null>(null);

  // Renaming configurations state
  const [namingType, setNamingType] = useState<NamingType>('suffix');
  const [customPrefix, setCustomPrefix] = useState<string>('image');
  const [customSuffix, setCustomSuffix] = useState<string>('_converted');

  // Revoke all blob URLs when components unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.convertedUrl) {
          URL.revokeObjectURL(item.convertedUrl);
        }
      });
    };
  }, [items]);

  const handleFilesAdd = useCallback((newFiles: File[] | FileList) => {
    const fileList = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);
    
    const validItems: ConversionItem[] = [];
    let hasInvalid = false;

    fileList.forEach((file) => {
      if (file.type.startsWith('image/')) {
        validItems.push({
          id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
          file,
          status: 'idle',
          convertedUrl: null,
          convertedSize: null,
          convertedBlob: null,
          error: null,
        });
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setError('Некоторые файлы не были добавлены, так как они не являются изображениями.');
    } else {
      setError(null);
    }

    if (validItems.length > 0) {
      setItems((prev) => [...prev, ...validItems]);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.convertedUrl) {
        URL.revokeObjectURL(itemToRemove.convertedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => {
        if (item.convertedUrl) {
          URL.revokeObjectURL(item.convertedUrl);
        }
      });
      return [];
    });
    setIsConverting(false);
    setError(null);
  }, []);

  const convertSingle = async (
    file: File,
    format: OutputFormat,
    quality: number,
    resizeMax: number | null
  ): Promise<{ blob: Blob; url: string }> => {
    // Create source image object
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Не удалось прочитать файл изображения.'));
      };
      img.src = objectUrl;
    });

    // Calculate dimensions
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (resizeMax && (width > resizeMax || height > resizeMax)) {
      if (width > height) {
        height = Math.round((height * resizeMax) / width);
        width = resizeMax;
      } else {
        width = Math.round((width * resizeMax) / height);
        height = resizeMax;
      }
    }

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Не удалось инициализировать 2D контекст.');
    }

    // Fill white if JPEG/JPG
    if (format === 'jpeg' || format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw original image (potentially resized)
    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = (format === 'jpg' || format === 'jpeg') ? 'image/jpeg' : `image/${format}`;
    const compressionQuality = format === 'png' ? undefined : quality;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, compressionQuality);
    });

    if (!blob) {
      throw new Error('Сжатие изображения завершилось с ошибкой.');
    }

    const url = URL.createObjectURL(blob);
    return { blob, url };
  };

  const convertAll = useCallback(async () => {
    if (items.length === 0) {
      setError('Список изображений пуст.');
      return;
    }

    setIsConverting(true);
    setError(null);

    const itemsToConvert = [...items];
    let activeIndex = 0;
    const CONCURRENCY_LIMIT = 6;

    // Worker logic
    const worker = async () => {
      while (true) {
        // Safely fetch next task index
        const currentIndex = activeIndex;
        activeIndex++;

        if (currentIndex >= itemsToConvert.length) {
          break;
        }

        const item = itemsToConvert[currentIndex];

        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: 'converting', error: null } : p))
        );

        try {
          const { blob, url } = await convertSingle(
            item.file,
            globalFormat,
            globalQuality,
            globalResizeMax
          );

          // Revoke old URL if it exists
          if (item.convertedUrl) {
            URL.revokeObjectURL(item.convertedUrl);
          }

          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? {
                    ...p,
                    status: 'success',
                    convertedUrl: url,
                    convertedSize: blob.size,
                    convertedBlob: blob,
                  }
                : p
            )
          );
        } catch (err: any) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? {
                    ...p,
                    status: 'error',
                    error: err?.message || 'Ошибка конвертации.',
                  }
                : p
            )
          );
        }
      }
    };

    // Spin up parallel workers
    const workerCount = Math.min(CONCURRENCY_LIMIT, itemsToConvert.length);
    const workers = Array.from({ length: workerCount }, worker);
    
    await Promise.all(workers);
    setIsConverting(false);
  }, [items, globalFormat, globalQuality, globalResizeMax]);

  const downloadAllZip = useCallback(async () => {
    const successItems = items.filter((item) => item.status === 'success' && item.convertedBlob);
    if (successItems.length === 0) {
      setError('Нет успешно сконвертированных файлов для скачивания.');
      return;
    }

    setError(null);
    const zip = new JSZip();

    successItems.forEach((item) => {
      if (item.convertedBlob) {
        const originalIndex = items.findIndex((p) => p.id === item.id);
        const filename = getConvertedFilename(
          item.file.name,
          globalFormat,
          namingType,
          customPrefix,
          customSuffix,
          originalIndex
        );
        zip.file(filename, item.convertedBlob);
      }
    });

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `converted_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up link and object URL
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
    } catch (err) {
      setError('Не удалось создать ZIP-архив.');
    }
  }, [items, globalFormat, namingType, customPrefix, customSuffix]);

  return {
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
  };
}
