import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { BloodPressureReading } from '../types';
import { classifyBloodPressure } from '../utils/bpClassification';

// Helper function to safely encode text for PDF
const encodeText = (text: string): string => {
  if (!text) return '';
  
  // Replace problematic Unicode characters with safe alternatives
  return text
    .replace(/[^\x00-\x7F]/g, (char) => {
      const charCode = char.charCodeAt(0);
      
      // Handle common Unicode characters
      switch (charCode) {
        case 0x00B0: return '°'; // Degree symbol
        case 0x2013: return '-'; // En dash
        case 0x2014: return '--'; // Em dash
        case 0x2018: return "'"; // Left single quotation mark
        case 0x2019: return "'"; // Right single quotation mark
        case 0x201C: return '"'; // Left double quotation mark
        case 0x201D: return '"'; // Right double quotation mark
        case 0x2026: return '...'; // Horizontal ellipsis
        case 0x00E9: return 'e'; // é
        case 0x00E8: return 'e'; // è
        case 0x00E0: return 'a'; // à
        case 0x00E7: return 'c'; // ç
        case 0x00F1: return 'n'; // ñ
        case 0x00FC: return 'u'; // ü
        case 0x00F6: return 'o'; // ö
        case 0x00E4: return 'a'; // ä
        case 0x00DF: return 'ss'; // ß
        case 0x00C9: return 'E'; // É
        case 0x00C8: return 'E'; // È
        case 0x00C0: return 'A'; // À
        case 0x00C7: return 'C'; // Ç
        case 0x00D1: return 'N'; // Ñ
        case 0x00DC: return 'U'; // Ü
        case 0x00D6: return 'O'; // Ö
        case 0x00C4: return 'A'; // Ä
        case 0x03BC: return 'mu'; // μ (mu)
        case 0x03B1: return 'alpha'; // α
        case 0x03B2: return 'beta'; // β
        case 0x03B3: return 'gamma'; // γ
        case 0x03B4: return 'delta'; // δ
        case 0x03B5: return 'epsilon'; // ε
        case 0x03B6: return 'zeta'; // ζ
        case 0x03B7: return 'eta'; // η
        case 0x03B8: return 'theta'; // θ
        case 0x03B9: return 'iota'; // ι
        case 0x03BA: return 'kappa'; // κ
        case 0x03BB: return 'lambda'; // λ
        case 0x03BC: return 'mu'; // μ
        case 0x03BD: return 'nu'; // ν
        case 0x03BE: return 'xi'; // ξ
        case 0x03BF: return 'omicron'; // ο
        case 0x03C0: return 'pi'; // π
        case 0x03C1: return 'rho'; // ρ
        case 0x03C3: return 'sigma'; // σ
        case 0x03C4: return 'tau'; // τ
        case 0x03C5: return 'upsilon'; // υ
        case 0x03C6: return 'phi'; // φ
        case 0x03C7: return 'chi'; // χ
        case 0x03C8: return 'psi'; // ψ
        case 0x03C9: return 'omega'; // ω
        default: 
          // For other Unicode characters, try to convert to closest ASCII equivalent
          return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
    })
    .replace(/[^\x00-\x7F]/g, '?'); // Replace any remaining non-ASCII with ?
};

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFReportOptions {
  readings: BloodPressureReading[];
  patientName?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  targets?: {
    systolic: number;
    diastolic: number;
  };
  includeCharts?: boolean;
}

export class PDFReportService {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private contentWidth: number = 170; // A4 width - margins

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.setupDocument();
  }

  private setupDocument() {
    // Set up the document with professional styling
    this.doc.setProperties({
      title: 'Blood Pressure Report',
      subject: 'Medical Report',
      author: 'Blood Pressure Tracker',
      creator: 'Blood Pressure Tracker App'
    });

    // Set default font
    this.doc.setFont('helvetica');
  }

  public async generateReport(options: PDFReportOptions): Promise<Blob> {
    const { readings, patientName, dateRange, targets, includeCharts = true } = options;

    // Reset position
    this.currentY = this.margin;

    // Add header
    await this.addHeader(patientName);

    // Add summary section
    this.addSummary(readings, targets);

    // Add charts if requested
    if (includeCharts) {
      await this.addCharts(readings);
    }

    // Add detailed readings table
    this.addReadingsTable(readings);

    // Add insights and recommendations
    this.addInsights(readings);

    // Add footer
    this.addFooter();

    return this.doc.output('blob');
  }

  private async addHeader(patientName?: string) {
    // Add gradient background effect (simulated with rectangles)
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(0, 0, 210, 40, 'F');

    // Add white text on blue background
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(encodeText('Blood Pressure Report'), this.margin, 25);

    // Add patient name if provided
    if (patientName) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(encodeText(`Patient: ${patientName}`), this.margin, 35);
    }

    // Add report date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(encodeText(`Generated: ${currentDate}`), 140, 35);

    // Reset text color
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 50;
  }

  private addSummary(readings: BloodPressureReading[], targets?: { systolic: number; diastolic: number }) {
    if (readings.length === 0) return;

    // Calculate statistics
    const avgSystolic = readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
    const avgDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;
    const avgPulse = readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length;

    const minSystolic = Math.min(...readings.map(r => r.systolic));
    const maxSystolic = Math.max(...readings.map(r => r.systolic));
    const minDiastolic = Math.min(...readings.map(r => r.diastolic));
    const maxDiastolic = Math.max(...readings.map(r => r.diastolic));

    // Add section title
    this.addSectionTitle('Summary Statistics');

    // Create summary table
    const summaryData = [
      ['Metric', 'Average', 'Min', 'Max', 'Target'],
      [
        'Systolic BP',
        `${Math.round(avgSystolic)} mmHg`,
        `${minSystolic} mmHg`,
        `${maxSystolic} mmHg`,
        targets ? `${targets.systolic} mmHg` : 'N/A'
      ],
      [
        'Diastolic BP',
        `${Math.round(avgDiastolic)} mmHg`,
        `${minDiastolic} mmHg`,
        `${maxDiastolic} mmHg`,
        targets ? `${targets.diastolic} mmHg` : 'N/A'
      ],
      [
        'Pulse Rate',
        `${Math.round(avgPulse)} BPM`,
        `${Math.min(...readings.map(r => r.pulse))} BPM`,
        `${Math.max(...readings.map(r => r.pulse))} BPM`,
        '60-100 BPM'
      ]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      styles: {
        fontSize: 10,
        cellPadding: 6
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Add classification summary
    this.addClassificationSummary(readings);
  }

  private addClassificationSummary(readings: BloodPressureReading[]) {
    // Count classifications
    const classifications: { [key: string]: number } = {};
    readings.forEach(reading => {
      const classification = classifyBloodPressure(reading.systolic, reading.diastolic);
      classifications[classification.categoryShort] = (classifications[classification.categoryShort] || 0) + 1;
    });

    // Add section title
    this.addSectionTitle('ESH Classification Summary');

    // Create classification table
    const classificationData = Object.entries(classifications).map(([category, count]) => [
      encodeText(category),
      count.toString(),
      `${Math.round((count / readings.length) * 100)}%`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Classification', 'Count', 'Percentage']],
      body: classificationData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94], // Green-500
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      styles: {
        fontSize: 10,
        cellPadding: 6
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private async addCharts(readings: BloodPressureReading[]) {
    // Add section title
    this.addSectionTitle('Blood Pressure Trends');

    // Create a simple text-based chart representation
    const recentReadings = readings.slice(-10); // Last 10 readings
    
    // Add trend analysis
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(encodeText('Recent Trend Analysis:'), this.margin, this.currentY);
    this.currentY += 8;

    // Create trend visualization
    recentReadings.forEach((reading, index) => {
      const date = new Date(reading.date).toLocaleDateString();
      const classification = classifyBloodPressure(reading.systolic, reading.diastolic);
      
      // Color coding based on classification
      let color = [34, 197, 94]; // Green for normal
      if (classification.categoryShort.includes('Grade')) {
        color = [239, 68, 68]; // Red for hypertension
      } else if (classification.categoryShort === 'High-Normal') {
        color = [245, 158, 11]; // Amber for high-normal
      }

      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.circle(this.margin + 5, this.currentY + 2, 2, 'F');
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.text(encodeText(`${date}: ${reading.systolic}/${reading.diastolic} (${classification.categoryShort})`), 
                   this.margin + 10, this.currentY + 3);
      
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addReadingsTable(readings: BloodPressureReading[]) {
    // Add section title
    this.addSectionTitle('Detailed Readings');

    // Prepare table data
    const tableData = readings.map(reading => {
      const date = new Date(reading.date);
      const classification = classifyBloodPressure(reading.systolic, reading.diastolic);
      
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        `${reading.systolic}/${reading.diastolic}`,
        `${reading.pulse}`,
        encodeText(classification.categoryShort),
        encodeText(reading.notes || '-')
      ];
    }).reverse(); // Most recent first

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Date', 'Time', 'Blood Pressure', 'Pulse', 'Classification', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [75, 85, 99], // Gray-600
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'left' }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addInsights(readings: BloodPressureReading[]) {
    if (readings.length === 0) return;

    // Add section title
    this.addSectionTitle('Insights & Recommendations');

    // Calculate insights
    const avgSystolic = readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
    const avgDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;
    
    // Generate insights based on data
    const insights: string[] = [];
    
    if (avgSystolic > 140 || avgDiastolic > 90) {
      insights.push('Your average blood pressure indicates hypertension. Consult with your healthcare provider.');
    } else if (avgSystolic > 130 || avgDiastolic > 85) {
      insights.push('Your blood pressure is in the high-normal range. Consider lifestyle modifications.');
    } else {
      insights.push('Your blood pressure is within normal ranges. Keep up the good work!');
    }

    // Add trend analysis
    if (readings.length >= 3) {
      const recent = readings.slice(-3);
      const older = readings.slice(-6, -3);
      
      if (recent.length >= 3 && older.length >= 3) {
        const recentAvg = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + r.systolic, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) {
          insights.push('Recent readings show an upward trend. Monitor closely and consider lifestyle changes.');
        } else if (recentAvg < olderAvg - 5) {
          insights.push('Recent readings show improvement. Continue your current approach.');
        }
      }
    }

    // Add general recommendations
    insights.push('General recommendations: Maintain regular exercise, reduce sodium intake, manage stress, and get adequate sleep.');

    // Display insights
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    insights.forEach(insight => {
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      this.doc.text(encodeText(insight), this.margin, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addSectionTitle(title: string) {
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(75, 85, 99); // Gray-600
    this.doc.text(encodeText(title), this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setTextColor(0, 0, 0);
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add footer line
      this.doc.setDrawColor(209, 213, 219); // Gray-300
      this.doc.line(this.margin, this.pageHeight - 15, this.contentWidth + this.margin, this.pageHeight - 15);
      
      // Add page number
      this.doc.setFontSize(10);
      this.doc.setTextColor(107, 114, 128); // Gray-500
      this.doc.text(`Page ${i} of ${pageCount}`, this.contentWidth + this.margin - 20, this.pageHeight - 10);
      
      // Add generated timestamp
      this.doc.text(encodeText('Generated by Blood Pressure Tracker'), this.margin, this.pageHeight - 10);
    }
  }
}

// Utility function to generate PDF report
export async function generateBloodPressurePDF(options: PDFReportOptions): Promise<Blob> {
  const service = new PDFReportService();
  return await service.generateReport(options);
}
