
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

// Define languages and their properties
export type Language = 'en' | 'lt';
export const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'lt', name: 'Lietuvių' },
];

// Define translation strings
const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.cancel': 'Cancel',
    'common.save': 'Save Changes',
    'header.title': 'AI Blood Pressure Tracker',
    'header.welcome': 'Welcome, {{userName}}!',
    'header.settingsAriaLabel': 'Open settings',
    'upload.title': 'Add New Reading(s)',
    'upload.dropzone.click': 'Click to upload',
    'upload.dropzone.drag': 'or drag and drop',
    'upload.dropzone.formats': 'PNG, JPG, or WEBP',
    'upload.dropzone.selected': '{{count}} file(s) selected.',
    'upload.button.default': 'Upload Image(s)',
    'upload.button.camera': 'Use Camera',
    'upload.button.processing': 'Processing...',
    'upload.summary': 'Processed {{total}} image(s). {{success}} added. {{failed}} failed.',
    'upload.summary.errorDetails': 'Error Details:',
    'upload.summary.errorItem': '- {{count}} file(s): {{reason}}',
    'readings.title': 'Your Readings',
    'table.date': 'Date',
    'table.systolic': 'Systolic (SYS)',
    'table.diastolic': 'Diastolic (DIA)',
    'table.pulse': 'Pulse',
    'table.empty.filtered': 'No readings match the selected date range.',
    'table.empty.noData': 'No readings yet. Upload an image to get started!',
    'chart.title': 'Blood Pressure Trends',
    'chart.empty.noData': 'A trend chart will be displayed here once you have at least two readings.',
    'chart.empty.filtered': 'No readings match the selected date range.',
    'chart.empty.notEnough': 'Not enough data in the selected date range to display a trend. Select a wider range or add more readings.',
    'analysis.title': 'AI Analysis',
    'analysis.regenerateAriaLabel': 'Regenerate analysis',
    'analysis.empty.notEnough': 'Add at least two readings to generate a trend analysis.',
    'analysis.empty.noAnalysis': 'No analysis available. Click the refresh button to try again.',
    'analysis.keyMetrics': 'Key Metrics (Avg)',
    'analysis.systolic': 'Systolic',
    'analysis.diastolic': 'Diastolic',
    'analysis.pulse': 'Pulse',
    'analysis.overallTrend': 'Overall Trend',
    'analysis.comparison': 'Comparison',
    'analysis.observations': 'Observations',
    'insights.title': 'Health Insights',
    'insights.empty': 'Personalized health tips will appear here once an analysis is generated.',
    'filter.startDate': 'Start Date',
    'filter.endDate': 'End Date',
    'filter.startDateAriaLabel': 'Filter start date',
    'filter.endDateAriaLabel': 'Filter end date',
    'filter.reset': 'Reset',
    'reports.title': 'Advanced Reports',
    'reports.summaryTitle': 'Summary For Period',
    'reports.stat.avg': 'Avg Reading',
    'reports.stat.high': 'Highest Reading',
    'reports.stat.total': 'Total Readings',
    'reports.timeOfDayTitle': 'Average by Time of Day',
    'reports.time.morning': 'Morning',
    'reports.time.afternoon': 'Afternoon',
    'reports.time.evening': 'Evening',
    'reports.time.night': 'Night',
    'reports.consistencyTitle': 'Logging Consistency',
    'reports.consistencyDesc': 'Percentage of days you logged a reading in the selected period.',
    'export.button': 'Export PDF',
    'export.mainTitle': 'Blood Pressure Report',
    'export.period': 'Report Period',
    'export.periodStart': 'Beginning',
    'export.periodEnd': 'Now',
    'export.periodTo': 'to',
    'export.analysisTitle': 'AI Analysis Summary',
    'export.overallTrend': 'Overall Trend',
    'export.keyMetrics': 'Key Metrics (Average)',
    'export.systolic': 'Systolic',
    'export.diastolic': 'Diastolic',
    'export.pulse': 'Pulse',
    'export.observations': 'Observations',
    'export.insightsTitle': 'Health Insights',
    'export.readingsTitle': 'Detailed Readings',
    'export.modal.title': 'Export Options',
    'export.modal.includeAnalysis': 'Include AI Analysis',
    'export.modal.includeInsights': 'Include Health Insights',
    'export.modal.notAvailable': 'Not available for current selection',
    'settings.title': 'Settings',
    'settings.closeAriaLabel': 'Close settings',
    'settings.profile.title': 'Profile',
    'settings.profile.name': 'Your Name',
    'settings.profile.dob': 'Date of Birth',
    'settings.appearance.title': 'Appearance',
    'settings.appearance.theme': 'Theme',
    'settings.appearance.theme.light': 'Light',
    'settings.appearance.theme.dark': 'Dark',
    'settings.appearance.language': 'Language',
    'settings.goals.title': 'Health Goals',
    'settings.goals.systolic': 'Target Systolic (SYS)',
    'settings.goals.diastolic': 'Target Diastolic (DIA)',
    'settings.data.title': 'Data Management',
    'settings.data.clearButton': 'Clear All Readings',
    'settings.data.clearDescription': 'Permanently deletes all your saved blood pressure readings.',
    'settings.data.clearConfirm': 'Are you sure you want to delete all your readings? This action cannot be undone.',
    'error.title': 'Error',
    'error.closeAriaLabel': 'Close error message',
    'errors.network': 'Network error: Could not connect to the AI service. Please check your internet connection and try again.',
    'errors.modelGenericFail': 'Failed to perform action with the AI model.',
    'errors.modelEmptyResponse': 'AI model returned an empty response.',
    'errors.modelInvalidFormat': 'AI model returned an invalid data format.',
    'errors.modelMissingValues': 'AI could not find required values (SYS, DIA, Pulse).',
    'errors.analysis.emptyResponse': 'AI model returned an empty response for analysis.',
    'errors.analysis.invalidFormat': 'AI model returned an invalid analysis format.',
    'errors.insights.invalidFormat': 'AI model returned an invalid insights format.',
    'errors.unexpectedProcessing': 'An unexpected error occurred during image processing.',
    'errors.unknownExtraction': 'An unknown error occurred during extraction.',
    'errors.unknown': 'An unknown error occurred.',
    'errors.analysisFailed': 'Failed to generate AI analysis: {{message}}',
    'errors.analysisObservationsFailed': 'Could not generate observations due to an error.',
    'errors.analysisEncouragement': 'Please try again. If the problem persists, check your connection.',
    'camera.modal.title': 'Capture Reading',
    'camera.capture_button': 'Take Picture',
    'camera.confirm_button': 'Use Picture',
    'camera.retake_button': 'Retake',
    'camera.close_aria': 'Close camera',
    'camera.error.title': 'Camera Error',
    'camera.error.no_devices': 'No camera devices found.',
    'camera.error.permission_denied': 'Camera access was denied. Please allow camera access in your browser settings to use this feature.',
    'camera.error.generic': 'An unexpected error occurred while accessing the camera.',
    'enum.stable': 'Stable',
    'enum.increasing': 'Increasing',
    'enum.decreasing': 'Decreasing',
    'enum.fluctuating': 'Fluctuating',
    'enum.diet': 'Diet',
    'enum.exercise': 'Exercise',
    'enum.stress_management': 'Stress Management',
    'enum.general': 'General',
  },
  lt: {
    'common.cancel': 'Atšaukti',
    'common.save': 'Išsaugoti pakeitimus',
    'header.title': 'DI Kraujo Spaudimo Matuoklis',
    'header.welcome': 'Sveiki, {{userName}}!',
    'header.settingsAriaLabel': 'Atidaryti nustatymus',
    'upload.title': 'Pridėti naują įrašą(-us)',
    'upload.dropzone.click': 'Spustelėkite įkelti',
    'upload.dropzone.drag': 'arba nutempkite',
    'upload.dropzone.formats': 'PNG, JPG, arba WEBP',
    'upload.dropzone.selected': 'Pasirinkta failų: {{count}}',
    'upload.button.default': 'Įkelti nuotrauką(-as)',
    'upload.button.camera': 'Naudoti kamerą',
    'upload.button.processing': 'Apdorojama...',
    'upload.summary': 'Apdorota nuotraukų: {{total}}. Pridėta: {{success}}. Nepavyko: {{failed}}.',
    'upload.summary.errorDetails': 'Klaidų detalės:',
    'upload.summary.errorItem': '- {{count}} fail.: {{reason}}',
    'readings.title': 'Jūsų įrašai',
    'table.date': 'Data',
    'table.systolic': 'Sistolinis (SYS)',
    'table.diastolic': 'Diastolinis (DIA)',
    'table.pulse': 'Pulsas',
    'table.empty.filtered': 'Nėra įrašų pasirinktame datų intervale.',
    'table.empty.noData': 'Kol kas nėra įrašų. Įkelkite nuotrauką, kad pradėtumėte!',
    'chart.title': 'Kraujo spaudimo tendencijos',
    'chart.empty.noData': 'Tendencijų diagrama bus rodoma čia, kai turėsite bent du įrašus.',
    'chart.empty.filtered': 'Nėra įrašų pasirinktame datų intervale.',
    'chart.empty.notEnough': 'Nepakanka duomenų pasirinktame datų intervale tendencijai parodyti. Pasirinkite platesnį intervalą arba pridėkite daugiau įrašų.',
    'analysis.title': 'DI Analizė',
    'analysis.regenerateAriaLabel': 'Atnaujinti analizę',
    'analysis.empty.notEnough': 'Pridėkite bent du įrašus, kad sugeneruotumėte tendencijų analizę.',
    'analysis.empty.noAnalysis': 'Analizė negalima. Spustelėkite atnaujinimo mygtuką, kad bandytumėte dar kartą.',
    'analysis.keyMetrics': 'Pagrindiniai rodikliai (vid.)',
    'analysis.systolic': 'Sistolinis',
    'analysis.diastolic': 'Diastolinis',
    'analysis.pulse': 'Pulsas',
    'analysis.overallTrend': 'Bendra tendencija',
    'analysis.comparison': 'Palyginimas',
    'analysis.observations': 'Pastebėjimai',
    'insights.title': 'Sveikatos įžvalgos',
    'insights.empty': 'Asmeniniai sveikatos patarimai atsiras čia, kai bus sugeneruota analizė.',
    'filter.startDate': 'Pradžios data',
    'filter.endDate': 'Pabaigos data',
    'filter.startDateAriaLabel': 'Filtruoti pradžios datą',
    'filter.endDateAriaLabel': 'Filtruoti pabaigos datą',
    'filter.reset': 'Atstatyti',
    'reports.title': 'Išplėstinės ataskaitos',
    'reports.summaryTitle': 'Laikotarpio suvestinė',
    'reports.stat.avg': 'Vid. rodmuo',
    'reports.stat.high': 'Aukščiausias rodmuo',
    'reports.stat.total': 'Iš viso įrašų',
    'reports.timeOfDayTitle': 'Vidurkis pagal paros laiką',
    'reports.time.morning': 'Rytas',
    'reports.time.afternoon': 'Popietė',
    'reports.time.evening': 'Vakaras',
    'reports.time.night': 'Naktis',
    'reports.consistencyTitle': 'Registravimo nuoseklumas',
    'reports.consistencyDesc': 'Procentas dienų, kuriomis registravote rodmenis pasirinktame laikotarpyje.',
    'export.button': 'Eksportuoti PDF',
    'export.mainTitle': 'Kraujo Spaudimo Ataskaita',
    'export.period': 'Ataskaitos laikotarpis',
    'export.periodStart': 'Pradžia',
    'export.periodEnd': 'Dabar',
    'export.periodTo': 'iki',
    'export.analysisTitle': 'DI Analizės Santrauka',
    'export.overallTrend': 'Bendra Tendencija',
    'export.keyMetrics': 'Pagrindiniai Rodikliai (Vidurkis)',
    'export.systolic': 'Sistolinis',
    'export.diastolic': 'Diastolinis',
    'export.pulse': 'Pulsas',
    'export.observations': 'Pastebėjimai',
    'export.insightsTitle': 'Sveikatos Įžvalgos',
    'export.readingsTitle': 'Detalus Įrašai',
    'export.modal.title': 'Eksportavimo parinktys',
    'export.modal.includeAnalysis': 'Įtraukti DI analizę',
    'export.modal.includeInsights': 'Įtraukti sveikatos įžvalgas',
    'export.modal.notAvailable': 'Negalima dabartiniam pasirinkimui',
    'settings.title': 'Nustatymai',
    'settings.closeAriaLabel': 'Uždaryti nustatymus',
    'settings.profile.title': 'Profilis',
    'settings.profile.name': 'Jūsų vardas',
    'settings.profile.dob': 'Gimimo data',
    'settings.appearance.title': 'Išvaizda',
    'settings.appearance.theme': 'Tema',
    'settings.appearance.theme.light': 'Šviesi',
    'settings.appearance.theme.dark': 'Tamsi',
    'settings.appearance.language': 'Kalba',
    'settings.goals.title': 'Sveikatos tikslai',
    'settings.goals.systolic': 'Sistolinis tikslas (SYS)',
    'settings.goals.diastolic': 'Diastolinis tikslas (DIA)',
    'settings.data.title': 'Duomenų valdymas',
    'settings.data.clearButton': 'Išvalyti visus įrašus',
    'settings.data.clearDescription': 'Visam laikui ištrina visus jūsų išsaugotus kraujo spaudimo įrašus.',
    'settings.data.clearConfirm': 'Ar tikrai norite ištrinti visus savo įrašus? Šio veiksmo negalima anuliuoti.',
    'error.title': 'Klaida',
    'error.closeAriaLabel': 'Uždaryti klaidos pranešimą',
    'errors.network': 'Tinklo klaida: Nepavyko prisijungti prie DI paslaugos. Patikrinkite interneto ryšį ir bandykite dar kartą.',
    'errors.modelGenericFail': 'Nepavyko atlikti veiksmo su DI modeliu.',
    'errors.modelEmptyResponse': 'DI modelis grąžino tuščią atsakymą.',
    'errors.modelInvalidFormat': 'DI modelis grąžino neteisingą duomenų formatą.',
    'errors.modelMissingValues': 'DI negalėjo rasti būtinų verčių (SYS, DIA, Pulsas).',
    'errors.analysis.emptyResponse': 'DI modelis grąžino tuščią atsakymą analizei.',
    'errors.analysis.invalidFormat': 'DI modelis grąžino neteisingą analizės formatą.',
    'errors.insights.invalidFormat': 'DI modelis grąžino neteisingą įžvalgų formatą.',
    'errors.unexpectedProcessing': 'Apdorojant nuotrauką įvyko netikėta klaida.',
    'errors.unknownExtraction': 'Išgaunant duomenis įvyko nežinoma klaida.',
    'errors.unknown': 'Įvyko nežinoma klaida.',
    'errors.analysisFailed': 'Nepavyko sugeneruoti DI analizės: {{message}}',
    'errors.analysisObservationsFailed': 'Nepavyko sugeneruoti pastebėjimų dėl klaidos.',
    'errors.analysisEncouragement': 'Bandykite dar kartą. Jei problema kartojasi, patikrinkite ryšį.',
    'camera.modal.title': 'Nufotografuoti rodmenį',
    'camera.capture_button': 'Fotografuoti',
    'camera.confirm_button': 'Naudoti nuotrauką',
    'camera.retake_button': 'Fotografuoti iš naujo',
    'camera.close_aria': 'Uždaryti kamerą',
    'camera.error.title': 'Kameros klaida',
    'camera.error.no_devices': 'Nerasta kameros įrenginių.',
    'camera.error.permission_denied': 'Prieiga prie kameros uždrausta. Norėdami naudotis šia funkcija, leiskite prieigą prie kameros naršyklės nustatymuose.',
    'camera.error.generic': 'Bandant pasiekti kamerą įvyko netikėta klaida.',
    'enum.stable': 'Stabili',
    'enum.increasing': 'Didėjanti',
    'enum.decreasing': 'Mažėjanti',
    'enum.fluctuating': 'Svyruojanti',
    'enum.diet': 'Mityba',
    'enum.exercise': 'Pratimai',
    'enum.stress_management': 'Streso valdymas',
    'enum.general': 'Bendra',
  }
};

// Helper to get the initial language
const getInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('app-lang') as Language;
    if (savedLang && languages.some(l => l.code === savedLang)) {
        return savedLang;
    }
    const browserLang = navigator.language.split('-')[0] as Language;
    return languages.some(l => l.code === browserLang) ? browserLang : 'en';
};

// Create the context
interface LocalizationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    translateEnum: (value: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Create the provider component
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        localStorage.setItem('app-lang', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        if (languages.some(l => l.code === lang)) {
            setLanguageState(lang);
        }
    };

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        let translation = translations[language][key] || translations['en'][key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{{${placeholder}}}`, String(replacements[placeholder]));
            });
        }
        return translation;
    }, [language]);

    // Special translator for AI-returned enums
    const translateEnum = useCallback((value: string): string => {
        const key = `enum.${value.toLowerCase().replace(/ /g, '_')}`;
        return t(key, {});
    }, [t]);

    const value = useMemo(() => ({ language, setLanguage, t, translateEnum }), [language, t, translateEnum]);

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};

// Custom hook for easy access
export const useLocalization = (): LocalizationContextType => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};