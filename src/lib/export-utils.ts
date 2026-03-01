import jsPDF from "jspdf";
import Papa from "papaparse";

/**
 * Supabase minimal styling colors (matching email template)
 */
const COLORS = {
  primary: "#10b981",    // Email template green
  dark: "#1e293b",       // Dark text
  gray: "#64748b",       // Secondary text
  lightGray: "#f8fafc",  // Background
  white: "#ffffff",
  border: "#e2e8f0",
  red: "#ef4444",
  amber: "#f59e0b",
  emerald: "#10b981",
  blue: "#3b82f6",
  cardBg: "#f8fafc",     // Card background
  textMuted: "#94a3b8",  // Muted text
};

/**
 * Format currency in Philippine Peso
 */
export function formatCurrencyPHP(amount: number): string {
  return "PHP " + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date for display
 */
export function formatExportDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate timestamp string for filenames
 */
export function getTimestampString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Transaction export interfaces
 */
export interface TransactionExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  date: string;
  description: string | null;
  type: string;
  category: string;
  account: string;
  amount: number;
  notes: string | null;
}

/**
 * Goal export interfaces
 */
export interface GoalExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  name: string;
  target: number;
  current: number;
  remaining: number;
  progress: string;
  priority: string;
  status: string;
  category: string;
  deadline: string;
  monthlyContribution: number;
  isFamily: boolean;
}

/**
 * Budget export interfaces
 */
export interface BudgetExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  budget_name: string;
  category: string;
  period: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: string;
  status: string;
  health: string;
  start_date: string;
  end_date: string;
}

/**
 * Export data as CSV
 */
