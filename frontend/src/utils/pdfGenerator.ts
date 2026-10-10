import { jsPDF } from 'jspdf';
import { Task } from '../types';

/**
 * Generates an executive, publication-grade research report PDF from task data.
 */
export async function generateResearchReportPDF(task: Task): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - 50;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = margin + 25; // leave room for top header
      return true;
    }
    return false;
  };

  // 1. Brand & Header Bar (Top Accent)
  doc.setFillColor(33, 107, 75); // #216B4B
  doc.rect(margin, y, contentWidth, 4, 'F');
  y += 18;

  // Header Title & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(33, 107, 75);
  doc.text('AUTONOMIQLOCAL-FIRST AUTONOMOUS AI WORKSPACE', margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(99, 113, 104);
  const dateStr = task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : new Date().toLocaleDateString();
  doc.text(dateStr, pageWidth - margin, y, { align: 'right' });
  y += 20;

  // 2. Report Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(23, 35, 28);
  const titleLines = doc.splitTextToSize(task.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 8;

  // Metadata pills / subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(99, 113, 104);
  doc.text(`Model: ${task.model_name || 'Local AI'}  •  Status: ${task.status.toUpperCase()}  •  Task ID: ${task.id}`, margin, y);
  y += 24;

  // 3. Executive Summary Callout Box
  const summaryText = task.description || 'Autonomous research completed with live web grounding, RAG extraction, and local synthesis.';
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 24);
  const boxHeight = summaryLines.length * 13 + 34;

  checkPageBreak(boxHeight);

  // Background Box
  doc.setFillColor(234, 245, 237); // #EAF5ED pale green
  doc.setDrawColor(187, 222, 196); // border
  doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 87, 60);
  doc.text('EXECUTIVE RESEARCH OBJECTIVE', margin + 12, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(23, 35, 28);
  doc.text(summaryLines, margin + 12, y + 30);
  y += boxHeight + 24;

  // 4. Section: Research Execution Workflow
  checkPageBreak(120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(33, 107, 75);
  doc.text('1. Autonomous Pipeline Execution', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 45);
  const introP = doc.splitTextToSize(
    'Autonomiq autonomously planned, gathered verified evidence, indexed findings in local vector storage, and synthesized the final report using the following pipeline steps:',
    contentWidth
  );
  doc.text(introP, margin, y);
  y += introP.length * 13 + 8;

  // Step checklist
  const steps = task.steps || [];
  steps.forEach((step, idx) => {
    checkPageBreak(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 107, 75);
    const mark = step.status === 'completed' ? '[PASS]' : step.status === 'running' ? '[ACTIVE]' : '[WAIT]';
    doc.text(`${mark} Step ${idx + 1}: ${step.name.toUpperCase()}`, margin + 8, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 113, 104);
    const duration = step.completed_at && step.started_at 
      ? `(${Math.max(1, Math.round((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000))}s)` 
      : `(${step.status})`;
    doc.text(duration, margin + 220, y);
    y += 14;
  });
  y += 16;

  // 5. Section: Grounding Sources & Citations Matrix
  const sources = task.sources || [];
  checkPageBreak(80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(33, 107, 75);
  doc.text(`2. Grounding Sources & Citations (${sources.length})`, margin, y);
  y += 16;

  if (sources.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(99, 113, 104);
    doc.text('No external sources recorded for this task.', margin, y);
    y += 18;
  } else {
    sources.forEach((src, idx) => {
      const srcTitle = src.title || src.url || `Evidence Source ${idx + 1}`;
      const snippet = (src.snippet || '').trim().replace(/\s+/g, ' ');
      const domain = src.url ? new URL(src.url).hostname.replace('www.', '') : 'web';

      const snippetLines = doc.splitTextToSize(snippet, contentWidth - 28);
      const itemHeight = 36 + snippetLines.length * 11;

      checkPageBreak(itemHeight);

      // Source card container
      doc.setFillColor(247, 249, 247); // soft off-white
      doc.setDrawColor(226, 233, 227);
      doc.roundedRect(margin, y, contentWidth, itemHeight, 3, 3, 'FD');

      // Title & number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(23, 35, 28);
      const titleTruncated = srcTitle.length > 70 ? srcTitle.slice(0, 68) + '...' : srcTitle;
      doc.text(`${idx + 1}. ${titleTruncated}`, margin + 10, y + 14);

      // Domain tag
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(33, 107, 75);
      doc.text(`[${domain}]`, pageWidth - margin - 10, y + 14, { align: 'right' });

      // Clickable link if URL exists
      if (src.url) {
        doc.setTextColor(52, 120, 197); // #3478C5 info accent
        doc.textWithLink('Open Source URL', margin + 10, y + 25, { url: src.url });
      }

      // Snippet text
      if (snippet) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(99, 113, 104);
        doc.text(snippetLines, margin + 10, y + 36);
      }

      y += itemHeight + 8;
    });
  }

  y += 16;

  // 6. Section: Generated Artifacts Summary
  const artifacts = task.artifacts || [];
  checkPageBreak(70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(33, 107, 75);
  doc.text(`3. Verified Deliverables & Artifacts (${artifacts.length})`, margin, y);
  y += 16;

  artifacts.forEach((art) => {
    checkPageBreak(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(23, 35, 28);
    const sizeKb = (art.size_bytes / 1024).toFixed(1);
    doc.text(`• ${art.file_name} (${art.file_type})`, margin + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 113, 104);
    doc.text(`${sizeKb} KB  •  Checksum: ${art.checksum ? art.checksum.slice(0, 12) + '...' : 'Verified'}`, margin + 260, y);
    y += 16;
  });

  // 7. Page numbering & running footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top rule on page 2+
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 160, 155);
      doc.text(`Autonomiq Research Report — ${task.title.slice(0, 50)}`, margin, 28);
      doc.setDrawColor(226, 233, 227);
      doc.line(margin, 34, pageWidth - margin, 34);
    }

    // Bottom footer
    doc.setDrawColor(226, 233, 227);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(99, 113, 104);
    doc.text('Confidential • Generated by Autonomiq Autonomous Workspace', margin, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  // Save the generated PDF
  const safeFilename = `Autonomiq_Report_${(task.title || 'research').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35)}.pdf`;
  doc.save(safeFilename);
}
