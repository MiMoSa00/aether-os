'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { TrendingUp, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './finance.module.css';

export default function FinancePage() {
  const { invoices } = useData();

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g,"")) || 0;

  const paidRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const pendingRevenue = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  return (
    <ModulePage 
      title="Finance" 
      subtitle="Analyze your agency's revenue nodes and Naira growth curves." 
      icon={TrendingUp}
    >
      <div className={styles.container}>
        
        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          
          <div className={`${styles.metricCard} ${styles.realizedCard}`}>
            <div className={`${styles.metricHeader} ${styles.realizedHeader}`}>
              <DollarSign size={24} />
              <span>Realized Revenue</span>
            </div>
            <div className={styles.metricValue}>
              ₦{paidRevenue.toLocaleString()}
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.pendingCard}`}>
            <div className={`${styles.metricHeader} ${styles.pendingHeader}`}>
              <Clock size={24} />
              <span>Pending Settlements</span>
            </div>
            <div className={styles.metricValue}>
              ₦{pendingRevenue.toLocaleString()}
            </div>
          </div>

        </div>

        {/* Actions & Recent */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h3 className={styles.recentTitle}>Financial Nodes</h3>
            <Link 
              href="/invoices" 
              className={styles.generateBtn}
            >
              Generate Settlement <ArrowRight size={16} />
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div className={styles.emptyState}>
              <TrendingUp size={48} className={styles.emptyIcon} />
              <p>No financial data detected. Generate a settlement to begin tracking.</p>
            </div>
          ) : (
            <div className={styles.recentList}>
              {invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className={styles.invoiceItem}>
                  <div>
                    <div className={styles.invoiceClient}>{inv.client}</div>
                    <div className={styles.invoiceMeta}>{inv.id} • {inv.date}</div>
                  </div>
                  <div className={styles.invoiceItemRight}>
                    <div className={styles.invoiceAmount}>{inv.amount}</div>
                    <div className={inv.status === 'Paid' ? styles.statusPaid : styles.statusPending}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ModulePage>
  );
}
