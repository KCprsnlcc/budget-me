import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { ChatbotAdminExportData } from "./types";

export function exportAdminChatbotToPDF(
    sessions: ChatbotAdminExportData[],
    summary?: {
        totalMessages?: number;
        activeUsers?: number;
        totalUserMessages?: number;
        totalAssistantMessages?: number;
    }
): void {
    if (sessions.length === 0) {
        alert("No chat sessions to export");
        return;
    }

    const doc = createBasePDF("Chatbot Management Report", `${sessions.length} sessions`);

    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Chatbot Summary", margin, currentY);
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
        doc.text("Total Messages", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalMessages || 0).toLocaleString(), margin + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Active Users", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.blue);
        doc.setFont("helvetica", "bold");
        doc.text((summary.activeUsers || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("User Messages", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalUserMessages || 0).toLocaleString(), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("AI Responses", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalAssistantMessages || 0).toLocaleString(), margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Chat Session Records", margin, currentY);
    currentY += 10;

    const headers = ["User Email", "User Name", "Messages", "Models Used", "Last Active", "Preview"];
    const keys: (keyof ChatbotAdminExportData)[] = [
        "user_email",
        "user_name",
        "total_messages",
        "models_used",
        "last_active",
        "last_message_preview"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "number", "text", "text", "text"];

    const columnWidths = [45, 35, 15, 30, 25, 30]; 

    addPDFTable(doc, headers, sessions, keys, formats, currentY, columnWidths);

    const filename = `admin_chatbot_${getTimestampString()}.pdf`;
    doc.save(filename);
}
