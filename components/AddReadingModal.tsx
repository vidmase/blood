import React, { useState } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newReading: Omit<BloodPressureReading, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const HeartIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const { t, language } = useLocalization();
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    date: '',
    time: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  // Initialize with current date and time when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
      
      setFormData({
        systolic: '',
        diastolic: '',
        pulse: '',
        date: dateStr,
        time: timeStr,
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const systolic = parseInt(formData.systolic);
    const diastolic = parseInt(formData.diastolic);
    const pulse = parseInt(formData.pulse);

    if (!formData.systolic || systolic < 50 || systolic > 300) {
      newErrors.systolic = 'Systolic must be between 50-300 mmHg';
    }

    if (!formData.diastolic || diastolic < 30 || diastolic > 200) {
      newErrors.diastolic = 'Diastolic must be between 30-200 mmHg';
    }

    if (!formData.pulse || pulse < 30 || pulse > 200) {
      newErrors.pulse = 'Pulse must be between 30-200 BPM';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (systolic <= diastolic) {
      newErrors.systolic = 'Systolic must be higher than diastolic';
      newErrors.diastolic = 'Diastolic must be lower than systolic';
    }

    // Check if date is not in the future
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    if (selectedDateTime > now) {
      newErrors.date = 'Date cannot be in the future';
      newErrors.time = 'Time cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      await onSave({
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: parseInt(formData.pulse),
        date: dateTime,
        notes: formData.notes.trim() || undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving reading:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuickFill = (systolic: number, diastolic: number, pulse: number) => {
    setFormData(prev => ({
      ...prev,
      systolic: systolic.toString(),
      diastolic: diastolic.toString(),
      pulse: pulse.toString()
    }));
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <PlusIcon className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Add New Reading</h3>
              <p className="text-sm text-slate-600">Manually enter blood pressure data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Fill Buttons */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Fill (Common Values)</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(120, 80, 70)}
                className="p-2 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Optimal<br/>120/80, 70
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(130, 85, 75)}
                className="p-2 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Elevated<br/>130/85, 75
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(140, 90, 80)}
                className="p-2 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                High<br/>140/90, 80
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(110, 70, 65)}
                className="p-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Low<br/>110/70, 65
              </button>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.date ? 'border-red-500' : 'border-slate-300'
                }`}
                disabled={isLoading}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.time ? 'border-red-500' : 'border-slate-300'
                }`}
                disabled={isLoading}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Blood Pressure Values */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  Systolic (mmHg) *
                  <span className="text-red-500">↗</span>
                </span>
              </label>
              <input
                type="number"
                value={formData.systolic}
                onChange={(e) => handleInputChange('systolic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.systolic ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="120"
                min="50"
                max="300"
                disabled={isLoading}
              />
              {errors.systolic && <p className="text-red-500 text-xs mt-1">{errors.systolic}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  Diastolic (mmHg) *
                  <span className="text-blue-500">↘</span>
                </span>
              </label>
              <input
                type="number"
                value={formData.diastolic}
                onChange={(e) => handleInputChange('diastolic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.diastolic ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="80"
                min="30"
                max="200"
                disabled={isLoading}
              />
              {errors.diastolic && <p className="text-red-500 text-xs mt-1">{errors.diastolic}</p>}
            </div>
          </div>

          {/* Pulse */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <HeartIcon className="w-4 h-4 text-pink-500 animate-heartbeat" />
                Pulse (BPM) *
              </span>
            </label>
            <input
              type="number"
              value={formData.pulse}
              onChange={(e) => handleInputChange('pulse', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.pulse ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="70"
              min="30"
              max="200"
              disabled={isLoading}
            />
            {errors.pulse && <p className="text-red-500 text-xs mt-1">{errors.pulse}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Add any notes about this reading..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Add Reading
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
