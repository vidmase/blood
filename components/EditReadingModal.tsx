import React, { useState, useEffect } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface EditReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: BloodPressureReading | null;
  onSave: (updatedReading: Partial<BloodPressureReading>) => Promise<void>;
  isLoading?: boolean;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SaveIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export const EditReadingModal: React.FC<EditReadingModalProps> = ({
  isOpen,
  onClose,
  reading,
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

  // Initialize form data when reading changes
  useEffect(() => {
    if (reading) {
      const readingDate = new Date(reading.date);
      const dateStr = readingDate.toISOString().split('T')[0];
      const timeStr = readingDate.toTimeString().split(' ')[0].substring(0, 5);
      
      setFormData({
        systolic: reading.systolic.toString(),
        diastolic: reading.diastolic.toString(),
        pulse: reading.pulse.toString(),
        date: dateStr,
        time: timeStr,
        notes: reading.notes || ''
      });
      setErrors({});
    }
  }, [reading]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !reading) return;

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      await onSave({
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: parseInt(formData.pulse),
        date: dateTime,
        notes: formData.notes.trim() || null
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

  if (!isOpen || !reading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-900">Edit Reading</h3>
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
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
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
                Time
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
                Systolic (mmHg)
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
                Diastolic (mmHg)
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
              Pulse (BPM)
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
          <div className="flex justify-end gap-3 pt-4">
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
