'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard/dashboard.module.css';
import { FileSignature, CheckCircle2, PenTool, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useClientContracts } from '@/lib/useClientData';

export default function ClientContractsPage() {
  const { contracts, loading, error, signContract } = useClientContracts();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedContractToSign, setSelectedContractToSign] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const handleSignClick = (contractId: string) => {
    setSelectedContractToSign(contractId);
    setShowConfirmModal(true);
  };

  const handleConfirmSign = async () => {
    if (!selectedContractToSign) return;
    
    setSigning(true);
    try {
      await signContract(selectedContractToSign);
      setShowConfirmModal(false);
      setSelectedContractToSign(null);
    } catch (err) {
      console.error('Error signing contract:', err);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.headerSection}>
          <span className={styles.clientPortalBadge}>CLIENT PORTAL / LEGAL</span>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Contracts & NDAs</h1>
            <Link href="/client-portal/dashboard" className={styles.projectHubBtn}>
              Back to Overview
            </Link>
          </div>
        </header>

        {loading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Contracts Yet</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Contracts will appear here once added by your director.</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{contract.contract_name}</h2>
                <span style={{
                  padding: '0.25rem 0.65rem',
                  background: contract.is_signed ? '#dcfce7' : '#fee2e2',
                  color: contract.is_signed ? '#166534' : '#991b1b',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {contract.is_signed ? 'Signed' : 'Awaiting Signature'}
                </span>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
                {contract.contract_type || 'Contract Document'}
              </p>

              {contract.is_signed && contract.signed_date && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Signed on {new Date(contract.signed_date).toLocaleDateString()}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!contract.is_signed ? (
                  <button 
                    onClick={() => handleSignClick(contract.id)}
                    className={styles.payOutstandingBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <PenTool size={16} /> Sign Document Electronically
                  </button>
                ) : (
                  <button 
                    onClick={() => alert('Downloading executed contract copy...')}
                    className={styles.viewAllDeliverablesBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Download size={16} /> Download Executed Copy
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Signature Confirmation Modal */}
      {showConfirmModal && (
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
        }} onClick={() => setShowConfirmModal(false)}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            background: 'var(--bg-surface-bright)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            boxShadow: 'var(--modal-shadow)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Confirm Signature
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to electronically sign this document? This action is permanent and will be timestamped.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedContractToSign(null);
                }}
                disabled={signing}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: signing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSign}
                disabled={signing}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f6c445',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: signing ? 'not-allowed' : 'pointer'
                }}
              >
                {signing ? 'Signing...' : 'Yes, Sign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
