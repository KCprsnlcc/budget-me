import jsPDF from "jspdf";
import { COLORS } from "./constants";

/**
 * Create a minimal Supabase-styled PDF document (matching email template)
 */
export function createBasePDF(title: string, subtitle?: string): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page margins
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Clean white background (no header background)
  
  // Title section - centered and minimal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(COLORS.dark);
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  // Subtitle
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.gray);
    doc.text(subtitle, pageWidth / 2, 28, { align: "center" });
  }

  // Subtle divider line
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, 35, pageWidth - margin, 35);

  // Generated timestamp - bottom right, subtle
  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMuted);
  doc.text(`Generated: ${timestamp}`, pageWidth - margin, 32, { align: "right" });

  return doc;
}

/**
 * Add table to PDF with Supabase minimal styling (matching email template)
 */
export function addPDFTable<T extends Record<string, string | number | boolean | null | undefined>>(
  doc: jsPDF,
  headers: string[],
  data: T[],
  keys: (keyof T)[],
  formats: ("text" | "currency" | "number" | "percentage")[],
  startY: number,
  columnWidths?: number[]
): number {
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;

  // Use custom column widths or equal distribution
  const colWidths = columnWidths || headers.map(() => usableWidth / headers.length);
  
  let currentY = startY;
  const rowHeight = 9;
  const headerHeight = 10;

  // Header with subtle background
  doc.setFillColor(COLORS.cardBg);
  doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "F");

  // Header border
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "S");

  // Header text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.dark);

  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(header, xPos + 2, currentY + 6.5);
    xPos += colWidths[i];
  });

  currentY += headerHeight;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY > 265) {
      doc.addPage();
      currentY = 20;

      // Re-add header on new page
      doc.setFillColor(COLORS.cardBg);
      doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "F");
      doc.setDrawColor(COLORS.border);
      doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.dark);
      
      xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, currentY + 6.5);
        xPos += colWidths[i];
      });
      
      currentY += headerHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
    }

    // Subtle alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(255, 255, 255); // White
    } else {
      doc.setFillColor(252, 252, 253); // Very subtle grey
    }
    doc.rect(margin, currentY, usableWidth, rowHeight, "F");

    // Row border
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    // Row data
    xPos = margin;
    keys.forEach((key, i) => {
      const value = row[key];
      const format = formats[i];

      // Format value based on type
      let displayValue: string;
      if (value === null || value === undefined || value === "") {
        displayValue = "—";
        doc.setTextColor(COLORS.textMuted);
      } else if (format === "currency") {
        displayValue = `PHP ${Number(value).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        doc.setTextColor(COLORS.dark);
      } else if (format === "percentage") {
        displayValue = `${value}%`;
        doc.setTextColor(COLORS.gray);
      } else if (format === "number") {
        displayValue = Number(value).toLocaleString("en-PH");
        doc.setTextColor(COLORS.dark);
      } else {
        displayValue = String(value);
        doc.setTextColor(COLORS.gray);
      }

      // Truncate if too long
      const maxWidth = colWidths[i] - 4;
      const textWidth = doc.getTextWidth(displayValue);
      if (textWidth > maxWidth) {
        while (doc.getTextWidth(displayValue + "..") > maxWidth && displayValue.length > 0) {
          displayValue = displayValue.slice(0, -1);
        }
        displayValue += "..";
      }

      doc.text(displayValue, xPos + 2, currentY + 6);
      xPos += colWidths[i];
    });

    currentY += rowHeight;
  });

  return currentY + 5;
}
