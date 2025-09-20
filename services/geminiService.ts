
import { GoogleGenAI, Type } from "@google/genai";
import type { BloodPressureReading, AnalysisData, HealthInsight, AppSettings } from '../types';
import type { Language } from "../context/LocalizationContext";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.warn("Gemini API key is not configured. Image analysis features will be disabled.");
}

const ai = apiKey && apiKey !== 'PLACEHOLDER_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

const languageMap: Record<Language, string> = {
    en: 'English',
    lt: 'Lithuanian',
};

const extractResponseSchema = {
    type: Type.OBJECT,
    properties: {
        systolic: { type: Type.INTEGER },
        diastolic: { type: Type.INTEGER },
        pulse: { type: Type.INTEGER },
        date: {
            type: Type.STRING,
            description: "The date and time of the reading from the image, formatted as a local ISO 8601 string without a timezone offset (e.g., 'YYYY-MM-DDTHH:mm:ss'). This should be the exact time displayed on the monitor, without any timezone conversion. If the date/time is not visible or readable, return null for this field.",
            nullable: true,
        },
    },
    required: ["systolic", "diastolic", "pulse"],
};

const trendComparisonSchema = {
    type: Type.OBJECT,
    properties: {
        change: { type: Type.NUMBER, description: "The numerical change from the previous period (e.g., 5 for an increase of 5, -3 for a decrease)." },
        direction: { type: Type.STRING, enum: ['up', 'down', 'same'] },
        summary: { type: Type.STRING, description: "A brief summary of the change." },
    },
    required: ["change", "direction", "summary"],
};

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        keyMetrics: {
            type: Type.OBJECT,
            properties: {
                avgSystolic: { type: Type.NUMBER },
                avgDiastolic: { type: Type.NUMBER },
                avgPulse: { type: Type.NUMBER },
            },
            required: ["avgSystolic", "avgDiastolic", "avgPulse"],
        },
        overallTrend: {
            type: Type.OBJECT,
            properties: {
                trend: { type: Type.STRING, enum: ['Stable', 'Increasing', 'Decreasing', 'Fluctuating'] },
                summary: { type: Type.STRING },
            },
            required: ["trend", "summary"],
        },
        historicalComparison: {
            nullable: true,
            type: Type.OBJECT,
            properties: {
                systolic: trendComparisonSchema,
                diastolic: trendComparisonSchema,
                pulse: trendComparisonSchema,
                period: { type: Type.STRING, description: "The period being compared, e.g., 'vs. previous 7 readings'." },
            },
            required: ["systolic", "diastolic", "pulse", "period"],
        },
        observations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['High Systolic', 'Low Systolic', 'High Diastolic', 'Low Diastolic', 'Pulse Rate', 'General', 'Goal Achievement'] },
                    message: { type: Type.STRING },
                },
                required: ["type", "message"],
            }
        },
        encouragement: { type: Type.STRING },
    },
    required: ["keyMetrics", "overallTrend", "historicalComparison", "observations", "encouragement"],
};


const insightResponseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                enum: ['Diet', 'Exercise', 'Stress Management', 'General']
            },
            tip: {
                type: Type.STRING,
                description: "A single, actionable health tip."
            }
        },
        required: ["category", "tip"]
    }
};

const handleAiError = (error: unknown, action: string): never => {
    console.error(`Error during AI call to ${action}:`, error);
    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
         throw new Error('errors.network');
    }
    if (error instanceof Error && error.message.startsWith("errors.")) {
        throw error;
    }
    throw new Error('errors.modelGenericFail');
};


