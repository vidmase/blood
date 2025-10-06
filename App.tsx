import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ReadingsTable } from './components/ReadingsTable';
import { ReadingsCalendar } from './components/ReadingsCalendar';
import { CalendarReadingModal } from './components/CalendarReadingModal';
import { EditReadingModal } from './components/EditReadingModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PinVerificationModal } from './components/PinVerificationModal';
import { AddReadingModal } from './components/AddReadingModal';
import { AnalysisSummary } from './components/AnalysisSummary';
import { DateFilter } from './components/DateFilter';
import { ReportsDashboard } from './components/ReportsDashboard';
import { HealthInsights } from './components/HealthInsights';
import { BloodPressureTrends } from './components/BloodPressureTrends';
import { ExportModal } from './components/ExportModal';
import { UnifiedSettingsModal } from './components/UnifiedSettingsModal';
import { CameraCapture } from './components/CameraCapture';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HealthScoreDashboard } from './components/HealthScoreDashboard';
import { QuickStatsWidget } from './components/QuickStatsWidget';
import { GoalsProgress } from './components/GoalsProgress';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<BloodPressureReading | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
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

  // Handle Google OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        console.log('Processing OAuth callback...');
        try {
          const { googleCalendarSyncService } = await import('./services/googleCalendarSyncService');
          const syncConfig = await googleCalendarSyncService.handleOAuthCallback(code, state);
          
          console.log('OAuth successful, saving config:', syncConfig);
          
          // Save the sync configuration to settings using functional update
          setSettings(prevSettings => {
            const updatedSettings = {
              ...prevSettings,
              googleCalendarSync: {
                ...syncConfig,
                enabled: true,
              },
            };
            localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
            console.log('Settings saved:', updatedSettings);
            return updatedSettings;
          });
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Show success message
          setTimeout(() => {
            setIsSettingsModalOpen(true);
          }, 100);
        } catch (err: any) {
          console.error('OAuth callback error:', err);
          // Only show error if it's not a state mismatch (which we now handle gracefully)
          if (!err.message?.includes('OAuth state')) {
            setError(err.message || 'Failed to connect to Google Calendar');
          }
          // Clear URL params even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleOAuthCallback();
  }, []);

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
          
          // Auto-sync to Google Calendar if enabled
          if (settings.googleCalendarSync?.autoSync && settings.googleCalendarSync?.accessToken && savedReadings.length > 0) {
            try {
              console.log(`Auto-syncing ${savedReadings.length} new reading(s) to Google Calendar...`);
              const { googleCalendarSyncService } = await import('./services/googleCalendarSyncService');
              const updatedConfig = await googleCalendarSyncService.syncReadings(
                savedReadings,
                settings.googleCalendarSync,
                () => {} // No progress callback for background sync
              );
              
              // Update settings with new sync config
              setSettings(prev => ({
                ...prev,
                googleCalendarSync: updatedConfig,
              }));
              
              console.log('Readings auto-synced successfully!');
            } catch (syncErr) {
              console.error('Auto-sync failed:', syncErr);
              // Don't show error to user for background sync failures
            }
          }
          
          // Automatically switch to table view to show the new records
          setCurrentView('table');
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

  const handleEditReading = (reading: BloodPressureReading) => {
    setSelectedReading(reading);
    setPendingAction('edit');
    setIsPinModalOpen(true);
  };

  const handleDeleteReading = (reading: BloodPressureReading) => {
    setSelectedReading(reading);
    setPendingAction('delete');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false); // Close the PIN modal first
    
    if (pendingAction === 'edit') {
      setIsEditModalOpen(true);
    } else if (pendingAction === 'delete') {
      setIsDeleteModalOpen(true);
    }
    setPendingAction(null);
  };

  const handlePinClose = () => {
    setIsPinModalOpen(false);
    setPendingAction(null);
    setSelectedReading(null);
  };

  const handleSaveReading = async (updatedData: Partial<BloodPressureReading>) => {
    if (!selectedReading) return;

    setIsUpdating(true);
    try {
      const updatedReading = await bloodPressureService.updateReading(
        selectedReading.id.toString(),
        {
          systolic: updatedData.systolic,
          diastolic: updatedData.diastolic,
          pulse: updatedData.pulse,
          reading_date: updatedData.date,
          notes: updatedData.notes,
        }
      );

      // Update the readings list
      setReadings(prevReadings => 
        prevReadings.map(reading => 
          reading.id === selectedReading.id ? updatedReading : reading
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      setIsEditModalOpen(false);
      setSelectedReading(null);
    } catch (err) {
      console.error('Error updating reading:', err);
      setError('Failed to update reading. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReading) return;

    setIsUpdating(true);
    try {
      // Delete from database
      await bloodPressureService.deleteReading(selectedReading.id.toString());

      // Delete from Google Calendar if auto-sync is enabled
      if (settings.googleCalendarSync?.autoSync && settings.googleCalendarSync?.accessToken) {
        try {
          console.log('Deleting reading from Google Calendar...');
          const { googleCalendarSyncService } = await import('./services/googleCalendarSyncService');
          const updatedConfig = await googleCalendarSyncService.deleteReadingEvent(
            selectedReading.id,
            settings.googleCalendarSync
          );
          
          // Update settings with new sync config
          setSettings(prev => ({
            ...prev,
            googleCalendarSync: updatedConfig,
          }));
          
          console.log('Reading deleted from Google Calendar successfully!');
        } catch (syncErr) {
          console.error('Failed to delete from Google Calendar:', syncErr);
          // Don't fail the deletion if calendar sync fails
        }
      }

      // Remove the reading from the list
      setReadings(prevReadings => 
        prevReadings.filter(reading => reading.id !== selectedReading.id)
      );

      setIsDeleteModalOpen(false);
      setSelectedReading(null);
    } catch (err) {
      console.error('Error deleting reading:', err);
      setError('Failed to delete reading. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddReading = async (newReadingData: Omit<BloodPressureReading, 'id'>) => {
    setIsUpdating(true);
    try {
      const newReading = await bloodPressureService.createReading({
        systolic: newReadingData.systolic,
        diastolic: newReadingData.diastolic,
        pulse: newReadingData.pulse,
        reading_date: newReadingData.date,
        notes: newReadingData.notes,
      });

      // Add the new reading to the list
      setReadings(prevReadings => 
        [newReading, ...prevReadings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      // Auto-sync to Google Calendar if enabled
      if (settings.googleCalendarSync?.autoSync && settings.googleCalendarSync?.accessToken) {
        try {
          console.log('Auto-syncing new reading to Google Calendar...');
          const { googleCalendarSyncService } = await import('./services/googleCalendarSyncService');
          const updatedConfig = await googleCalendarSyncService.syncReadings(
            [newReading],
            settings.googleCalendarSync,
            () => {} // No progress callback for single reading
          );
          
          // Update settings with new sync config
          setSettings(prev => ({
            ...prev,
            googleCalendarSync: updatedConfig,
          }));
          
          console.log('Reading auto-synced successfully!');
        } catch (syncErr) {
          console.error('Auto-sync failed:', syncErr);
          // Don't show error to user for background sync failures
        }
      }

      setIsAddModalOpen(false);
      // Automatically switch to table view to show the new record
      setCurrentView('table');
    } catch (err) {
      console.error('Error adding reading:', err);
      setError('Failed to add reading. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
        readings={readings}
      />
      <main className="flex-grow container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 xl:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 xl:gap-8 2xl:gap-10">
            
            {/* Sidebar for Desktop */}
            <div className="xl:col-span-1 2xl:col-span-1 flex flex-col gap-4 sm:gap-5 md:gap-6 xl:gap-8 stagger-children">
              {/* Quick Actions Panel */}
              <div className="hidden xl:block bg-[var(--c-surface)] p-6 2xl:p-8 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp border border-slate-100/50">
                <h3 className="text-lg 2xl:text-xl font-bold text-[var(--c-text-primary)] mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('buttons.quickActions')}
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-semibold">{t('buttons.addReading')}</span>
                  </button>
                  <button
                    onClick={openAnalysisModal}
                    disabled={filteredReadings.length < 2 || isAnalyzing}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold">{isAnalyzing ? t('buttons.analyzing') : t('buttons.aiAnalysis')}</span>
                  </button>
                  <button
                    onClick={openInsightsModal}
                    disabled={isFetchingInsights}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isFetchingInsights ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a7 7 0 00-7 7c0 2.577 1.5 4.5 3 6 1 1 2 2 2 3v2h4v-2c0-1 1-2 2-3 1.5-1.5 3-3.423 3-6a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-semibold">{isFetchingInsights ? t('buttons.loading') : t('buttons.healthInsights')}</span>
                  </button>
                </div>
              </div>
              
              {/* Statistics Panel */}
              <div className="hidden xl:block bg-[var(--c-surface)] p-6 2xl:p-8 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp border border-slate-100/50">
                <h3 className="text-lg 2xl:text-xl font-bold text-[var(--c-text-primary)] mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('buttons.statistics')}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{readings.length}</div>
                    <div className="text-sm text-blue-600 font-medium">{t('buttons.totalReadings')}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-700">{filteredReadings.length}</div>
                    <div className="text-sm text-emerald-600 font-medium">{t('buttons.thisPeriod')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 2xl:col-span-4 flex flex-col gap-4 sm:gap-5 md:gap-6 xl:gap-8 stagger-children" style={{'--stagger-index': 2} as React.CSSProperties}>
            
            <div className="bg-[var(--c-surface)] p-4 sm:p-5 md:p-6 xl:p-8 2xl:p-10 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp border border-slate-100/50">
              <div className="flex flex-col gap-3 sm:gap-4 xl:gap-6 mb-4 sm:mb-5 md:mb-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4">
                  <h2 className="text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-[var(--c-text-primary)] flex items-center gap-2 sm:gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 xl:h-8 xl:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('readings.title')}
                  </h2>
                  
                  {/* Mobile Action Buttons - Only visible on mobile/tablet */}
                  <div className="xl:hidden flex flex-wrap gap-2">
                    <button
                      onClick={openAnalysisModal}
                      disabled={filteredReadings.length < 2 || isAnalyzing}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white active:scale-95 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-semibold">{isAnalyzing ? t('buttons.analyzing') : t('buttons.aiAnalysis')}</span>
                    </button>
                    <button
                      onClick={openInsightsModal}
                      disabled={isFetchingInsights}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white active:scale-95 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isFetchingInsights ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a7 7 0 00-7 7c0 2.577 1.5 4.5 3 6 1 1 2 2 2 3v2h4v-2c0-1 1-2 2-3 1.5-1.5 3-3.423 3-6a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-semibold">{isFetchingInsights ? t('buttons.loading') : t('buttons.insights')}</span>
                    </button>
                  </div>
                  
                </div>
                
                {/* Enhanced Controls Layout */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:items-center xl:justify-between">
                  {/* View Toggle */}
                  <div className="flex bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg sm:rounded-xl p-1 sm:p-1.5 flex-shrink-0 border border-slate-200">
                    <button
                      onClick={() => setCurrentView('table')}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 xl:px-6 py-2 sm:py-2.5 xl:py-3 rounded-md sm:rounded-lg xl:rounded-xl text-xs sm:text-sm xl:text-base font-semibold transition-all duration-200 active:scale-95 ${
                        currentView === 'table' 
                          ? 'bg-white text-slate-900 shadow-md sm:shadow-lg border border-slate-200' 
                          : 'text-slate-600 active:bg-white/50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 xl:h-5 xl:w-5 inline mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
                      </svg>
                      <span className="hidden sm:inline">{t('buttons.tableView')}</span>
                      <span className="sm:hidden">Table</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 xl:px-6 py-2 sm:py-2.5 xl:py-3 rounded-md sm:rounded-lg xl:rounded-xl text-xs sm:text-sm xl:text-base font-semibold transition-all duration-200 active:scale-95 ${
                        currentView === 'calendar' 
                          ? 'bg-white text-slate-900 shadow-md sm:shadow-lg border border-slate-200' 
                          : 'text-slate-600 active:bg-white/50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 xl:h-5 xl:w-5 inline mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">{t('buttons.calendarView')}</span>
                      <span className="sm:hidden">Calendar</span>
                    </button>
                  </div>
                  
                  {/* Enhanced Export and Filter Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      disabled={filteredReadings.length === 0}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 xl:gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-2.5 sm:py-2.5 xl:py-3 px-4 xl:px-6 rounded-lg xl:rounded-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md sm:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm xl:text-base"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xl:h-5 xl:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{t('buttons.exportPDF')}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {currentView === 'table' && (
                <>
                  <DateFilter onFilterChange={handleFilterChange} startDate={startDate} endDate={endDate} />
                  <div className="mt-4">
                    <ReadingsTable 
                      readings={filteredReadings} 
                      totalReadings={readings.length}
                      onEditReading={handleEditReading}
                      onDeleteReading={handleDeleteReading}
                    />
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

            <ErrorBoundary>
              <BloodPressureTrends readings={filteredReadings} />
            </ErrorBoundary>

            <ErrorBoundary>
              <ReportsDashboard readings={filteredReadings} startDate={startDate} endDate={endDate} />
            </ErrorBoundary>

            {/* New Premium Components - 3 Column Grid on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <ErrorBoundary>
                <HealthScoreDashboard readings={readings} />
              </ErrorBoundary>
              <ErrorBoundary>
                <QuickStatsWidget readings={readings} />
              </ErrorBoundary>
              <ErrorBoundary>
                <GoalsProgress readings={readings} />
              </ErrorBoundary>
            </div>
            
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Upload Button */}
      <FileUpload
        onImageUpload={handleImageUpload}
        isLoading={isLoading}
        onOpenCamera={() => setIsCameraOpen(true)}
        onAddManual={() => setIsAddModalOpen(true)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-[var(--c-surface)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('buttons.aiAnalysis')}</h3>
              <button
                onClick={() => { cancelAnalysis(); setIsAnalysisModalOpen(false); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-end mb-3">
              <button
                onClick={isAnalyzing ? cancelAnalysis : generateAnalysis}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 transition-colors"
              >
                {isAnalyzing ? t('buttons.cancel') : t('buttons.runAnalysis')}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-[var(--c-surface)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('buttons.healthInsights')}</h3>
              <button
                onClick={() => { cancelInsights(); setIsInsightsModalOpen(false); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-end mb-3">
              <button
                onClick={isFetchingInsights ? cancelInsights : generateInsights}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 transition-colors"
              >
                {isFetchingInsights ? t('buttons.cancel') : t('buttons.generateInsights')}
              </button>
            </div>
            <HealthInsights
              insights={healthInsights}
              isLoading={isFetchingInsights}
            />
            {!healthInsights && !isFetchingInsights && (
              <p className="text-sm text-[var(--c-text-secondary)] mt-2">{t('modals.runAnalysisFirst')}</p>
            )}
          </div>
        </div>
      )}
      <UnifiedSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        onClearData={handleClearData}
        currentProfile={profile}
        currentSettings={settings}
        readings={readings}
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

      {/* Edit Reading Modal */}
      <EditReadingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReading(null);
        }}
        reading={selectedReading}
        onSave={handleSaveReading}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedReading(null);
        }}
        reading={selectedReading}
        onConfirm={handleConfirmDelete}
        isLoading={isUpdating}
      />

      {/* PIN Verification Modal */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={handlePinClose}
        onSuccess={handlePinSuccess}
        title={t('modals.securityVerification')}
        message={pendingAction === 'edit' ? t('modals.enterPinToEdit') : t('modals.enterPinToDelete')}
      />

      {/* Add Reading Modal */}
      <AddReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReading}
        isLoading={isUpdating}
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