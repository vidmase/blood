import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface ESHClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESHClassificationModal: React.FC<ESHClassificationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  
  // Handle escape key and body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent background scrolling when modal is open
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore scrolling when modal closes
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow || '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const classifications = [
    {
      category: t('esh.categories.optimal'),
      categoryKey: 'optimal',
      color: '#10b981',
      colorName: 'Green',
      systolicRange: '< 120',
      diastolicRange: '< 80',
      description: t('esh.descriptions.optimal')
    },
    {
      category: t('esh.categories.normal'),
      categoryKey: 'normal',
      color: '#84cc16',
      colorName: 'Lime',
      systolicRange: '120-129',
      diastolicRange: '80-84',
      description: t('esh.descriptions.normal')
    },
    {
      category: t('esh.categories.highNormal'),
      categoryKey: 'highNormal',
      color: '#fbbf24',
      colorName: 'Amber',
      systolicRange: '130-139',
      diastolicRange: '85-89',
      description: t('esh.descriptions.highNormal')
    },
    {
      category: t('esh.categories.grade1HTN'),
      categoryKey: 'grade1HTN',
      color: '#fb923c',
      colorName: 'Orange',
      systolicRange: '140-159',
      diastolicRange: '90-99',
      description: t('esh.descriptions.grade1HTN')
    },
    {
      category: t('esh.categories.grade2HTN'),
      categoryKey: 'grade2HTN',
      color: '#f87171',
      colorName: 'Light Red',
      systolicRange: '160-179',
      diastolicRange: '100-109',
      description: t('esh.descriptions.grade2HTN')
    },
    {
      category: t('esh.categories.grade3HTN'),
      categoryKey: 'grade3HTN',
      color: '#dc2626',
      colorName: 'Red',
      systolicRange: '180-219',
      diastolicRange: '110-119',
      description: t('esh.descriptions.grade3HTN')
    },
    {
      category: t('esh.categories.crisis'),
      categoryKey: 'crisis',
      color: '#991b1b',
      colorName: 'Dark Red',
      systolicRange: '≥ 220',
      diastolicRange: '≥ 120',
      description: t('esh.descriptions.crisis')
    },
    {
      category: t('esh.categories.isolatedSystolic'),
      categoryKey: 'isolatedSystolic',
      color: '#f97316',
      colorName: 'Orange',
      systolicRange: '≥ 140',
      diastolicRange: '< 90',
      description: t('esh.descriptions.isolatedSystolic')
    },
    {
      category: t('esh.categories.hypotension'),
      categoryKey: 'hypotension',
      color: '#60a5fa',
      colorName: 'Blue',
      systolicRange: '≤ 89',
      diastolicRange: '≤ 59',
      description: t('esh.descriptions.hypotension')
    }
  ];

  const getRiskLevel = (categoryKey: string) => {
    switch (categoryKey) {
      case 'crisis':
      case 'grade3HTN':
        return { level: t('esh.riskLevels.critical'), color: 'text-red-900 bg-red-100' };
      case 'grade2HTN':
        return { level: t('esh.riskLevels.veryHigh'), color: 'text-red-700 bg-red-50' };
      case 'grade1HTN':
      case 'isolatedSystolic':
        return { level: t('esh.riskLevels.high'), color: 'text-orange-700 bg-orange-50' };
      case 'highNormal':
        return { level: t('esh.riskLevels.moderate'), color: 'text-amber-700 bg-amber-50' };
      case 'normal':
      case 'optimal':
      case 'hypotension':
        return { level: t('esh.riskLevels.low'), color: 'text-green-700 bg-green-50' };
      default:
        return { level: 'Unknown', color: 'text-gray-700 bg-gray-50' };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fadeIn"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      ></div>

      {/* Modal */}
      <div 
        className="flex min-h-full items-center justify-center p-4"
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col animate-scaleIn"
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '72rem',
            width: '100%',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('esh.title')}</h2>
                  <p className="text-indigo-100 mt-1">{t('esh.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            className="p-6 overflow-y-auto flex-1"
            style={{
              overflowY: 'auto',
              flex: '1',
              minHeight: '0'
            }}
          >
            {/* Info Box */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">{t('esh.importantNotes')}</p>
                  <ul className="space-y-0.5 text-blue-700">
                    <li>• {t('esh.notes.categoryRule')}</li>
                    <li>• {t('esh.notes.adultsOnly')}</li>
                    <li>• {t('esh.notes.measurement')}</li>
                    <li>• {t('esh.notes.consultation')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Classification Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-indigo-50">
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-800 border-b-2 border-slate-300">{t('esh.table.category')}</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-slate-800 border-b-2 border-slate-300">{t('esh.table.systolic')}</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-slate-800 border-b-2 border-slate-300">{t('esh.table.diastolic')}</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-slate-800 border-b-2 border-slate-300">{t('esh.table.risk')}</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-800 border-b-2 border-slate-300">{t('esh.table.description')}</th>
                    </tr>
                  </thead>
                <tbody>
                  {classifications.map((item, index) => {
                    const risk = getRiskLevel(item.categoryKey);
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-semibold text-slate-800">{item.category}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center border-b border-slate-200">
                          <span className="text-sm font-medium text-slate-700">{item.systolicRange}</span>
                        </td>
                        <td className="px-3 py-2 text-center border-b border-slate-200">
                          <span className="text-sm font-medium text-slate-700">{item.diastolicRange}</span>
                        </td>
                        <td className="px-3 py-2 text-center border-b border-slate-200">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                            {risk.level}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b border-slate-200">
                          <span className="text-xs text-slate-600">{item.description}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Required Section */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-800 mb-3">🚨 {t('esh.actionRequired')}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-bold text-red-800 mb-1 text-sm">{t('esh.emergency')}</h4>
                  <p className="text-xs text-red-700">{t('esh.emergencyAction')}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-bold text-orange-800 mb-1 text-sm">{t('esh.urgent')}</h4>
                  <p className="text-xs text-orange-700">{t('esh.urgentAction')}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-bold text-yellow-800 mb-1 text-sm">{t('esh.schedule')}</h4>
                  <p className="text-xs text-yellow-700">{t('esh.scheduleAction')}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-bold text-blue-800 mb-1 text-sm">{t('esh.consult')}</h4>
                  <p className="text-xs text-blue-700">{t('esh.consultAction')}</p>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-800 mb-3">{t('esh.colorLegend')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {classifications.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs font-medium text-slate-700">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">
                  {t('esh.footer.basedOn')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('esh.footer.journal')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {t('esh.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESHClassificationModal;
