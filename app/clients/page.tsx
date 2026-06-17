'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Users, Plus, Mail, Phone, Shield } from 'lucide-react';
import { useState } from 'react';
import { useData } from '@/context/DataContext';

import styles from './clients.module.css';

export default function ClientsPage() {
  const { clients, addClient, invoices } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, "")) || 0;

  const handleAdd = () => {
    if (name && email) {
      addClient(name, 'Client Partner', email, 'N/A');
      setName('');
      setEmail('');
      setShowAdd(false);
    }
  };

  return (
    <ModulePage 
      title="Clients" 
      subtitle="Manage your agency's client relationships and total billings." 
      icon={Users}
    >
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
    </ModulePage>
  );
}
