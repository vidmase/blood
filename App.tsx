import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ReadingsTable } from './components/ReadingsTable';
import { ReadingsCalendar } from './components/ReadingsCalendar';
import { CalendarReadingModal } from './components/CalendarReadingModal';
import { AnalysisChart } from './components/AnalysisChart';
import { AnalysisSummary } from './components/AnalysisSummary';
import { DateFilter } from './components/DateFilter';
import { ReportsDashboard } from './components/ReportsDashboard';
import { HealthInsights } from './components/HealthInsights';
import { BloodPressureTrends } from './components/BloodPressureTrends';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { CameraCapture } from './components/CameraCapture';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import { extractDataFromImage, analyzeReadings, getHealthInsights } from './services/geminiService';
import { bloodPressureService } from './services/bloodPressureService';
import type { BloodPressureReading, AnalysisData, HealthInsight, UserProfile, AppSettings } from './types';
import { useLocalization } from './context/LocalizationContext';

const ErrorDisplay: React.FC<{ message: string | null, onClose: () => void }> = ({ message, onClose }) => {
    const { t } = useLocalization();
    if (!message) return null;
    return (
        <div className="fixed bottom-4 right-4 max-w-sm w-full bg-[var(--c-danger)] border-l-4 border-red-700 text-white p-4 rounded-lg shadow-lg z-50 animate-fadeInUp" role="alert">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{t('error.title')}</p>
                    <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 p-1 text-white hover:bg-red-800 rounded-full focus:outline-none" aria-label={t('error.closeAriaLabel')}>&times;</button>
            </div>
        </div>
    );
};

const DEFAULT_PROFILE: UserProfile = { name: '', dob: '' };
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  goals: { systolic: 130, diastolic: 85 },
};

