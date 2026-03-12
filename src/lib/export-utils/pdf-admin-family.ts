import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { FamilyAdminExportData } from "./types";

export function exportAdminFamiliesToPDF(
    families: FamilyAdminExportData[],
    summary?: {
        totalFamilies?: number;
        totalMembers?: number;
        avgMembers?: number;
        publicFamilies?: number;
    }
): void {
    if (families.length === 0) {
        alert("No families to export");
        return;
    }

    const doc = createBasePDF("Family Management Report", `${families.length} families`);

    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Family Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 43;
        const cardHeight = 20;
        const cardSpacing = 3;

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Families", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalFamilies || 0).toLocaleString(), margin + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Members", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalMembers || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Avg Members/Family", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.avgMembers || 0).toFixed(1), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Public Families", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text((summary.publicFamilies || 0).toLocaleString(), margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Family Records", margin, currentY);
    currentY += 10;

    const headers = ["Family Name", "Owner Email", "Members", "Created Date", "Status"];
    const keys: (keyof FamilyAdminExportData)[] = [
        "family_name",
        "owner_email",
        "member_count",
        "created_at",
        "subscription_status"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "number", "text", "text"];

    const columnWidths = [50, 70, 20, 25, 15]; 

    addPDFTable(doc, headers, families, keys, formats, currentY, columnWidths);

    const filename = `admin_families_${getTimestampString()}.pdf`;
    doc.save(filename);
}
