/**
 * Sanitize text for PDF export by removing/replacing problematic characters
 */
export function sanitizeTextForPDF(text: string): string {
  if (!text) return "";
  
  return text
    // Replace smart quotes with regular quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace em dash and en dash with regular dash
    .replace(/[\u2013\u2014]/g, "-")
    // Replace ellipsis
    .replace(/\u2026/g, "...")
    // Remove other problematic Unicode characters
    .replace(/[\u0080-\u00FF]/g, (char) => {
      // Keep common accented characters, replace others
      const code = char.charCodeAt(0);
      if (code >= 0xA0 && code <= 0xFF) return char; // Latin-1 supplement
      return "";
    })
    // Remove any remaining non-ASCII characters that might cause issues
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, "")
    // Clean up multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

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