export async function extractDataFromImage(base64Image: string, mimeType: string): Promise<{ systolic: number; diastolic: number; pulse: number; date?: string; }> {
    if (!ai) {
        throw new Error('Gemini API is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: `You are an expert OCR model specializing in reading digital displays. Your task is to analyze the provided image of a blood pressure monitor and extract key readings.

Focus on identifying these three values:
1.  **Systolic (SYS)**: The upper number.
2.  **Diastolic (DIA)**: The lower number.
3.  **Pulse**: Often labeled as PUL, PUL/min, or with a heart symbol.

Additionally, carefully scan the image for a **date and time**. If visible, extract it precisely as shown.

Return a JSON object with the following structure:
- \`systolic\`: The integer value for systolic pressure.
- \`diastolic\`: The integer value for diastolic pressure.
- \`pulse\`: The integer value for the pulse rate.
- \`date\`: The date and time from the monitor, formatted as a local ISO 8601 string (e.g., 'YYYY-MM-DDTHH:mm:ss'). Do NOT add a timezone offset or 'Z'. If the date and time are not visible, return null for this field.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: extractResponseSchema,
            },
        });
        
        const jsonString = response.text.trim();
        if (!jsonString) {
            throw new Error("errors.modelEmptyResponse");
        }

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (jsonError) {
            console.error("Failed to parse JSON from AI response:", jsonString);
            throw new Error("errors.modelInvalidFormat");
        }
        
        if (typeof data.systolic !== 'number' || typeof data.diastolic !== 'number' || typeof data.pulse !== 'number') {
            throw new Error("errors.modelMissingValues");
        }
        
        return {
            systolic: data.systolic,
            diastolic: data.diastolic,
            pulse: data.pulse,
            date: data.date || undefined,
        };
    } catch (error) {
        handleAiError(error, "extract data from image");
    }
}


export async function analyzeReadings(readings: BloodPressureReading[], goals: AppSettings['goals'] | undefined, language: Language): Promise<AnalysisData> {
    if (!ai) {
        throw new Error('Gemini API is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    try {
        const languageName = languageMap[language] || 'English';
        const prompt = `
            You are a helpful health assistant. Please analyze the following blood pressure readings and return a structured JSON object.
            The data is provided as a JSON array, sorted from most recent to oldest.
            
            **Important: All textual responses (summaries, observations, encouragement, and the comparison period description) MUST be in ${languageName}.**

            Data: ${JSON.stringify(readings)}
            
            ${goals ? `The user has set the following health goals: Systolic below ${goals.systolic}, Diastolic below ${goals.diastolic}. Please include an observation of type 'Goal Achievement' that comments on how their average readings compare to these goals.` : ''}

            Based on the data, provide a structured analysis. Adhere strictly to the provided JSON schema.
            - In keyMetrics, calculate the average for all readings. Round to the nearest whole number.
            - In overallTrend, determine if the general trend is Stable, Increasing, Decreasing, or Fluctuating. Provide a short summary in ${languageName}.
            - In historicalComparison, compare the most recent readings to the previous ones. 
              - If there are at least 4 readings, split the data into two halves: the most recent half and the oldest half. 
              - Calculate the average for systolic, diastolic, and pulse for each half. 
              - Compare the 'recent' average to the 'old' average to determine the change, direction ('up', 'down', 'same'), and a brief summary for each metric in ${languageName}. 
              - The 'period' should also be in ${languageName} (e.g., for English 'vs. previous ${Math.floor(readings.length / 2)} readings', for Lithuanian 'prieš ankstesnius ${Math.floor(readings.length / 2)} rodmenis').
              - If there are fewer than 4 readings, return null for the entire historicalComparison object.
            - In observations, create a list of notable points in ${languageName}. Include any high readings (Systolic > 130, Diastolic > 85), low readings, or significant changes.
            - In encouragement, provide a brief, positive, and encouraging closing remark in ${languageName}.
            - Do not provide medical advice, but frame observations in a helpful, informational way.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisResponseSchema,
            }
        });
        
        const jsonString = response.text.trim();
        if (!jsonString) {
            throw new Error("errors.analysis.emptyResponse");
        }

        try {
            return JSON.parse(jsonString) as AnalysisData;
        } catch (jsonError) {
            console.error("Failed to parse JSON from AI analysis response:", jsonString);
            throw new Error("errors.analysis.invalidFormat");
        }

    } catch (error) {
        handleAiError(error, "analyze readings");
    }
}


export async function getHealthInsights(observations: AnalysisData['observations'], trend: AnalysisData['overallTrend'], language: Language): Promise<HealthInsight[]> {
    if (!ai) {
        throw new Error('Gemini API is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    try {
        const languageName = languageMap[language] || 'English';
        const prompt = `
            You are a health and wellness coach. Based on the following blood pressure analysis, provide a short list of 2-4 actionable, personalized tips.
            
            **Important Instructions:**
            1.  The 'category' value in the JSON response MUST be one of the following English strings: 'Diet', 'Exercise', 'Stress Management', 'General'.
            2.  The 'tip' value in the JSON response MUST be written in **${languageName}**.

            - Do NOT provide medical advice. Focus on general wellness, diet, exercise, and stress management.
            - Frame the tips in a positive and encouraging way.
            - Keep each tip concise and easy to understand.
            - Base your suggestions directly on the provided observations and trend. For example, if 'High Systolic' is an observation, suggest reducing sodium. If the trend is 'Fluctuating', suggest consistent monitoring.

            Analysis Data:
            - Trend: ${trend.trend} (${trend.summary})
            - Observations: ${JSON.stringify(observations.map(o => o.message))}

            Return a JSON array of objects, where each object has a 'category' and a 'tip'. Adhere strictly to the provided JSON schema and the language instructions above.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: insightResponseSchema,
            }
        });
        
        const jsonString = response.text.trim();
        if (!jsonString) {
            return [];
        }
        
        try {
            return JSON.parse(jsonString) as HealthInsight[];
        } catch (jsonError) {
            console.error("Failed to parse JSON from AI health insights response:", jsonString);
            throw new Error("errors.insights.invalidFormat");
        }
    } catch (error) {
        handleAiError(error, "generate health insights");
    }
}
