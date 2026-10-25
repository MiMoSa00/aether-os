'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Users, Plus, Mail, Phone, Shield } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { ToastContainer, ToastData, ToastVariant } from '@/components/Toast/Toast';

import styles from './clients.module.css';

export default function ClientsPage() {
  const { clients, addClient, invoices } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClientForInvite, setSelectedClientForInvite] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const pushToast = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, variant, title, message, duration: 4500 }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, "")) || 0;

  const handleAdd = () => {
    if (name && email) {
      addClient(name, 'Client Partner', email, 'N/A');
      setName('');
      setEmail('');
      setShowAdd(false);
    }
  };

  const buildInviteUrl = (clientName: string, clientEmail: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${baseUrl}/client-portal/accept-invite?client=${encodeURIComponent(clientName)}&email=${encodeURIComponent(clientEmail)}`;
  };

  const handleSendInvite = async () => {
    if (!selectedClientForInvite) return;
    setSending(true);

    const inviteUrl = buildInviteUrl(selectedClientForInvite.name, selectedClientForInvite.email);

    try {
      const res = await fetch('/api/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedClientForInvite.name,
          clientEmail: selectedClientForInvite.email,
          inviteUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        pushToast('success', 'Invite sent', `Invitation delivered to ${selectedClientForInvite.email}`);
        setShowInviteModal(false);
      } else {
        pushToast('error', 'Could not send invite', data.error || 'Please try again or copy the link manually.');
      }
    } catch (err: any) {
      pushToast('error', 'Network error', err?.message || 'Could not reach the invite service.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ModulePage 
      title="Clients" 
      subtitle="Manage your agency's client relationships and total billings." 
      icon={Users}
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className={styles.container}>
        <div className={styles.actionRow}>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'var(--accent-blue)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} /> Add New Client
          </button>
        </div>

        {showAdd && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Add New Client</h3>
            <div className={styles.formGrid}>
              <input 
                placeholder="Client Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formInput}
              />
              <input 
                placeholder="Contact Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
              />
              <div className={styles.formActions}>
                <button onClick={handleAdd} className={styles.submitBtn}>Add Client</button>
                <button onClick={() => setShowAdd(false)} className={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.clientsGrid}>
          {clients.length > 0 ? clients.map((client) => {
            const clientInvoices = invoices.filter(inv => inv.client === client.name);
            const invoiceCount = clientInvoices.length;
            const invoiceTotal = clientInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

            return (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar} />
                  <div className={styles.activeBadge}>
                    ACTIVE
                  </div>
                </div>
                <h3 className={styles.clientName}>{client.name}</h3>
                <p className={styles.clientRole}>{client.role}</p>
                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <Mail size={14} className={styles.detailIcon} /> 
                    <span className={styles.detailText}>{client.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Shield size={14} className={styles.detailIcon} /> 
                    <span className={styles.detailText}>Secure & Encrypted</span>
                  </div>
                </div>
                <div className={styles.clientStatsRow}>
                  <div className={styles.clientStat}>
                    <span className={styles.clientStatLabel}>Invoices</span>
                    <span className={styles.clientStatVal}>{invoiceCount}</span>
                  </div>
                  <div className={styles.clientStat}>
                    <span className={styles.clientStatLabel}>Total Billed</span>
                    <span className={styles.clientStatVal}>₦{invoiceTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => {
                      setSelectedClientForInvite(client);
                      setShowInviteModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.85rem',
                      background: 'var(--text-primary)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✉ Invite to Portal
                  </button>
                  <a 
                    href="/client-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.55rem 0.85rem',
                      background: 'var(--bg-surface-high)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Portal ↗
                  </a>
                </div>
              </div>
            );
          }) : (
            <div className={styles.emptyState}>
              <Users size={48} style={{ marginBottom: '1rem' }} />
              <p>No clients yet. Click "Add New Client" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && selectedClientForInvite && (
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
        }} onClick={() => !sending && setShowInviteModal(false)}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-surface-bright)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            boxShadow: 'var(--modal-shadow)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Invite {selectedClientForInvite.name} to Portal
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Send this link to the client to set their password and access their dedicated portal.
                </p>
              </div>
              <button 
                onClick={() => !sending && setShowInviteModal(false)} 
                disabled={sending}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: sending ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Client Email
                </label>
                <input 
                  type="text" 
                  value={selectedClientForInvite.email} 
                  disabled 
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-low)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Dedicated Client Invitation Link
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    readOnly
                    value={buildInviteUrl(selectedClientForInvite.name, selectedClientForInvite.email)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface-low)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button 
                    onClick={() => {
                      const url = buildInviteUrl(selectedClientForInvite.name, selectedClientForInvite.email);
                      navigator.clipboard?.writeText(url);
                      setCopied(true);
                      pushToast('info', 'Link copied', 'Share it with the client manually if needed.');
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: copied ? '#16a34a' : 'var(--text-primary)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div style={{
                padding: '0.85rem',
                background: 'var(--bg-surface-low)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                🔒 <strong>Security Model:</strong> Clients cannot register publicly. Only invited partners with valid links can establish a portal password and view their project deliverables, contracts, and invoices.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <a 
                  href="/client-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.84rem',
                    color: '#d97706',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Launch Client Portal in New Tab ↗
                </a>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    disabled={sending}
                    style={{
                      padding: '0.65rem 1.15rem',
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.5 : 1
                    }}
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleSendInvite}
                    disabled={sending}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: '#f6c445',
                      color: '#111827',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Email Invite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  );
}
