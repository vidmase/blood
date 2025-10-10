
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
  onAddManual?: () => void; // Add manual entry option
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

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// Modal Upload Component (for use inside modal)
const UploadModal: React.FC<FileUploadProps & { isOpen: boolean; onClose: () => void; onAddManual?: () => void }> = ({ 
  onImageUpload, isLoading, onOpenCamera, isOpen, onClose, onAddManual 
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
        // Close modal after successful upload
        setTimeout(() => {
          onClose();
        }, 500); // Small delay for better UX
    }
  }, [onImageUpload, onClose]);

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg border-0 animate-scaleIn overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f1f5]/80 via-[#d1e3ed]/60 to-[#d5f0f0]/80 dark:from-[#132440]/20 dark:via-[#16476A]/20 dark:to-[#3B9797]/20"></div>
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
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#16476A] via-[#132440] to-[#3B9797] flex items-center justify-center shadow-lg animate-pulse-glow">
              <UploadIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('upload.title')}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d5e8f0] dark:bg-[#16476A]/50 text-[#16476A] dark:text-[#5BC0C0] font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Smart OCR
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d5f0f0] dark:bg-[#3B9797]/50 text-[#3B9797] dark:text-[#5BC0C0] font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                AI Powered
              </span>
            </div>
          </div>

          {/* Dropzone */}
          <div 
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300 ease-in-out ${isDragging ? 'border-[#16476A] bg-gradient-to-br from-[#e8f1f5] to-[#d5f0f0] dark:from-[#132440]/30 dark:to-[#3B9797]/30 scale-[1.02] shadow-2xl shadow-[#16476A]/20' : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 active:border-[#3B9797] active:bg-gradient-to-br active:from-[#e8f1f5]/50 active:to-[#d5f0f0]/50'}`}
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
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 pointer-events-none">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-gradient-to-br from-[#d5e8f0] to-[#d5f0f0] dark:from-[#16476A] dark:to-[#3B9797] animate-bounce' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <UploadIcon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-300 ${isDragging ? 'scale-125 text-[#16476A] dark:text-[#3B9797]' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  <span className="bg-gradient-to-r from-[#16476A] to-[#132440] bg-clip-text text-transparent">{t('upload.dropzone.click')}</span> 
                  <span className="text-gray-600 dark:text-gray-300"> {t('upload.dropzone.drag')}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('upload.dropzone.formats')}</p>
                {fileCount > 0 && !isLoading && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d5f0f0] dark:bg-[#3B9797]/50 text-[#3B9797] dark:text-[#5BC0C0] text-sm font-medium animate-fadeInUp">
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
          <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Manual Add Button - Primary Action */}
            {onAddManual && (
              <button
                onClick={() => {
                  onAddManual();
                  onClose();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#16476A] to-[#132440] active:from-[#1a5680] active:to-[#16476A] text-white font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3B9797] dark:focus:ring-[#16476A] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-lg text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Reading Manually</span>
              </button>
            )}
            
            {/* Divider */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">or scan image</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            </div>
            
            {/* Image Upload Options */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
                className="w-full flex-1 md:w-full flex items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 active:border-indigo-300 dark:active:border-indigo-500 active:bg-gray-50 dark:active:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-400 border-t-transparent"></div>
                    <span>{t('upload.button.processing')}</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    <span>{t('upload.button.default')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  onOpenCamera();
                  onClose(); // Close modal when opening camera
                }}
                disabled={isLoading}
                aria-label={t('upload.button.camera')}
                className="w-full sm:w-auto md:hidden flex items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 active:border-indigo-300 dark:active:border-indigo-500 active:bg-gray-50 dark:active:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md text-sm sm:text-base"
              >
                <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('upload.button.camera')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Upload Button Component
export const FileUpload: React.FC<FloatingUploadButtonProps> = ({ onImageUpload, isLoading, onOpenCamera, onAddManual }) => {
  const { t } = useLocalization();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#16476A] via-[#132440] to-[#3B9797] text-white rounded-full shadow-xl sm:shadow-2xl transition-all duration-300 flex items-center justify-center z-40 disabled:opacity-60 disabled:cursor-not-allowed active:scale-90 animate-pulse-glow-subtle"
        aria-label="Add Reading"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
        onAddManual={onAddManual}
      />
    </>
  );
}