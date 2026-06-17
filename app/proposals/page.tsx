'use client';

import React, { useState } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { FileText, Plus, Copy, Check, ExternalLink, Calendar, DollarSign, Send, Briefcase, Eye } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './proposals.module.css';

export default function ProposalsPage() {
  const { clients, proposals, addProposal, updateProposalStatus } = useData();

  // Form states
  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState('');
  const [price, setPrice] = useState('');

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSendProposal = (id: string) => {
    updateProposalStatus(id, 'Sent');
    alert('Proposal status updated to "Sent"! You can now copy the link and share it with the client.');
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
    <ModulePage title="Proposals" subtitle="Build premium proposals and send shareable links to close deals faster." icon={FileText}>
      <div className={styles.container}>
        
        {/* Top Builder Grid */}
        <div className={styles.builderGrid}>
          
          {/* Left Form */}
          <div className={styles.formCard}>
            <h3 className={styles.sectionTitle}>Draft Proposal</h3>
            <form onSubmit={handleCreateProposal} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Client</label>
                <select 
                  className={styles.select} 
                  value={client} 
                  onChange={e => setClient(e.target.value)}
                >
                  <option value="">Choose client...</option>
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
                  placeholder="e.g. Aether Design System & Brand Assets"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Timeline / Duration</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. 6 Weeks"
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Project Cost (₦)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    placeholder="e.g. 1200000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Scope of Work</label>
                <textarea 
                  className={styles.textarea} 
                  rows={4}
                  placeholder="Describe the main objectives and tasks..."
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Key Deliverables</label>
                <textarea 
                  className={styles.textarea} 
                  rows={4}
                  placeholder="List items the client will receive, separated by newlines..."
                  value={deliverables}
                  onChange={e => setDeliverables(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.createBtn}>
                <Plus size={16} /> Save Draft
              </button>
            </form>
          </div>

          {/* Right Live Preview */}
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewBadge}>LIVE CLIENT PREVIEW</span>
            </div>
            
            <div className={styles.proposalDoc}>
              <div className={styles.docHeader}>
                <div className={styles.logoSpace}>AETHER OS</div>
                <div className={styles.docMeta}>
                  <div className={styles.docDate}>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className={styles.docNum}>Draft Preview</div>
                </div>
              </div>

              <div className={styles.docDivider} />

              <h2 className={styles.docTitle}>{title || 'Untitled Proposal Title'}</h2>
              <div className={styles.docClientInfo}>
                <strong>Prepared For:</strong> {client || '[Client Name]'}
              </div>

              {scope && (
                <div className={styles.docSection}>
                  <h4 className={styles.docSectionTitle}>1. Scope of Work</h4>
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
                <h4 className={styles.docSectionTitle}>3. Timeline & Pricing</h4>
                <div className={styles.previewPriceGrid}>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Estimated Timeline</span>
                    <span className={styles.priceVal}>{timeline || 'Not specified'}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Total Investment</span>
                    <span className={styles.priceVal} style={{ color: '#22c55e' }}>
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
              <p>No proposals drafted yet. Use the builder above to create one.</p>
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
                        {prop.status === 'Draft' && (
                          <button 
                            className={styles.actionBtn} 
                            title="Send to Client"
                            onClick={() => handleSendProposal(prop.id)}
                          >
                            <Send size={14} /> Send
                          </button>
                        )}
                        {prop.status !== 'Draft' && (
                          <button 
                            className={styles.actionBtn} 
                            title="Copy shareable link"
                            onClick={() => handleCopyLink(prop.id)}
                          >
                            {copiedId === prop.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />} 
                            {copiedId === prop.id ? ' Copied' : ' Copy Link'}
                          </button>
                        )}
                        <Link href={`/proposals/view/${prop.id}`} className={styles.actionLinkBtn} title="View proposal page">
                          <Eye size={14} /> View
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
    </ModulePage>
  );
}
