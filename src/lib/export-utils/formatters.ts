
export function sanitizeTextForPDF(text: string): string {
  if (!text) return "";
  
  return text

    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')

    .replace(/[\u2013\u2014]/g, "-")

    .replace(/\u2026/g, "...")

    .replace(/[\u0080-\u00FF]/g, (char) => {

      const code = char.charCodeAt(0);
      if (code >= 0xA0 && code <= 0xFF) return char; 
      return "";
    })

    .replace(/[^\x00-\x7F\xA0-\xFF]/g, "")

    .replace(/\s+/g, " ")
    .trim();
}

export function formatCurrencyPHP(amount: number): string {
  return "PHP " + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatExportDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTimestampString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
