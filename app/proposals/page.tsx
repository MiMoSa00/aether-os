'use client';

import React, { useState } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { 
  FileText, Plus, Copy, Check, Calendar, 
  DollarSign, Send, Eye, Mail, MessageCircle, 
  Download, X, Printer, Share2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './proposals.module.css';

import { generateAndDownloadProposalPDF } from '@/lib/generateProposalPdf';

export default function ProposalsPage() {
  const { clients, proposals, addProposal, updateProposalStatus, addNotification } = useData();

  // Form states
  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState('');
  const [price, setPrice] = useState('');

  // UI state for Live Send Modal
  const [sendModalProposal, setSendModalProposal] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingToPortal, setSendingToPortal] = useState(false);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !title || !price) {
      alert('Please fill in Client, Title, and Price.');
      return;
    }
    await addProposal(client, title, scope, deliverables, timeline, price);
    
    // Clear form
    setClient('');
    setTitle('');
    setScope('');
    setDeliverables('');
    setTimeline('');
    setPrice('');
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/proposals/view/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Live Send Actions - Gmail (Google Web / App)
  const handleSendViaGmail = (prop: any) => {
    const link = `${window.location.origin}/proposals/view/${prop.id}`;
    const matchedClient = clients.find(c => c.name.toLowerCase() === prop.client.toLowerCase());
    const clientEmail = matchedClient?.email || '';

    const subject = encodeURIComponent(`Project Proposal: ${prop.title}`);
    const body = encodeURIComponent(
      `Hello ${prop.client},\n\n` +
      `We have prepared a comprehensive project proposal for "${prop.title}".\n\n` +
      `Project Investment: ${prop.price}\n` +
      `Estimated Timeline: ${prop.timeline || 'As agreed'}\n\n` +
      `You can review the full scope and accept the proposal directly online here:\n${link}\n\n` +
      `Best regards,\nYour Team at Aether`
    );

    // Direct Google Gmail Web Compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${clientEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    
    // Update status to Sent & notify
    updateProposalStatus(prop.id, 'Sent');
    addNotification('Proposal Sent', `Proposal "${prop.title}" opened in Gmail for ${prop.client}.`, 'success');
    setSendModalProposal(null);
  };

  // Default Email Client (mailto)
  const handleSendViaDefaultEmail = (prop: any) => {
    const link = `${window.location.origin}/proposals/view/${prop.id}`;
    const matchedClient = clients.find(c => c.name.toLowerCase() === prop.client.toLowerCase());
    const clientEmail = matchedClient?.email || '';

    const subject = encodeURIComponent(`Project Proposal: ${prop.title}`);
    const body = encodeURIComponent(
      `Hello ${prop.client},\n\n` +
      `We have prepared a comprehensive project proposal for "${prop.title}".\n\n` +
      `Project Investment: ${prop.price}\n` +
      `Estimated Timeline: ${prop.timeline || 'As agreed'}\n\n` +
      `You can review the full scope and accept the proposal directly online here:\n${link}\n\n` +
      `Best regards,\nYour Team at Aether`
    );

    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
    
    updateProposalStatus(prop.id, 'Sent');
    addNotification('Proposal Sent', `Proposal "${prop.title}" opened in Email app for ${prop.client}.`, 'success');
    setSendModalProposal(null);
  };

  // WhatsApp with requested number: 09113415952 -> 2349113415952
  const handleSendViaWhatsApp = (prop: any) => {
    const link = `${window.location.origin}/proposals/view/${prop.id}`;
    const targetPhone = '2349113415952'; // User's requested WhatsApp destination

    const text = encodeURIComponent(
      `Hello ${prop.client}! 👋\n\n` +
      `Here is your project proposal for *${prop.title}*.\n\n` +
      `💰 Investment: *${prop.price}*\n` +
      `⏱ Timeline: *${prop.timeline || 'As agreed'}*\n\n` +
      `📄 View & accept the proposal online:\n${link}`
    );

    const waUrl = `https://wa.me/${targetPhone}?text=${text}`;
    window.open(waUrl, '_blank');

    // Update status to Sent & notify
    updateProposalStatus(prop.id, 'Sent');
    addNotification('Proposal Sent', `Proposal "${prop.title}" shared with ${prop.client} via WhatsApp.`, 'success');
    setSendModalProposal(null);
  };

  // Direct Genuine PDF File Download
  const handleDownloadProposal = (prop: any) => {
    setDownloadingId(prop.id);
    try {
      generateAndDownloadProposalPDF({
        id: prop.id,
        title: prop.title,
        client: prop.client,
        date: prop.date,
        status: prop.status,
        scope: prop.scope,
        deliverables: prop.deliverables,
        timeline: prop.timeline,
        price: prop.price,
      });
      addNotification('PDF Downloaded', `Proposal "${prop.title}" PDF downloaded directly to your device.`, 'success');
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  // Send proposal to client portal (creates project with deliverables)
  const handleSendToClientPortal = async (prop: any) => {
    setSendingToPortal(true);
    try {
      const matchedClient = clients.find(c => c.name.toLowerCase() === prop.client.toLowerCase());
      const response = await fetch('/api/director/send-proposal-to-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: prop.client,
          client_email: matchedClient?.email || '',
          proposal_id: prop.id,
          title: prop.title,
          scope: prop.scope,
          deliverables: prop.deliverables,
          timeline: prop.timeline
        })
      });

      const data = await response.json();
      console.log('Proposal send response:', data);

      if (!response.ok || !data.success) {
        alert('Failed to send proposal to client portal: ' + (data.error || 'Unknown error'));
        return;
      }

      updateProposalStatus(prop.id, 'Sent');
      addNotification(
        'Project Sent to Client Portal',
        `Project "${prop.title}" is now visible in ${prop.client}'s project hub with all deliverables.`,
        'success'
      );
      alert(data.message || `Success! ${prop.title} was sent to ${prop.client}'s portal.`);
      setSendModalProposal(null);
    } catch (error: any) {
      console.error('Error sending to client portal:', error);
      alert('Error: ' + (error?.message || 'Unknown error'));
    } finally {
      setSendingToPortal(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Accepted': return styles.statusAccepted;
      case 'Declined': return styles.statusDeclined;
      case 'Sent': return styles.statusSent;
      default: return styles.statusDraft;
    }
  };

  return (
    <ModulePage 
      title="Proposals" 
      subtitle="Create crystal-clear proposals, deliver them over Email or WhatsApp, and track client approvals." 
      icon={FileText}
    >
      <div className={styles.container}>
        
        {/* Top Builder Grid */}
        <div className={styles.builderGrid}>
          
          {/* Left Form */}
          <div className={styles.formCard}>
            <h3 className={styles.sectionTitle}>Draft a New Proposal</h3>
            <form onSubmit={handleCreateProposal} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Client</label>
                <select 
                  className={styles.select} 
                  value={client} 
                  onChange={e => setClient(e.target.value)}
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Proposal Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. Website Redesign & Branding"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Timeline</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. 4 Weeks"
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Total Price (₦)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    placeholder="e.g. 750000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Scope of Work</label>
                <textarea 
                  className={styles.textarea} 
                  rows={3}
                  placeholder="Explain what work will be done in simple terms..."
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Deliverables (one per line)</label>
                <textarea 
                  className={styles.textarea} 
                  rows={3}
                  placeholder="e.g.&#10;Brand Guidelines PDF&#10;Responsive Website Files&#10;Admin Training Session"
                  value={deliverables}
                  onChange={e => setDeliverables(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.createBtn}>
                <Plus size={16} /> Save Proposal Draft
              </button>
            </form>
          </div>

          {/* Right Live Preview */}
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewBadge}>DOCUMENT PREVIEW</span>
              {title && (
                <button 
                  onClick={() => handleDownloadProposal({
                    id: 'PREVIEW',
                    client: client || 'Client',
                    title: title || 'Proposal',
                    scope,
                    deliverables,
                    timeline,
                    price: price ? `₦${Number(price).toLocaleString()}` : '₦0',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: 'Draft'
                  })}
                  className={styles.actionBtn}
                  style={{ fontSize: '0.75rem' }}
                >
                  <Download size={13} /> Direct Download
                </button>
              )}
            </div>
            
            <div className={styles.proposalDoc}>
              <div className={styles.docHeader}>
                <div className={styles.logoSpace}>AETHER OS</div>
                <div className={styles.docMeta}>
                  <div className={styles.docDate}>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className={styles.docNum}>Status: Draft Preview</div>
                </div>
              </div>

              <div className={styles.docDivider} />

              <h2 className={styles.docTitle}>{title || 'Proposal Title (Preview)'}</h2>
              <div className={styles.docClientInfo}>
                <strong>Prepared For:</strong> {client || 'Select a client on the left'}
              </div>

              {scope && (
                <div className={styles.docSection}>
                  <h4 className={styles.docSectionTitle}>1. Project Scope</h4>
                  <p className={styles.docText}>{scope}</p>
                </div>
              )}

              {deliverables && (
                <div className={styles.docSection}>
                  <h4 className={styles.docSectionTitle}>2. Key Deliverables</h4>
                  <ul className={styles.docList}>
                    {deliverables.split('\n').map((item, idx) => (
                      item.trim() && <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.docSection}>
                <h4 className={styles.docSectionTitle}>3. Investment &amp; Timeline</h4>
                <div className={styles.previewPriceGrid}>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Timeline</span>
                    <span className={styles.priceVal}>{timeline || 'Not set'}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Investment</span>
                    <span className={styles.priceVal} style={{ color: '#16a34a' }}>
                      ₦{price ? Number(price).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.docFooter}>
                <div className={styles.docSignBlock}>
                  <div className={styles.signLine} />
                  <span>Authorized Signature (Aether Agency)</span>
                </div>
                <div className={styles.docSignBlock}>
                  <div className={styles.signLine} />
                  <span>Client Signature Acceptance</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Proposals List */}
        <div className={styles.listCard}>
          <h3 className={styles.sectionTitle}>All Proposals</h3>
          {proposals.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={48} style={{ opacity: 0.15 }} />
              <p>No proposals drafted yet. Use the form above to draft your first proposal.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(prop => (
                    <tr key={prop.id}>
                      <td className={styles.tableTitle} data-label="Title">{prop.title}</td>
                      <td data-label="Client">{prop.client}</td>
                      <td data-label="Date">{prop.date}</td>
                      <td className={styles.tablePrice} data-label="Amount">{prop.price}</td>
                      <td data-label="Status">
                        <span className={`${styles.statusBadge} ${getStatusClass(prop.status)}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className={styles.tableActions}>
                        {/* Live Send Button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.sendBtn}`} 
                          title="Deliver to client via Email or WhatsApp"
                          onClick={() => setSendModalProposal(prop)}
                        >
                          <Send size={13} /> Send
                        </button>
                        
                        {/* Direct File Download Button (instantly downloads to device) */}
                        <button 
                          className={styles.actionBtn}
                          title="Download proposal file directly to device"
                          onClick={() => handleDownloadProposal(prop)}
                        >
                          {downloadingId === prop.id ? (
                            <><Check size={13} style={{ color: '#16a34a' }} /> Downloaded</>
                          ) : (
                            <><Download size={13} /> Download</>
                          )}
                        </button>

                        {/* Copy Link */}
                        <button 
                          className={styles.actionBtn} 
                          title="Copy direct link"
                          onClick={() => handleCopyLink(prop.id)}
                        >
                          {copiedId === prop.id ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                          {copiedId === prop.id ? 'Copied' : 'Link'}
                        </button>

                        {/* View Link */}
                        <Link href={`/proposals/view/${prop.id}`} className={styles.actionLinkBtn} title="View client page">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ─── LIVE SEND MODAL ────────────────────────────────────── */}
      {sendModalProposal && (
        <div className={styles.modalBackdrop} onClick={() => setSendModalProposal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Send Proposal</h3>
                <p className={styles.modalSub}>
                  Deliver <strong>&ldquo;{sendModalProposal.title}&rdquo;</strong> to <strong>{sendModalProposal.client}</strong>.
                </p>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setSendModalProposal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.sendOptionList}>
              {/* Option 1a: Gmail */}
              <button 
                className={styles.sendOptionBtn}
                onClick={() => handleSendViaGmail(sendModalProposal)}
              >
                <div className={styles.sendOptionIcon} style={{ background: 'rgba(234, 67, 53, 0.12)', color: '#ea4335' }}>
                  <Mail size={22} />
                </div>
                <div className={styles.sendOptionText}>
                  <div className={styles.sendOptionTitle}>Send via Gmail</div>
                  <div className={styles.sendOptionDesc}>Opens Gmail (Google Mail) in your browser with the proposal message pre-filled and ready to send.</div>
                </div>
              </button>

              {/* Option 1b: Default Email App (Outlook, Apple Mail, etc.) */}
              <button 
                className={styles.sendOptionBtn}
                onClick={() => handleSendViaDefaultEmail(sendModalProposal)}
              >
                <div className={styles.sendOptionIcon} style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                  <Mail size={22} />
                </div>
                <div className={styles.sendOptionText}>
                  <div className={styles.sendOptionTitle}>Send via Email App</div>
                  <div className={styles.sendOptionDesc}>Opens your default email app (Outlook, Apple Mail, etc.) with the message pre-filled.</div>
                </div>
              </button>

              {/* Option 2: WhatsApp with 09113415952 */}
              <button 
                className={styles.sendOptionBtn}
                onClick={() => handleSendViaWhatsApp(sendModalProposal)}
              >
                <div className={styles.sendOptionIcon} style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}>
                  <MessageCircle size={22} />
                </div>
                <div className={styles.sendOptionText}>
                  <div className={styles.sendOptionTitle}>Send via WhatsApp (09113415952)</div>
                  <div className={styles.sendOptionDesc}>Opens WhatsApp with a formatted proposal summary ready to send.</div>
                </div>
              </button>

              {/* Option 3: Copy Direct Link */}
              <button 
                className={styles.sendOptionBtn}
                onClick={() => {
                  handleCopyLink(sendModalProposal.id);
                  updateProposalStatus(sendModalProposal.id, 'Sent');
                  addNotification('Proposal Shared', `Link for "${sendModalProposal.title}" copied and status marked as Sent.`, 'info');
                  setSendModalProposal(null);
                }}
              >
                <div className={styles.sendOptionIcon} style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                  <Copy size={22} />
                </div>
                <div className={styles.sendOptionText}>
                  <div className={styles.sendOptionTitle}>Copy Shareable Link</div>
                  <div className={styles.sendOptionDesc}>Copy the client view link and mark the proposal as Sent.</div>
                </div>
              </button>

              {/* Option 4: Send to Client Portal */}
              <button 
                className={styles.sendOptionBtn}
                onClick={() => handleSendToClientPortal(sendModalProposal)}
                disabled={sendingToPortal}
                style={{ opacity: sendingToPortal ? 0.6 : 1, cursor: sendingToPortal ? 'not-allowed' : 'pointer' }}
              >
                <div className={styles.sendOptionIcon} style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}>
                  <Share2 size={22} />
                </div>
                <div className={styles.sendOptionText}>
                  <div className={styles.sendOptionTitle}>{sendingToPortal ? 'Sending...' : 'Send to Client Portal'}</div>
                  <div className={styles.sendOptionDesc}>Send project directly to the client portal. They'll see it in their Project Hub with all deliverables.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </ModulePage>
  );
}
