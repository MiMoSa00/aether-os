'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard/dashboard.module.css';
import { FileText, CheckCircle2, CreditCard, Download, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useClientInvoices, usePaystackCheckout } from '@/lib/useClientData';

export default function ClientInvoicesPage() {
  const { invoices, loading, error, updateInvoice, setInvoices } = useClientInvoices();
  const { initializePayment, loading: paymentLoading } = usePaystackCheckout();
  const [paySuccess, setPaySuccess] = useState(false);

  // Check for successful payment in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    
    if (reference) {
      // Verify payment with backend
      verifyAndUpdatePayment(reference);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const verifyAndUpdatePayment = async (reference: string) => {
    try {
      // Find the unpaid invoice from the current invoices
      const unpaidInvoice = invoices.find(inv => inv.status === 'unpaid');
      if (!unpaidInvoice) return;

      // Verify with backend
      const res = await fetch('/api/client/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          invoice_id: unpaidInvoice.id
        })
      });

      if (res.ok) {
        // Update local state
        setInvoices(invoices.map(inv => 
          inv.id === unpaidInvoice.id 
            ? { ...inv, status: 'paid', paystack_reference: reference, paid_date: new Date().toISOString() }
            : inv
        ));
        setPaySuccess(true);
        setTimeout(() => setPaySuccess(false), 4000);
      }
    } catch (err) {
      console.error('Payment verification error:', err);
    }
  };

  const handlePay = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    try {
      const paymentData = await initializePayment(invoiceId, invoice.amount_ngn);
      if (paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url;
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.headerSection}>
          <span className={styles.clientPortalBadge}>CLIENT PORTAL / BILLING</span>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Invoices & Settlements</h1>
            <Link href="/client-portal/dashboard" className={styles.projectHubBtn}>
              Back to Overview
            </Link>
          </div>
        </header>

        {paySuccess && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} />
            <span>Invoice payment processed via Paystack gateway!</span>
          </div>
        )}

        {loading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Invoices</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Your invoices will appear here once generated.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {invoices.map((inv) => (
              <div key={inv.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardTitle}>{inv.invoice_number}</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{inv.description}</p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.65rem',
                    background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                    color: inv.status === 'paid' ? '#166534' : '#991b1b',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {inv.status.toUpperCase()}
                  </span>
                </div>

                <div className={styles.financialRow}>
                  <span className={styles.finLabel}>Issue Date</span>
                  <span className={styles.finValue}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.financialRow}>
                  <span className={styles.finLabel}>Total Due</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₦{inv.amount_ngn.toLocaleString()}
                  </span>
                </div>

                {inv.status === 'unpaid' ? (
                  <button 
                    onClick={() => handlePay(inv.id)}
                    disabled={paymentLoading}
                    className={styles.payOutstandingBtn}
                  >
                    {paymentLoading ? 'Processing...' : 'Pay via Paystack'}
                  </button>
                ) : (
                  <button 
                    onClick={() => alert('Downloading official PDF receipt...')}
                    className={styles.viewAllDeliverablesBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Download size={16} /> Download Receipt (PDF)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
