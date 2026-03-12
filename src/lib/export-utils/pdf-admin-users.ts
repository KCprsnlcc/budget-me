import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { UserExportData } from "./types";

export function exportAdminUsersToPDF(
    users: UserExportData[],
    summary?: { totalUsers?: number; activeUsers?: number; adminCount?: number }
): void {
    if (users.length === 0) {
        alert("No users to export");
        return;
    }

    const doc = createBasePDF("User Management Report", `${users.length} users`);

    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 58;
        const cardHeight = 20;
        const cardSpacing = 3;

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Users", margin + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalUsers || 0).toString(), margin + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Active Users", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text((summary.activeUsers || 0).toString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Admins", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.adminCount || 0).toString(), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("User Details", margin, currentY);
    currentY += 10;

    const headers = ["ID", "Full Name", "Email", "Role", "Status", "Joined Date"];
    const keys: (keyof UserExportData)[] = ["id", "full_name", "email", "role", "status", "created_at"];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "text"];

    const columnWidths = [15, 35, 60, 20, 15, 35]; 

    addPDFTable(doc, headers, users, keys, formats, currentY, columnWidths);

    const filename = `admin_users_${getTimestampString()}.pdf`;
    doc.save(filename);
}
