'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './dashboard.module.css';
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  CheckCircle2, 
  CreditCard, 
  X,
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useClientProjects, useClientInvoices, usePaystackCheckout } from '@/lib/useClientData';
import { createClient } from '@/utils/supabase/client';

export default function ClientDashboardPage() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get('client') || 'Atlas Corp';
  const supabase = createClient();

  const { projects, loading: projectsLoading } = useClientProjects();
  const { invoices, loading: invoicesLoading, updateInvoice } = useClientInvoices();
  const { initializePayment, loading: paymentLoading } = usePaystackCheckout();

  const [paidSuccess, setPaidSuccess] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // New Deliverable comment feedback
  const [showDeliverablesModal, setShowDeliverablesModal] = useState(false);

  // Get current user
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  // Calculate financials
  const totalValue = invoices.reduce((sum, inv) => sum + inv.amount_ngn, 0);
  const paidTotal = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount_ngn, 0);
  const outstanding = totalValue - paidTotal;

  const handlePayOutstanding = async () => {
    if (!selectedInvoice) return;
    
    try {
      const paymentData = await initializePayment(selectedInvoice.id, selectedInvoice.amount_ngn);
      
      // Redirect to Paystack checkout
      if (typeof window !== 'undefined' && paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url;
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Header */}
        <header className={styles.headerSection}>
          <span className={styles.clientPortalBadge}>CLIENT PORTAL</span>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Welcome, {clientParam}</h1>
            <Link href="/client-portal/projects" className={styles.projectHubBtn}>
              Project Hub
            </Link>
          </div>
        </header>

        {paidSuccess && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} />
            <span>Outstanding milestone settled successfully via Paystack! Receipt generated.</span>
          </div>
        )}

        {/* ─── CARD 1: ACTIVE PROJECT ───────────────────────── */}
        {projectsLoading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Active Projects</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Your director will add projects here.</p>
          </div>
        ) : (
          projects.slice(0, 1).map((project) => (
            <div key={project.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Active Project</h2>
                <span className={styles.inProgressBadge}>{project.status}</span>
              </div>

              <div className={styles.projectInfo}>
                <h3 className={styles.projectName}>{project.project_name}</h3>
                <p className={styles.projectPhase}>{project.phase || 'Phase Details'}</p>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressLabelRow}>
                  <span className={styles.progressLabel}>Progress</span>
                  <span className={styles.progressValue}>{project.progress_percentage}%</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: `${project.progress_percentage}%` }} />
                </div>
              </div>

              <div className={styles.cardDivider} />

              <div className={styles.timelineRow}>
                <Calendar size={16} className={styles.timelineIcon} />
                <span className={styles.timelineText}>
                  Timeline: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}

        {/* ─── CARD 2: RECENT UPDATES ───────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Updates</h2>

          <div className={styles.updatesList}>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <MessageSquare size={28} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
                <p>No recent updates yet. Your director will post updates here.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className={styles.updateCard}>
                  <div className={styles.updateHeader}>
                    <div className={styles.systemIconBox}>
                      <Download size={18} />
                    </div>
                    <div className={styles.authorMeta}>
                      <div className={styles.authorNameLine}>
                        <span className={styles.authorName}>{project.project_name}</span>
                        <span className={styles.updateTime}>In progress</span>
                      </div>
                      <p className={styles.updateBody}>
                        {project.description || 'Project update: No description yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── CARD 3: FINANCIALS ───────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Financials</h2>
            <Link href="/client-portal/invoices" className={styles.iconLink}>
              <ExternalLink size={18} />
            </Link>
          </div>

          {invoicesLoading ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Loading financials...</div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <CreditCard size={28} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
              <p>No invoices yet. Your billing information will appear here.</p>
            </div>
          ) : (
            <>
              <div className={styles.financialsList}>
                <div className={styles.financialRow}>
                  <span className={styles.finLabel}>Total Value</span>
                  <span className={styles.finValue}>₦{totalValue.toLocaleString()}</span>
                </div>

                <div className={styles.financialRow}>
                  <span className={styles.finLabel}>Paid to Date</span>
                  <span className={styles.finValue}>₦{paidTotal.toLocaleString()}</span>
                </div>

                <div className={styles.financialRow}>
                  <span className={styles.finLabel}>Outstanding</span>
                  <span className={styles.outstandingValue}>
                    ₦{outstanding.toLocaleString()}
                  </span>
                </div>
              </div>

              {outstanding > 0 ? (
                <button 
                  className={styles.payOutstandingBtn}
                  onClick={() => {
                    const unpaidInvoice = invoices.find(inv => inv.status === 'unpaid');
                    if (unpaidInvoice) {
                      setSelectedInvoice(unpaidInvoice);
                      setShowPayModal(true);
                    }
                  }}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing...' : 'Pay Outstanding'}
                </button>
              ) : (
                <div className={styles.fullyPaidBanner}>
                  ✓ All Project Milestones Fully Paid
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── CARD 4: READY FOR REVIEW ─────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Ready for Review</h2>

          <div className={styles.deliverablesList}>
            <div className={styles.deliverableItem}>
              <FileText size={18} className={styles.delivIcon} />
              <span className={styles.delivName}>Logo_Concepts_v1.pdf</span>
            </div>

            <div className={styles.deliverableItem}>
              <ImageIcon size={18} className={styles.delivIcon} />
              <span className={styles.delivName}>Moodboard_Final.png</span>
            </div>

            <div className={styles.deliverableItem}>
              <Archive size={18} className={styles.delivIcon} />
              <span className={styles.delivName}>Brand_Assets_Pack.zip</span>
            </div>
          </div>

          <button 
            className={styles.viewAllDeliverablesBtn}
            onClick={() => setShowDeliverablesModal(true)}
          >
            View All Deliverables
          </button>
        </div>

      </div>

      {/* Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }} onClick={() => setShowPayModal(false)}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-surface-bright)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            boxShadow: 'var(--modal-shadow)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.35rem', fontWeight: 700 }}>
                Payment
              </h3>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Invoice
                </label>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedInvoice.invoice_number}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Amount Due
                </label>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₦{selectedInvoice.amount_ngn.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowPayModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePayOutstanding}
                disabled={paymentLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f6c445',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: paymentLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliverables Modal */}
      {showDeliverablesModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeliverablesModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Project Deliverables</h3>
                <p className={styles.modalSub}>Review and leave feedback for the creative team</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowDeliverablesModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'var(--bg-surface-low)', borderRadius: '10px', fontSize: '0.86rem' }}>
                ✓ Logo_Concepts_v1.pdf (Approved)
              </div>
              <div style={{ padding: '0.8rem', background: 'var(--bg-surface-low)', borderRadius: '10px', fontSize: '0.86rem' }}>
                ✓ Moodboard_Final.png (Approved)
              </div>
              <div style={{ padding: '0.8rem', background: 'var(--bg-surface-low)', borderRadius: '10px', fontSize: '0.86rem' }}>
                ⏳ Brand_Assets_Pack.zip (Awaiting Signoff)
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalSubmit} onClick={() => setShowDeliverablesModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
