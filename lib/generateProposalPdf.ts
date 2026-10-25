import { jsPDF } from 'jspdf';

export interface ProposalPDFData {
  id: string;
  title: string;
  client: string;
  date: string;
  status: string;
  scope?: string;
  deliverables?: string;
  timeline?: string;
  price: string;
}

export function generateAndDownloadProposalPDF(prop: ProposalPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 22;

  // Header Banner Background
  doc.setFillColor(3, 6, 18);
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AETHER OS', margin + 8, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 210);
  doc.text('Project Proposal & Engagement Brief', margin + 8, y + 17);

  // Proposal Meta Top Right
  doc.setFontSize(8);
  doc.text(`ID: ${prop.id}`, pageWidth - margin - 8, y + 9, { align: 'right' });
  doc.text(`Date: ${prop.date}`, pageWidth - margin - 8, y + 14, { align: 'right' });
  doc.text(`Status: ${prop.status.toUpperCase()}`, pageWidth - margin - 8, y + 19, { align: 'right' });

  y += 34;

  // Title
  doc.setTextColor(3, 6, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(prop.title || 'Untitled Proposal', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 2;

  // Client Box
  doc.setFillColor(245, 244, 242);
  doc.setDrawColor(115, 92, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, 14, 'FD');

  doc.setTextColor(115, 92, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PREPARED FOR:', margin + 6, y + 6);

  doc.setTextColor(26, 28, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(prop.client || 'Client Partner', margin + 42, y + 6);
  doc.text(`Engagement: Standard Client Contract`, margin + 6, y + 11);

  y += 22;

  // 1. Scope of Work
  if (prop.scope) {
    doc.setTextColor(115, 92, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. SCOPE OF WORK & OBJECTIVES', margin, y);
    y += 6;

    doc.setTextColor(50, 52, 58);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const scopeLines = doc.splitTextToSize(prop.scope, contentWidth);
    doc.text(scopeLines, margin, y);
    y += scopeLines.length * 5.2 + 8;
  }

  // 2. Key Deliverables
  doc.setTextColor(115, 92, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. KEY DELIVERABLES', margin, y);
  y += 6;

  doc.setTextColor(50, 52, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  const rawDeliverables = prop.deliverables
    ? prop.deliverables.split('\n').filter((d) => d.trim().length > 0)
    : ['Standard creative and technical deliverables as agreed in project roadmap'];

  rawDeliverables.forEach((item) => {
    doc.setFillColor(115, 92, 0);
    doc.circle(margin + 2, y - 1, 0.9, 'F');
    const itemLines = doc.splitTextToSize(item.trim(), contentWidth - 8);
    doc.text(itemLines, margin + 6, y);
    y += itemLines.length * 5 + 2;
  });

  y += 8;

  // 3. Investment & Schedule Box
  doc.setFillColor(245, 244, 242);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'FD');

  doc.setTextColor(90, 92, 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ESTIMATED TIMELINE', margin + 8, y + 8);
  doc.text('TOTAL INVESTMENT', pageWidth - margin - 8, y + 8, { align: 'right' });

  doc.setTextColor(3, 6, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(prop.timeline || 'As agreed', margin + 8, y + 16);

  // Clean Price representation in NGN
  const cleanPrice = prop.price.startsWith('₦') ? prop.price : `₦${prop.price}`;
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(14);
  doc.text(cleanPrice, pageWidth - margin - 8, y + 16, { align: 'right' });

  y += 36;

  // Signatures Section
  doc.setDrawColor(200, 200, 205);
  doc.setLineWidth(0.5);

  const sigBoxWidth = (contentWidth - 16) / 2;

  // Agency Sig
  doc.line(margin, y + 14, margin + sigBoxWidth, y + 14);
  doc.setTextColor(3, 6, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Aether Agency Authorized Representative', margin, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 112, 120);
  doc.text('Authorized via Digital Workspace Token', margin, y + 23);

  // Client Sig
  const clientSigX = margin + sigBoxWidth + 16;
  doc.line(clientSigX, y + 14, clientSigX + sigBoxWidth, y + 14);
  doc.setTextColor(3, 6, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${prop.client} Authorized Signee`, clientSigX, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 112, 120);
  doc.text('Client Acceptance of Terms & Deliverables', clientSigX, y + 23);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text(
    'This official document is generated by Aether OS. All terms and scope outlined above are legally binding upon client signoff.',
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  // Generate safe filename and trigger direct .pdf download
  const safeClient = (prop.client || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeTitle = (prop.title || 'Proposal').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Proposal_${safeClient}_${safeTitle}.pdf`;

  doc.save(fileName);
}
