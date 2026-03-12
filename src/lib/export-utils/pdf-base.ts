import jsPDF from "jspdf";
import { COLORS } from "./constants";

export function createBasePDF(title: string, subtitle?: string): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(COLORS.dark);
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.gray);
    doc.text(subtitle, pageWidth / 2, 28, { align: "center" });
  }

  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, 35, pageWidth - margin, 35);

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

  const colWidths = columnWidths || headers.map(() => usableWidth / headers.length);
  
  let currentY = startY;
  const rowHeight = 9;
  const headerHeight = 10;

  doc.setFillColor(COLORS.cardBg);
  doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "F");

  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, currentY, usableWidth, headerHeight, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.dark);

  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(header, xPos + 2, currentY + 6.5);
    xPos += colWidths[i];
  });

  currentY += headerHeight;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  data.forEach((row, rowIndex) => {

    if (currentY > 265) {
      doc.addPage();
      currentY = 20;

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

    if (rowIndex % 2 === 0) {
      doc.setFillColor(255, 255, 255); 
    } else {
      doc.setFillColor(252, 252, 253); 
    }
    doc.rect(margin, currentY, usableWidth, rowHeight, "F");

    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    xPos = margin;
    keys.forEach((key, i) => {
      const value = row[key];
      const format = formats[i];

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
