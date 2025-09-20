
import React, { useState, useCallback } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface FileUploadProps {
  onImageUpload: (files: File[]) => void;
  isLoading: boolean;
  style?: React.CSSProperties;
  onOpenCamera: () => void;
}

interface FloatingUploadButtonProps {
  onImageUpload: (files: File[]) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const CameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// Modal Upload Component (for use inside modal)
const UploadModal: React.FC<FileUploadProps & { isOpen: boolean; onClose: () => void }> = ({ 
  onImageUpload, isLoading, onOpenCamera, isOpen, onClose 
}) => {
  const { t } = useLocalization();
  const [isDragging, setIsDragging] = useState(false);
  const [fileCount, setFileCount] = useState<number>(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
        setFileCount(imageFiles.length);
        onImageUpload(imageFiles);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        processFiles(Array.from(e.target.files));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg border-0 animate-scaleIn overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/80 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
        <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 rounded-full p-2 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110 z-20"
            aria-label="Close"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <UploadIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('upload.title')}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Smart OCR
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                AI Powered
              </span>
            </div>
          </div>

          {/* Dropzone */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out ${isDragging ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 scale-[1.02] shadow-2xl shadow-indigo-200/50' : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              multiple
            />
            <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800 animate-bounce' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <UploadIcon className={`w-8 h-8 transition-all duration-300 ${isDragging ? 'scale-125 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('upload.dropzone.click')}</span> 
                  <span className="text-gray-600 dark:text-gray-300"> {t('upload.dropzone.drag')}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('upload.dropzone.formats')}</p>
                {fileCount > 0 && !isLoading && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-fadeInUp">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {t('upload.dropzone.selected', { count: fileCount })}
                  </div>
                )}
              </div>
            </div>
      </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading}
              className="w-full flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>{t('upload.button.processing')}</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" /> 
                  <span>{t('upload.button.default')}</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenCamera}
              disabled={isLoading}
              aria-label={t('upload.button.camera')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold py-3.5 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <CameraIcon className="w-5 h-5" />
              <span>{t('upload.button.camera')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Upload Button Component
export const FileUpload: React.FC<FloatingUploadButtonProps> = ({ onImageUpload, isLoading, onOpenCamera }) => {
  const { t } = useLocalization();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-40 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-110 active:scale-95 animate-pulse-glow-subtle"
        aria-label={t('upload.title')}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageUpload={onImageUpload}
        isLoading={isLoading}
        onOpenCamera={onOpenCamera}
      />
    </>
  );
}