import { createBasePDF } from "./pdf-base";
import { COLORS } from "./constants";
import { sanitizeTextForPDF, getTimestampString } from "./formatters";
import type { ChatMessageExportData } from "./types";

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
  const contentWidth = usableWidth * 0.7; 

  messages.forEach((msg, index) => {
    const isUser = msg.role === "You" || msg.role === "user";

    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    if (isUser) {

      doc.setTextColor(COLORS.blue);
      const displayName = msg.userName || userName || "You";
      doc.text(displayName, pageWidth - margin, currentY, { align: "right" });
      
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textMuted);
      doc.text(msg.timestamp, pageWidth - margin, currentY, { align: "right" });
    } else {

      doc.setTextColor(COLORS.emerald);
      doc.text("BudgetSense AI", margin, currentY);
      
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textMuted);
      doc.text(msg.timestamp, margin, currentY);
    }
    
    currentY += 7;

    const contentStartX = isUser ? pageWidth - margin - contentWidth : margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.gray);

    const lines = msg.content.split('\n');
    
    lines.forEach(line => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }

      if (!line.trim()) {
        currentY += 3; 
        return;
      }

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

      const boldRegex = /\*\*(.+?)\*\*/g;
      const hasBold = boldRegex.test(line);
      
      if (hasBold) {

        const parts = line.split(/(\*\*.+?\*\*)/g);
        
        if (isUser) {

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

    if (msg.model && !isUser) {
      currentY += 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(COLORS.textMuted);
      doc.text(`Model: ${msg.model}`, contentStartX, currentY);
      currentY += 4;
    }

    currentY += 8;

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
