'use client';

import React, { useState } from 'react';
import styles from './notifications.module.css';
import { 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  FolderKanban, 
  FileUp, 
  History, 
  Circle, 
  X, 
  Check, 
  ArrowRight,
  Receipt
} from 'lucide-react';

export default function ActivityCenterPage() {
  const [expenseStatus, setExpenseStatus] = useState<'pending' | 'approved' | 'reviewed'>('pending');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const handleApproveExpense = () => {
    setExpenseStatus('approved');
    setActionToast('Expense report ($450) approved for Sarah Jenkins.');
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleReviewExpense = () => {
    setExpenseStatus('reviewed');
    setActionToast('Expense report flagged for director audit.');
    setTimeout(() => setActionToast(null), 4000);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Header */}
        <header className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Activity Center</h1>
          <p className={styles.pageSubtitle}>
            Your recent operations and required actions.
          </p>
        </header>

        {/* Action Toast */}
        {actionToast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} />
            <span>{actionToast}</span>
          </div>
        )}

        {/* ─── SECTION 1: FINANCIAL ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionCategory}>
            <Banknote size={16} />
            <span>FINANCIAL</span>
          </div>

          <div className={styles.cardsStack}>
            {/* Invoice Paid Card */}
            <div className={styles.actionCard}>
              <div className={styles.cardHeaderRow}>
                <div className={`${styles.iconCircle} ${styles.goldCheck}`}>
                  <CheckCircle2 size={20} />
                </div>
                <div className={styles.cardHeaderText}>
                  <div className={styles.cardTitleLine}>
                    <h3 className={styles.cardTitle}>Invoice #INV-2023-042 Paid</h3>
                    <span className={styles.timeTag}>10 mins ago</span>
                  </div>
                  <p className={styles.cardDescription}>
                    Client "Vanguard Studios" has settled the final milestone payment of $12,500.
                  </p>
                </div>
              </div>
              <div className={styles.cardActionsRow}>
                <button 
                  className={styles.primaryActionBtn}
                  onClick={() => setShowReceiptModal(true)}
                >
                  VIEW RECEIPT
                </button>
              </div>
            </div>

            {/* Expense Approval Card */}
            <div className={styles.actionCard}>
              <div className={styles.cardHeaderRow}>
                <div className={`${styles.iconCircle} ${styles.redWarning}`}>
                  <AlertCircle size={20} />
                </div>
                <div className={styles.cardHeaderText}>
                  <div className={styles.cardTitleLine}>
                    <h3 className={styles.cardTitle}>Expense Approval Required</h3>
                    <span className={styles.timeTag}>2 hours ago</span>
                  </div>
                  <p className={styles.cardDescription}>
                    Team member "Sarah Jenkins" submitted an expense report for software licenses ($450).
                  </p>
                </div>
              </div>

              <div className={styles.cardActionsRow}>
                {expenseStatus === 'pending' ? (
                  <>
                    <button 
                      className={styles.goldActionBtn}
                      onClick={handleApproveExpense}
                    >
                      APPROVE
                    </button>
                    <button 
                      className={styles.outlineActionBtn}
                      onClick={handleReviewExpense}
                    >
                      REVIEW
                    </button>
                  </>
                ) : (
                  <div className={styles.statusResolved}>
                    <Check size={16} /> Status: {expenseStatus.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: PROJECTS ─────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionCategory}>
            <FolderKanban size={16} />
            <span>PROJECTS</span>
          </div>

          <div className={styles.cardsStack}>
            <div className={styles.actionCard}>
              <div className={styles.cardHeaderRow}>
                <div className={`${styles.iconCircle} ${styles.grayCircle}`}>
                  <FileUp size={20} />
                </div>
                <div className={styles.cardHeaderText}>
                  <div className={styles.cardTitleLine}>
                    <h3 className={styles.cardTitle}>New Assets Uploaded</h3>
                    <span className={styles.timeTag}>Yesterday</span>
                  </div>
                  <p className={styles.cardDescription}>
                    "Brand Guidelines v2" and 3 other files added to Project: Nexus Rebrand.
                  </p>
                </div>
              </div>

              <div className={styles.cardActionsRow}>
                <button 
                  className={styles.outlineActionBtn}
                  onClick={() => setShowFilesModal(true)}
                >
                  VIEW FILES
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: ACTIVITY STREAM ─────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionCategory}>
            <History size={16} />
            <span>ACTIVITY STREAM</span>
          </div>

          <div className={styles.streamCard}>
            <div className={styles.timelineList}>
              {/* Item 1 */}
              <div className={styles.timelineNode}>
                <div className={styles.bulletWrapper}>
                  <div className={styles.hollowBullet} />
                  <div className={styles.verticalStem} />
                </div>
                <div className={styles.timelineInfo}>
                  <p className={styles.nodeText}>
                    <strong>You</strong> signed the NDA for "Project Horizon".
                  </p>
                  <span className={styles.nodeTimestamp}>Today, 09:41 AM</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className={styles.timelineNode}>
                <div className={styles.bulletWrapper}>
                  <div className={styles.hollowBullet} />
                  <div className={styles.verticalStem} />
                </div>
                <div className={styles.timelineInfo}>
                  <p className={styles.nodeText}>
                    System backup completed successfully.
                  </p>
                  <span className={styles.nodeTimestamp}>Today, 03:00 AM</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className={styles.timelineNode}>
                <div className={styles.bulletWrapper}>
                  <div className={styles.hollowBullet} />
                </div>
                <div className={styles.timelineInfo}>
                  <p className={styles.nodeText}>
                    <strong>David Chen</strong> logged in from a new IP (London, UK).
                  </p>
                  <span className={styles.nodeTimestamp}>Yesterday, 14:22 PM</span>
                </div>
              </div>
            </div>

            <div className={styles.streamFooter}>
              <button 
                className={styles.viewHistoryBtn}
                onClick={() => setShowHistoryModal(true)}
              >
                VIEW ALL HISTORY
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReceiptModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Receipt size={22} />
                <h3 className={styles.modalTitle}>Official Payment Receipt</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowReceiptModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.receiptBox}>
              <div className={styles.receiptRow}>
                <span>Invoice ID</span>
                <strong>#INV-2023-042</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Client</span>
                <strong>Vanguard Studios LLC</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Amount Settled</span>
                <strong>$12,500.00 USD</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Payment Method</span>
                <strong>Wire Settlement (Fedwire)</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Status</span>
                <span className={styles.paidBadge}>✓ CLEARED</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalSubmit} onClick={() => setShowReceiptModal(false)}>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilesModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Nexus Rebrand Assets</h3>
                <p className={styles.modalSub}>4 deliverables synced to cloud storage</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowFilesModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.filesList}>
              <div className={styles.fileItem}>
                <span>📄 Brand Guidelines v2.pdf (14.2 MB)</span>
                <button className={styles.downloadBtn}>Download</button>
              </div>
              <div className={styles.fileItem}>
                <span>🎨 Master_Logo_Kit.zip (38.5 MB)</span>
                <button className={styles.downloadBtn}>Download</button>
              </div>
              <div className={styles.fileItem}>
                <span>🔤 Primary_Font_Licensing.pdf (1.1 MB)</span>
                <button className={styles.downloadBtn}>Download</button>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalSubmit} onClick={() => setShowFilesModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className={styles.modalOverlay} onClick={() => setShowHistoryModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Complete Activity Log</h3>
                <p className={styles.modalSub}>30-day immutable audit ledger</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowHistoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '0.5rem 0 1rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              All 148 security audits and operational checkpoints recorded nominal compliance.
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalSubmit} onClick={() => setShowHistoryModal(false)}>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
