import React, { useState } from 'react';
import type { BloodPressureReading } from '../types';
import { generateBloodPressurePDF } from '../services/pdfReportService';
import { useUserSettings } from '../context/UserSettingsContext';

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: BloodPressureReading[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export const PDFDownloadModal: React.FC<PDFDownloadModalProps> = ({
  isOpen,
  onClose,
  readings,
  dateRange
}) => {
  const { targets } = useUserSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'comprehensive'>('comprehensive');

  const handleDownload = async () => {
    if (readings.length === 0) {
      alert('No readings available for PDF generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdfBlob = await generateBloodPressurePDF({
        readings,
        patientName: patientName || undefined,
        dateRange,
        targets,
        includeCharts
      });

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blood-pressure-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Generate PDF Report</h2>
                <p className="text-blue-100 text-sm">Create a professional blood pressure report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Report Preview</h3>
                <p className="text-sm text-gray-600">{readings.length} readings • {dateRange ? `${dateRange.start} to ${dateRange.end}` : 'All time'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs">Avg. Systolic</div>
                <div className="font-bold text-lg text-gray-900">
                  {Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs">Avg. Diastolic</div>
                <div className="font-bold text-lg text-gray-900">
                  {Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name (Optional)
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name for the report"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Report Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'summary', label: 'Summary Report', desc: 'Basic statistics and overview' },
                { value: 'detailed', label: 'Detailed Report', desc: 'Complete readings table' },
                { value: 'comprehensive', label: 'Comprehensive Report', desc: 'Full analysis with charts and insights' }
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Include visual charts and trends</span>
            </label>
          </div>

          {/* Features List */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">✨ Report Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Professional medical-grade layout</li>
              <li>• ESH Blood Pressure Classification</li>
              <li>• Statistical analysis and trends</li>
              <li>• Personalized insights and recommendations</li>
              <li>• Comprehensive data table</li>
              <li>• Ready for healthcare provider review</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating || readings.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
