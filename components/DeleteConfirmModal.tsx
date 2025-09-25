import React from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: BloodPressureReading | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const WarningIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  reading,
  onConfirm,
  isLoading = false
}) => {
  const { t, language } = useLocalization();
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  if (!isOpen || !reading) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting reading:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <WarningIcon />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Delete Reading</h3>
              <p className="text-sm text-slate-600">This action cannot be undone</p>
            </div>
          </div>

          {/* Reading Details */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-slate-600 mb-2">
              {new Date(reading.date).toLocaleDateString(dateLocale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at {new Date(reading.date).toLocaleTimeString(dateLocale, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500 mb-1">SYSTOLIC</div>
                <div className="text-lg font-semibold text-slate-900">{reading.systolic}</div>
                <div className="text-xs text-slate-500">mmHg</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">DIASTOLIC</div>
                <div className="text-lg font-semibold text-slate-900">{reading.diastolic}</div>
                <div className="text-xs text-slate-500">mmHg</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">PULSE</div>
                <div className="text-lg font-semibold text-slate-900">{reading.pulse}</div>
                <div className="text-xs text-slate-500">BPM</div>
              </div>
            </div>
            {reading.notes && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-1">NOTES</div>
                <div className="text-sm text-slate-700">{reading.notes}</div>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete this blood pressure reading? This action will permanently remove the data from your records.
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon />
                  Delete Reading
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
