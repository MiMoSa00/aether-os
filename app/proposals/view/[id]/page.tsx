'use client';

import React, { use } from 'react';
import { useData } from '@/context/DataContext';
import { CheckCircle2, XCircle, ArrowLeft, Calendar, ShieldCheck, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import styles from './view.module.css';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function ProposalClientViewPage({ params }: PageProps) {
  // Support Next.js 14/15 async params or sync params safely
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { id } = resolvedParams;
  
  const { proposals, updateProposalStatus, user } = useData();
  const proposal = proposals.find(p => p.id === id);

  if (!proposal) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundCard}>
          <XCircle size={48} className={styles.errorIcon} />
          <h2>Proposal Not Found</h2>
          <p>The proposal link you followed is invalid, expired, or has been removed.</p>
          <Link href="/" className={styles.homeBtn}>Go to Home</Link>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    updateProposalStatus(proposal.id, 'Accepted');
    alert('Thank you! You have accepted this proposal. The agency has been notified.');
  };

  const handleDecline = () => {
    const confirm = window.confirm('Are you sure you want to decline this proposal? You can discuss terms further with the agency.');
    if (confirm) {
      updateProposalStatus(proposal.id, 'Declined');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.pageBackground}>
      {/* Top Banner / Actions Bar */}
      <div className={styles.topActionsBar}>
        <div className={styles.barInner}>
          <div className={styles.barLeft}>
            {user ? (
              <Link href="/proposals" className={styles.backBtn}>
                <ArrowLeft size={16} /> Back to Proposals
              </Link>
            ) : (
              <div className={styles.brandLogo}>AETHER OS PORTAL</div>
            )}
          </div>
          <div className={styles.barRight}>
            <button className={styles.iconButton} onClick={handlePrint} title="Print / PDF">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* Proposal Status Callout */}
        <div className={styles.statusCallout}>
          {proposal.status === 'Sent' && (
            <div className={`${styles.statusAlert} ${styles.alertPending}`}>
              <div className={styles.alertText}>
                <h4>Review Awaiting Decision</h4>
                <p>Please review the details below. Once satisfied, click Accept below to authorize the contract.</p>
              </div>
              <div className={styles.alertActions}>
                <button onClick={handleDecline} className={styles.declineBtn}>Decline</button>
                <button onClick={handleAccept} className={styles.acceptBtn}>Accept Proposal</button>
              </div>
            </div>
          )}

          {proposal.status === 'Accepted' && (
            <div className={`${styles.statusAlert} ${styles.alertAccepted}`}>
              <CheckCircle2 size={24} className={styles.alertIcon} />
              <div className={styles.alertText}>
                <h4>Proposal Accepted</h4>
                <p>This proposal was authorized and accepted on {proposal.date}. The contract is active.</p>
              </div>
            </div>
          )}

          {proposal.status === 'Declined' && (
            <div className={`${styles.statusAlert} ${styles.alertDeclined}`}>
              <XCircle size={24} className={styles.alertIcon} />
              <div className={styles.alertText}>
                <h4>Proposal Declined</h4>
                <p>This proposal was declined. You can contact the agency to review or draft a new proposal.</p>
              </div>
            </div>
          )}

          {proposal.status === 'Draft' && (
            <div className={`${styles.statusAlert} ${styles.alertDraft}`}>
              <div className={styles.alertText}>
                <h4>Draft Mode (Internal View)</h4>
                <p>This proposal is in Draft mode. Update its status to "Sent" to make it active for client approval.</p>
              </div>
              <div className={styles.alertActions}>
                <button onClick={() => updateProposalStatus(proposal.id, 'Sent')} className={styles.acceptBtn}>Set to Sent</button>
              </div>
            </div>
          )}
        </div>

        {/* The Contract / Document */}
        <div className={styles.documentCard}>
          <div className={styles.docHeader}>
            <div>
              <div className={styles.logoText}>AETHER OS</div>
              <div className={styles.agencyDetails}>
                <span>Aether Agency Nigeria</span><br />
                <span>workspace@aether.net</span>
              </div>
            </div>
            <div className={styles.docMeta}>
              <h2>PROPOSAL BRIEF</h2>
              <table className={styles.metaTable}>
                <tbody>
                  <tr>
                    <td>Proposal ID:</td>
                    <td><strong>{proposal.id}</strong></td>
                  </tr>
                  <tr>
                    <td>Date Issued:</td>
                    <td>{proposal.date}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td><span className={styles.statusBadge}>{proposal.status}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.clientSection}>
            <span className={styles.sectionLabel}>Client Partner:</span>
            <h3>{proposal.client}</h3>
          </div>

          <h1 className={styles.proposalTitle}>{proposal.title}</h1>

          {proposal.scope && (
            <div className={styles.docSection}>
              <h3 className={styles.sectionHeading}>1. Project Scope & Purpose</h3>
              <p className={styles.bodyText}>{proposal.scope}</p>
            </div>
          )}

          {proposal.deliverables && (
            <div className={styles.docSection}>
              <h3 className={styles.sectionHeading}>2. Deliverables</h3>
              <ul className={styles.deliverablesList}>
                {proposal.deliverables.split('\n').map((item, idx) => (
                  item.trim() && <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.docSection}>
            <h3 className={styles.sectionHeading}>3. Budget & Schedule</h3>
            <div className={styles.financialSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Expected Delivery Timeline</span>
                <span className={styles.summaryValue}>{proposal.timeline || 'Not specified'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Project Investment</span>
                <span className={styles.summaryValue} style={{ color: '#22c55e' }}>{proposal.price}</span>
              </div>
            </div>
          </div>

          <div className={styles.signatureSection}>
            <div className={styles.sigCard}>
              <div className={styles.sigLine} />
              <div className={styles.sigLabel}>
                <strong>Aether Agency Representative</strong><br />
                <span>Authorized via Workspace Cryptographic Token</span>
              </div>
            </div>

            <div className={styles.sigCard}>
              {proposal.status === 'Accepted' ? (
                <div className={styles.acceptedSignature}>
                  <ShieldCheck size={28} style={{ color: '#10b981' }} />
                  <span>Authorized Electronically by {proposal.client}</span>
                </div>
              ) : (
                <div className={styles.sigLine} />
              )}
              <div className={styles.sigLabel}>
                <strong>{proposal.client} Signee</strong><br />
                <span>Acceptance of terms</span>
              </div>
            </div>
          </div>

          <div className={styles.docFooter}>
            <p>This proposal is a binding contract once accepted by the client signee above.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