const MainApp: React.FC = () => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [healthInsights, setHealthInsights] = useState<HealthInsight[] | null>(null);
  const [isFetchingInsights, setIsFetchingInsights] = useState<boolean>(false);
  // Cancelation controls
  const analysisRunIdRef = useRef(0);
  const analysisCanceledRef = useRef(false);
  const insightsRunIdRef = useRef(0);
  const insightsCanceledRef = useRef(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [selectedDateReadings, setSelectedDateReadings] = useState<BloodPressureReading[]>([]);
  const [currentView, setCurrentView] = useState<'table' | 'calendar'>('table');
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
        return DEFAULT_PROFILE;
    }
  });


  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  // Load readings from database when user is authenticated
  useEffect(() => {
    const loadReadings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const dbReadings = await bloodPressureService.getReadings();
        setReadings(dbReadings);
      } catch (err) {
        console.error('Error loading readings:', err);
        setError('Failed to load readings from database');
      } finally {
        setIsLoading(false);
      }
    };

    loadReadings();
  }, [user]);


  const handleFilterChange = ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      const readingDateTime = new Date(reading.date).getTime();
      
      let startOk = true;
      if (startDate) {
        const startDateTime = new Date(`${startDate}T00:00:00`).getTime();
        startOk = readingDateTime >= startDateTime;
      }

      let endOk = true;
      if (endDate) {
        const endDateTime = new Date(`${endDate}T23:59:59.999`).getTime();
        endOk = readingDateTime <= endDateTime;
      }
      
      return startOk && endOk;
    });
  }, [readings, startDate, endDate]);

  const handleImageUpload = async (files: File[]) => {
    setIsLoading(true);
    setError(null);

    const readFileAsBase64 = (file: File) => {
      return new Promise<{ base64: string; mimeType: string; file: File }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            return reject(new Error('Failed to read file.'));
          }
          const base64Image = reader.result.split(',')[1];
          resolve({ base64: base64Image, mimeType: file.type, file });
        };
        reader.onerror = () => {
          reject(new Error('Error reading file.'));
        };
      });
    };

    try {
      const fileReadPromises = files.map(readFileAsBase64);
      const fileContents = await Promise.all(fileReadPromises);

      const extractionPromises = fileContents.map(content =>
        extractDataFromImage(content.base64, content.mimeType)
      );

      const results = await Promise.allSettled(extractionPromises);

      const newReadings: BloodPressureReading[] = [];
      const errorCounts: Record<string, number> = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { systolic, diastolic, pulse, date } = result.value;
          const originalFile = fileContents[index].file;
          
          const readingDate = (date && !isNaN(new Date(date).getTime()))
            ? new Date(date).toISOString()
            : new Date(originalFile.lastModified).toISOString();

          newReadings.push({
            id: originalFile.lastModified + index,
            date: readingDate,
            systolic,
            diastolic,
            pulse,
          });
        } else {
          const reasonKey = result.reason instanceof Error ? result.reason.message : 'errors.unknownExtraction';
          const translatedReason = t(reasonKey);
          errorCounts[translatedReason] = (errorCounts[translatedReason] || 0) + 1;
        }
      });

      if (newReadings.length > 0) {
        try {
          // Save readings to database
          const readingsData = newReadings.map(reading => ({
            systolic: reading.systolic,
            diastolic: reading.diastolic,
            pulse: reading.pulse,
            reading_date: reading.date,
          }));
          
          const savedReadings = await bloodPressureService.createReadings(readingsData);
          setReadings(prevReadings => [...prevReadings, ...savedReadings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          setError('Failed to save readings to database. Please try again.');
          return;
        }
      }

      const totalFailed = Object.values(errorCounts).reduce((sum, count) => sum + count, 0);

      if (totalFailed > 0) {
        let summary = t('upload.summary', {
            total: files.length,
            success: newReadings.length,
            failed: totalFailed,
        });
        const details = Object.entries(errorCounts)
            .map(([reason, count]) => t('upload.summary.errorItem', { count, reason }))
            .join('\n');
        setError(`${summary}\n\n${t('upload.summary.errorDetails')}\n${details}`);
      }

    } catch (err) {
      setError(t('errors.unexpectedProcessing'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAnalysis = useCallback(async () => {
    if (filteredReadings.length < 2) {
      setAnalysis(null);
      return;
    }
    // prepare run id and reset cancelation state
    const myRunId = ++analysisRunIdRef.current;
    analysisCanceledRef.current = false;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeReadings(filteredReadings, settings.goals, language);
      // if canceled or a newer run started, ignore
      if (analysisCanceledRef.current || analysisRunIdRef.current !== myRunId) return;
      setAnalysis(result);
    } catch (err) {
      if (analysisCanceledRef.current || analysisRunIdRef.current !== myRunId) return;
      console.error(err);
      const errorMessage = err instanceof Error ? t(err.message) : t('errors.unknown');
      if (errorMessage.startsWith(t('errors.network').substring(0, 10))) {
        setError(errorMessage);
        setAnalysis(null);
      } else {
        setError(t('errors.analysisFailed', { message: errorMessage }));
        setAnalysis({
            keyMetrics: { avgSystolic: 0, avgDiastolic: 0, avgPulse: 0 },
            overallTrend: { trend: "Fluctuating", summary: t('errors.analysisFailed', { message: errorMessage }) },
            historicalComparison: null,
            observations: [{ type: 'General', message: t('errors.analysisObservationsFailed') }],
            encouragement: t('errors.analysisEncouragement')
        });
      }
    } finally {
      if (analysisRunIdRef.current === myRunId) {
        setIsAnalyzing(false);
      }
    }
  }, [filteredReadings, settings.goals, t, language]);
  
  // Removed automatic analysis trigger to ensure AI Analysis runs only when manually triggered
  // via the onRegenerate button in AnalysisSummary.

  // Manual Health Insights generation, triggered by header button
  const generateInsights = useCallback(async () => {
    if (!analysis || analysis.observations.length === 0) {
      setHealthInsights(null);
      return;
    }
    const myRunId = ++insightsRunIdRef.current;
    insightsCanceledRef.current = false;
    setIsFetchingInsights(true);
    setHealthInsights(null);
    try {
      const insights = await getHealthInsights(analysis.observations, analysis.overallTrend, language);
      if (insightsCanceledRef.current || insightsRunIdRef.current !== myRunId) return;
      setHealthInsights(insights);
    } catch (err) {
      if (insightsCanceledRef.current || insightsRunIdRef.current !== myRunId) return;
      console.error('Failed to fetch health insights:', err);
    } finally {
      if (insightsRunIdRef.current === myRunId) {
        setIsFetchingInsights(false);
      }
    }
  }, [analysis, language]);

  // Header button wrappers: open modal then run generation
  const openAnalysisModal = useCallback(async () => {
    setIsAnalysisModalOpen(true);
    await generateAnalysis();
  }, [generateAnalysis]);

  const openInsightsModal = useCallback(async () => {
    setIsInsightsModalOpen(true);
    await generateInsights();
  }, [generateInsights]);

  const cancelAnalysis = useCallback(() => {
    analysisCanceledRef.current = true;
    setIsAnalyzing(false);
  }, []);

  const cancelInsights = useCallback(() => {
    insightsCanceledRef.current = true;
    setIsFetchingInsights(false);
  }, []);


  const handleExportPDF = (options: { includeAnalysis: boolean; includeInsights: boolean }) => {
    const { includeAnalysis, includeInsights } = options;
    if (filteredReadings.length === 0) return;

    const doc = new jsPDF();
    const pageMargin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - pageMargin * 2;
    let y = 22;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 22;
      }
    };

    const addSectionTitle = (title: string) => {
      checkPageBreak(12);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40);
      doc.text(title, pageMargin, y);
      y += 8;
    };

    const addText = (text: string | string[], options: { size?: number, style?: string, color?: number, indent?: number } = {}) => {
      const { size = 10, style = 'normal', color = 100, indent = 0 } = options;
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(String(text), textWidth - indent);
      checkPageBreak(lines.length * 5);
      doc.text(lines, pageMargin + indent, y);
      y += lines.length * 5;
    };
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text(t('export.mainTitle'), pageMargin, y);
    y += 8;

    if (startDate || endDate) {
      const formattedStartDate = startDate ? new Date(`${startDate}T00:00:00`).toLocaleDateString() : t('export.periodStart');
      const formattedEndDate = endDate ? new Date(`${endDate}T23:59:59`).toLocaleDateString() : t('export.periodEnd');
      addText(`${t('export.period')}: ${formattedStartDate} ${t('export.periodTo')} ${formattedEndDate}`, { size: 11, color: 100 });
      y += 5;
    }

    if (includeAnalysis && analysis) {
      addSectionTitle(t('export.analysisTitle'));
      addText(t('export.overallTrend'), { style: 'bold' });
      addText(`${analysis.overallTrend.trend} - ${analysis.overallTrend.summary}`, { indent: 2 });
      y += 3;
      addText(t('export.keyMetrics'), { style: 'bold' });
      addText([
          `${t('export.systolic')}: ${Math.round(analysis.keyMetrics.avgSystolic)}`,
          `${t('export.diastolic')}: ${Math.round(analysis.keyMetrics.avgDiastolic)}`,
          `${t('export.pulse')}: ${Math.round(analysis.keyMetrics.avgPulse)}`,
      ], { indent: 2 });
      y += 3;
      addText(t('export.observations'), { style: 'bold' });
      analysis.observations.forEach(obs => addText(`- ${obs.message}`, { indent: 2 }));
      y += 3;
      addText(analysis.encouragement, { size: 9, style: 'italic' });
      y += 6;
    }
    
    if (includeInsights && healthInsights && healthInsights.length > 0) {
      addSectionTitle(t('export.insightsTitle'));
      healthInsights.forEach(insight => {
        addText(insight.category, { style: 'bold' });
        addText(`- ${insight.tip}`, { indent: 2 });
      });
      y += 6;
    }
    
    addSectionTitle(t('export.readingsTitle'));
    
    const tableData = filteredReadings.map(r => ([
        new Date(r.date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        r.systolic,
        r.diastolic,
        r.pulse
    ]));

    (doc as any).autoTable({
        head: [[t('table.date'), t('table.systolic'), t('table.diastolic'), t('table.pulse')]],
        body: tableData,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save('blood_pressure_report.pdf');
    setIsExportModalOpen(false);
  };
  
  const handleSaveSettings = (newProfile: UserProfile, newSettings: AppSettings) => {
    setProfile(newProfile);
    setSettings(newSettings);
    setIsSettingsModalOpen(false);
  };

  const handleClearData = async () => {
    if (window.confirm(t('settings.data.clearConfirm'))) {
        try {
          await bloodPressureService.deleteAllReadings();
          setReadings([]);
          setAnalysis(null);
          setHealthInsights(null);
          localStorage.removeItem('readings'); // Clear any remaining local storage
          setIsSettingsModalOpen(false);
        } catch (err) {
          console.error('Error clearing data:', err);
          setError('Failed to clear data from database');
        }
    }
  };

  const handleCapture = (imageFile: File) => {
    setIsCameraOpen(false);
    handleImageUpload([imageFile]);
  };

  const handleCalendarDateSelect = (date: Date, readings: BloodPressureReading[]) => {
    setSelectedCalendarDate(date);
    setSelectedDateReadings(readings);
    setIsCalendarModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--c-text-primary)]">
      <Header 
        userName={profile.name} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onAnalyze={openAnalysisModal}
        isAnalyzing={isAnalyzing}
        canAnalyze={filteredReadings.length >= 2}
        onGenerateInsights={openInsightsModal}
        isFetchingInsights={isFetchingInsights}
        insightsAvailable={!!(healthInsights && healthInsights.length > 0)}
      />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 flex flex-col gap-8 stagger-children">
            {/* FileUpload is now a floating button */}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8 stagger-children" style={{'--stagger-index': 2} as React.CSSProperties}>
            
            <div className="bg-[var(--c-surface)] p-6 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-[var(--c-text-primary)]">{t('readings.title')}</h2>
                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setCurrentView('table')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        currentView === 'table' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
                      </svg>
                      Table
                    </button>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        currentView === 'calendar' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Calendar
                    </button>
                  </div>
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    disabled={filteredReadings.length === 0}
                    className="flex items-center justify-center gap-2 bg-[var(--c-surface)] text-[var(--c-text-secondary)] font-bold py-2 px-4 rounded-lg border border-[var(--c-border)] hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('export.button')}
                  </button>
                </div>
              </div>
              
              {currentView === 'table' && (
                <>
                  <DateFilter onFilterChange={handleFilterChange} startDate={startDate} endDate={endDate} />
                  <div className="mt-4">
                    <ReadingsTable readings={filteredReadings} totalReadings={readings.length} />
                  </div>
                </>
              )}
              
              {currentView === 'calendar' && (
                <div className="mt-4">
                  <ReadingsCalendar 
                    readings={readings} 
                    onDateSelect={handleCalendarDateSelect}
                  />
                </div>
              )}
            </div>

            <BloodPressureTrends readings={filteredReadings} />

            <div className="bg-[var(--c-surface)] p-6 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp">
              <h2 className="text-2xl font-bold text-[var(--c-text-primary)] mb-4">{t('chart.title')}</h2>
              <AnalysisChart data={filteredReadings} totalReadings={readings.length} />
            </div>

            <ReportsDashboard readings={filteredReadings} startDate={startDate} endDate={endDate} />
            
          </div>
        </div>
      </main>
      
      {/* Floating Upload Button */}
      <FileUpload
        onImageUpload={handleImageUpload}
        isLoading={isLoading}
        onOpenCamera={() => setIsCameraOpen(true)}
      />
      
      <ErrorDisplay message={error} onClose={() => setError(null)} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportPDF}
        analysisAvailable={analysis !== null}
        insightsAvailable={healthInsights !== null && healthInsights.length > 0}
      />
      {/* AI Analysis Modal */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-[var(--c-surface)] rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <button
              onClick={() => { cancelAnalysis(); setIsAnalysisModalOpen(false); }}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
            <div className="flex justify-end mb-3">
              <button
                onClick={isAnalyzing ? cancelAnalysis : generateAnalysis}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 transition-colors"
              >
                {isAnalyzing ? 'Cancel' : 'Run Analysis'}
              </button>
            </div>
            <AnalysisSummary
              analysisData={analysis}
              isLoading={isAnalyzing}
              onRegenerate={generateAnalysis}
              hasEnoughReadings={filteredReadings.length >= 2}
            />
          </div>
        </div>
      )}

      {/* Health Insights Modal */}
      {isInsightsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-[var(--c-surface)] rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <button
              onClick={() => { cancelInsights(); setIsInsightsModalOpen(false); }}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4">Health Insights</h3>
            <div className="flex justify-end mb-3">
              <button
                onClick={isFetchingInsights ? cancelInsights : generateInsights}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 transition-colors"
              >
                {isFetchingInsights ? 'Cancel' : 'Generate Insights'}
              </button>
            </div>
            <HealthInsights
              insights={healthInsights}
              isLoading={isFetchingInsights}
            />
            {!healthInsights && !isFetchingInsights && (
              <p className="text-sm text-[var(--c-text-secondary)] mt-2">Run AI Analysis first to generate insights.</p>
            )}
          </div>
        </div>
      )}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        onClearData={handleClearData}
        currentProfile={profile}
        currentSettings={settings}
      />
      {isCameraOpen && (
        <CameraCapture
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCapture}
        />
      )}
      
      {/* Calendar Reading Modal */}
      <CalendarReadingModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        date={selectedCalendarDate}
        readings={selectedDateReadings}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserSettingsProvider>
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      </UserSettingsProvider>
    </AuthProvider>
  );
};

export default App;