export function exportToCSV<T extends Record<string, string | number | boolean | null | undefined>>(
  data: T[],
  filename: string
): void {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const csv = Papa.unparse(data, {
    header: true,
    quotes: true,
    newline: "\n",
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Create a minimal Supabase-styled PDF document (matching email template)
 */
function createBasePDF(title: string, subtitle?: string): jsPDF {
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
function addPDFTable<T extends Record<string, string | number | boolean | null | undefined>>(
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
        displayValue = formatCurrencyPHP(Number(value));
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

/**
 * Export transactions as PDF
 */
export function exportTransactionsToPDF(
  transactions: TransactionExportData[],
  summary?: { totalIncome?: number; totalExpenses?: number; netBalance?: number }
): void {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const doc = createBasePDF("Transactions Report", `${transactions.length} transactions`);

  // Summary section with email-style cards
  let currentY = 45;
  const margin = 15;

  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Summary", margin, currentY);
    currentY += 8;

    // Summary cards with subtle borders
    const cardWidth = 58;
    const cardHeight = 20;
    const cardSpacing = 3;

    // Income card
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Income", margin + 4, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.emerald);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalIncome || 0), margin + 4, currentY + 14);

    // Expenses card
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Expenses", margin + cardWidth + cardSpacing + 4, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.red);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalExpenses || 0), margin + cardWidth + cardSpacing + 4, currentY + 14);

    // Net Balance card
    const netColor = (summary.netBalance || 0) >= 0 ? COLORS.emerald : COLORS.red;
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Net Balance", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(netColor);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.netBalance || 0), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

    currentY += cardHeight + 12;
  }

  // Transactions table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Transaction Details", margin, currentY);
  currentY += 10;

  const headers = ["Date", "Description", "Type", "Category", "Account", "Amount"];
  const keys: (keyof TransactionExportData)[] = ["date", "description", "type", "category", "account", "amount"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "currency"];
  
  // Custom column widths for better layout (in mm)
  const columnWidths = [22, 35, 22, 25, 28, 28]; // Total: 160mm

  addPDFTable(doc, headers, transactions, keys, formats, currentY, columnWidths);

  // Save
  const filename = `transactions_${getTimestampString()}.pdf`;
  doc.save(filename);
}

/**
 * Export goals as PDF
 */
export function exportGoalsToPDF(
  goals: GoalExportData[],
  summary?: { totalGoals?: number; totalSaved?: number; totalTarget?: number; completedGoals?: number }
): void {
  if (goals.length === 0) {
    alert("No goals to export");
    return;
  }

  const doc = createBasePDF("Goals Report", `${goals.length} goals`);

  // Summary section with email-style cards
  let currentY = 45;
  const margin = 15;

  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Summary", margin, currentY);
    currentY += 8;

    const cardWidth = 43;
    const cardHeight = 20;
    const cardSpacing = 2;

    // Total Goals
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Goals", margin + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.blue);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.totalGoals || 0), margin + 3, currentY + 14);

    // Total Saved
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Saved", margin + cardWidth + cardSpacing + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.emerald);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalSaved || 0), margin + cardWidth + cardSpacing + 3, currentY + 14);

    // Total Target
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Target", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalTarget || 0), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);

    // Completed
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Completed", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.amber);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.completedGoals || 0), margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

    currentY += cardHeight + 12;
  }

  // Goals table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Goal Details", margin, currentY);
  currentY += 10;

  const headers = ["Name", "Target", "Saved", "Remaining", "Progress", "Priority", "Status", "Deadline"];
  const keys: (keyof GoalExportData)[] = ["name", "target", "current", "remaining", "progress", "priority", "status", "deadline"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "currency", "text", "text", "text", "text"];
  
  // Custom column widths for better layout
  const columnWidths = [30, 22, 22, 22, 16, 16, 16, 20]; // Total: 164mm

  addPDFTable(doc, headers, goals, keys, formats, currentY, columnWidths);

  const filename = `goals_${getTimestampString()}.pdf`;
  doc.save(filename);
}

/**
 * Export budgets as PDF
 */
export function exportBudgetsToPDF(
  budgets: BudgetExportData[],
  summary?: { totalBudgets?: number; totalBudget?: number; totalSpent?: number; remaining?: number }
): void {
  if (budgets.length === 0) {
    alert("No budgets to export");
    return;
  }

  const doc = createBasePDF("Budgets Report", `${budgets.length} budgets`);

  // Summary section with email-style cards
  let currentY = 45;
  const margin = 15;

  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Summary", margin, currentY);
    currentY += 8;

    const cardWidth = 43;
    const cardHeight = 20;
    const cardSpacing = 2;

    // Total Budgets
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Budgets", margin + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.blue);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.totalBudgets || 0), margin + 3, currentY + 14);

    // Total Budget Amount
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Budget Amount", margin + cardWidth + cardSpacing + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalBudget || 0), margin + cardWidth + cardSpacing + 3, currentY + 14);

    // Total Spent
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Spent", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.red);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalSpent || 0), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);

    // Remaining
    const remainingColor = (summary.remaining || 0) >= 0 ? COLORS.emerald : COLORS.red;
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Remaining", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(remainingColor);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.remaining || 0), margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

    currentY += cardHeight + 12;
  }

  // Budgets table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Budget Details", margin, currentY);
  currentY += 10;

  const headers = ["Name", "Category", "Period", "Budget", "Spent", "Remaining", "Usage", "Health"];
  const keys: (keyof BudgetExportData)[] = ["budget_name", "category", "period", "amount", "spent", "remaining", "percentage", "health"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "currency", "currency", "currency", "text", "text"];
  
  // Custom column widths for better layout
  const columnWidths = [28, 22, 18, 22, 22, 22, 14, 16]; // Total: 164mm

  addPDFTable(doc, headers, budgets, keys, formats, currentY, columnWidths);

  const filename = `budgets_${getTimestampString()}.pdf`;
  doc.save(filename);
}

/**
 * Chat message export interfaces
 */
export interface ChatMessageExportData extends Record<string, string | number | boolean | null | undefined> {
  timestamp: string;
  role: string;
  content: string;
  model: string | null;
  userName?: string;
}

/**
 * Export chat messages as PDF with clean structure
 */
export function exportChatToPDF(messages: ChatMessageExportData[], userName?: string): void {
  if (messages.length === 0) {
    alert("No messages to export");
    return;
  }

  const doc = createBasePDF("Chat Conversation", `${messages.length} messages`);

  let currentY = 50;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  const contentWidth = usableWidth * 0.7; // 70% width for content

  messages.forEach((msg, index) => {
    const isUser = msg.role === "You" || msg.role === "user";
    
    // Check if we need a new page
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    // Message header (role + timestamp)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    if (isUser) {
      // User: name on right, timestamp on right below
      doc.setTextColor(COLORS.blue);
      const displayName = msg.userName || userName || "You";
      doc.text(displayName, pageWidth - margin, currentY, { align: "right" });
      
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textMuted);
      doc.text(msg.timestamp, pageWidth - margin, currentY, { align: "right" });
    } else {
      // AI: name on left, timestamp on left below
      doc.setTextColor(COLORS.emerald);
      doc.text("BudgetSense AI", margin, currentY);
      
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textMuted);
      doc.text(msg.timestamp, margin, currentY);
    }
    
    currentY += 7;

    // Calculate content start position
    const contentStartX = isUser ? pageWidth - margin - contentWidth : margin;

    // Message content - clean and simple
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.gray);
    
    // Process content line by line
    const lines = msg.content.split('\n');
    
    lines.forEach(line => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }

      if (!line.trim()) {
        currentY += 3; // Empty line spacing
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(COLORS.dark);
        const headerText = line.substring(4);
        const headerLines = doc.splitTextToSize(headerText, contentWidth);
        headerLines.forEach((headerLine: string) => {
          if (isUser) {
            doc.text(headerLine, pageWidth - margin, currentY, { align: "right", maxWidth: contentWidth });
          } else {
            doc.text(headerLine, contentStartX, currentY);
          }
          currentY += 5.5;
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.gray);
        currentY += 2;
        return;
      } else if (line.startsWith('## ')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        const headerText = line.substring(3);
        const headerLines = doc.splitTextToSize(headerText, contentWidth);
        headerLines.forEach((headerLine: string) => {
          if (isUser) {
            doc.text(headerLine, pageWidth - margin, currentY, { align: "right", maxWidth: contentWidth });
          } else {
            doc.text(headerLine, contentStartX, currentY);
          }
          currentY += 6;
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.gray);
        currentY += 2;
        return;
      } else if (line.startsWith('# ')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        const headerText = line.substring(2);
        const headerLines = doc.splitTextToSize(headerText, contentWidth);
        headerLines.forEach((headerLine: string) => {
          if (isUser) {
            doc.text(headerLine, pageWidth - margin, currentY, { align: "right", maxWidth: contentWidth });
          } else {
            doc.text(headerLine, contentStartX, currentY);
          }
          currentY += 6.5;
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.gray);
        currentY += 2;
        return;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listText = line.trim().substring(2);
        const bulletX = isUser ? pageWidth - margin - contentWidth + 2 : contentStartX + 2;
        const textX = isUser ? pageWidth - margin - contentWidth + 7 : contentStartX + 7;
        
        doc.text("•", bulletX, currentY);
        const listLines = doc.splitTextToSize(listText, contentWidth - 8);
        listLines.forEach((listLine: string, idx: number) => {
          doc.text(listLine, textX, currentY);
          if (idx < listLines.length - 1) currentY += 5;
        });
        currentY += 5;
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.+)$/);
        if (match) {
          const number = match[1];
          const listText = match[2];
          const numberX = isUser ? pageWidth - margin - contentWidth + 2 : contentStartX + 2;
          const textX = isUser ? pageWidth - margin - contentWidth + 9 : contentStartX + 9;
          
          doc.text(`${number}.`, numberX, currentY);
          const listLines = doc.splitTextToSize(listText, contentWidth - 10);
          listLines.forEach((listLine: string, idx: number) => {
            doc.text(listLine, textX, currentY);
            if (idx < listLines.length - 1) currentY += 5;
          });
          currentY += 5;
          return;
        }
      }

      // Regular text - handle bold formatting
      const boldRegex = /\*\*(.+?)\*\*/g;
      const hasBold = boldRegex.test(line);
      
      if (hasBold) {
        // Split by bold markers and render
        const parts = line.split(/(\*\*.+?\*\*)/g);
        
        if (isUser) {
          // For user messages, we need to render right-aligned
          // Combine all parts first to get total width
          let combinedText = '';
          parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
              combinedText += part.substring(2, part.length - 2);
            } else if (part) {
              combinedText += part;
            }
          });
          
          const textLines = doc.splitTextToSize(combinedText, contentWidth);
          textLines.forEach((textLine: string) => {
            doc.text(textLine, pageWidth - margin, currentY, { align: "right", maxWidth: contentWidth });
            currentY += 5;
          });
        } else {
          // For AI messages, render left-aligned with bold
          let xPos = contentStartX;
          parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(COLORS.dark);
              const boldText = part.substring(2, part.length - 2);
              doc.text(boldText, xPos, currentY);
              xPos += doc.getTextWidth(boldText);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(COLORS.gray);
            } else if (part) {
              const textLines = doc.splitTextToSize(part, contentWidth - (xPos - contentStartX));
              textLines.forEach((textLine: string, idx: number) => {
                if (idx > 0) {
                  currentY += 5;
                  xPos = contentStartX;
                }
                doc.text(textLine, xPos, currentY);
                xPos += doc.getTextWidth(textLine);
              });
            }
          });
          currentY += 5;
        }
      } else {
        // Regular text without formatting
        const textLines = doc.splitTextToSize(line, contentWidth);
        textLines.forEach((textLine: string) => {
          if (isUser) {
            doc.text(textLine, pageWidth - margin, currentY, { align: "right", maxWidth: contentWidth });
          } else {
            doc.text(textLine, contentStartX, currentY);
          }
          currentY += 5;
        });
      }
    });

    // Model info (if available)
    if (msg.model && !isUser) {
      currentY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(COLORS.textMuted);
      doc.text(`Model: ${msg.model}`, contentStartX, currentY);
      currentY += 4;
    }

    // Add spacing between messages
    currentY += 8;

    // Subtle divider line
    if (index < messages.length - 1) {
      doc.setDrawColor(COLORS.border);
      doc.setLineWidth(0.1);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
    }
  });

  const filename = `chat_conversation_${getTimestampString()}.pdf`;
  doc.save(filename);
}

/**
 * Export chat messages as CSV
 */
export function exportChatToCSV(messages: ChatMessageExportData[], userName?: string): void {
  if (messages.length === 0) {
    alert("No messages to export");
    return;
  }

  // Update role names for CSV export
  const exportData = messages.map(msg => ({
    ...msg,
    role: msg.role === "You" || msg.role === "user" ? (msg.userName || userName || "You") : "BudgetSense AI"
  }));

  const filename = `chat_conversation_${getTimestampString()}.csv`;
  exportToCSV(exportData, filename);
}
