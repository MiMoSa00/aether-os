'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import styles from './invoices.module.css';

export default function InvoicesPage() {
  const { invoices, clients, addInvoice, updateInvoiceStatus } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    console.log('Attempting to initialize invoice:', { selectedClient, amount });
    if (!selectedClient || !amount) {
      alert('Neural link incomplete: Please select a client node and specify a settlement amount.');
      return;
    }
    
    addInvoice(selectedClient, amount);
    setSelectedClient('');
    setAmount('');
    setShowAdd(false);
  };

  return (
    <ModulePage 
      title="Invoices" 
      subtitle="Track your agency's financial flow and Naira settlements." 
      icon={FileText}
    >
      <div className={styles.container}>
        <div className={styles.actionRow}>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className={styles.generateBtn}
          >
            <Plus size={18} /> Generate Invoice
          </button>
        </div>

        {showAdd && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>New Financial Settlement</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Select Client Node</label>
                <select 
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Choose a client...</option>
                  {clients.length > 0 ? (
                    clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                  ) : (
                    <option disabled>No client nodes detected...</option>
                  )}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Amount (₦)</label>
                <input 
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formActions}>
                <button onClick={handleAdd} className={styles.submitBtn}>Initialize Invoice</button>
                <button onClick={() => setShowAdd(false)} className={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.invoiceList}>
          {invoices.length > 0 ? invoices.map((inv) => (
            <div key={inv.id} className={styles.invoiceItem}>
              <div className={styles.leftSection}>
                <div className={styles.iconWrapper}>
                  <FileText size={20} />
                </div>
                <div className={styles.infoDetails}>
                  <div className={styles.clientName}>{inv.client}</div>
                  <div className={styles.metaText}>{inv.id} • {inv.date}</div>
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.amount}>{inv.amount}</div>
                <div 
                  onClick={() => updateInvoiceStatus(inv.id, inv.status === 'Paid' ? 'Pending' : 'Paid')}
                  className={`${styles.statusBadge} ${inv.status === 'Paid' ? styles.statusPaid : styles.statusPending}`}
                >
                  {inv.status === 'Paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {inv.status.toUpperCase()}
                </div>
              </div>
            </div>
          )) : (
            <div className={styles.emptyState}>
              <FileText size={48} className={styles.emptyIcon} />
              <p>No financial settlements found in your agency nodes.</p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  );
}
