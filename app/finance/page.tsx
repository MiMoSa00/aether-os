'use client';

import React, { useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { TrendingUp, DollarSign, Clock, ArrowRight, ShieldAlert, ArrowUpRight, BarChart3, Wallet } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './finance.module.css';

export default function FinancePage() {
  const { invoices, expenses, payments } = useData();

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, "")) || 0;

  // Realized Revenue (Paid Invoices + Subscription Payments)
  const paidRevenue = useMemo(() => {
    const invoiceSum = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

    const paymentSum = (payments || [])
      .filter(pmt => pmt.status === 'success')
      .reduce((sum, pmt) => sum + (pmt.amount_ngn || 0), 0);

    return invoiceSum + paymentSum;
  }, [invoices, payments]);

  // Pending Settlement (Pending Invoices)
  const pendingRevenue = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Pending')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  }, [invoices]);

  // Business Expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
  }, [expenses]);

  // Net Profit
  const netProfit = paidRevenue - totalExpenses;

  // Monthly revenue logic (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    invoices
      .filter(inv => inv.status === 'Paid')
      .forEach(inv => {
        const d = new Date(inv.date);
        const key = isNaN(d.getTime()) ? 'Unknown' : monthNames[d.getMonth()];
        months[key] = (months[key] || 0) + parseAmount(inv.amount);
      });

    (payments || [])
      .filter(pmt => pmt.status === 'success')
      .forEach(pmt => {
        const d = new Date(pmt.created_at);
        const key = isNaN(d.getTime()) ? 'Unknown' : monthNames[d.getMonth()];
        months[key] = (months[key] || 0) + (pmt.amount_ngn || 0);
      });

    const now = new Date();
    const last6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return monthNames[d.getMonth()];
    });

    return last6.map(m => ({ month: m, amount: months[m] || 0 }));
  }, [invoices, payments]);

  const maxBar = Math.max(...monthlyRevenue.map(m => m.amount), 1);

  return (
    <ModulePage 
      title="Finance Core" 
      subtitle="Track your agency net earnings, pending settlements, and software costs." 
      icon={TrendingUp}
    >
      <div className={styles.container}>
        
        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          
          <div className={`${styles.metricCard} ${styles.realizedCard}`}>
            <div className={`${styles.metricHeader} ${styles.realizedHeader}`}>
              <DollarSign size={20} />
              <span>Realized Revenue</span>
            </div>
            <div className={styles.metricValue}>
              ₦{paidRevenue.toLocaleString()}
            </div>
            <span className={styles.metricSubtext}>Paid client invoices</span>
          </div>

          <div className={`${styles.metricCard} ${styles.pendingCard}`}>
            <div className={`${styles.metricHeader} ${styles.pendingHeader}`}>
              <Clock size={20} />
              <span>Pending Settlements</span>
            </div>
            <div className={styles.metricValue}>
              ₦{pendingRevenue.toLocaleString()}
            </div>
            <span className={styles.metricSubtext}>Awaiting client clearance</span>
          </div>

          <div className={`${styles.metricCard} ${styles.expensesCard}`}>
            <div className={`${styles.metricHeader} ${styles.expensesHeader}`}>
              <Wallet size={20} />
              <span>Logged Expenses</span>
            </div>
            <div className={styles.metricValue}>
              ₦{totalExpenses.toLocaleString()}
            </div>
            <span className={styles.metricSubtext}>Software, ads, and overhead</span>
          </div>

          <div className={`${styles.metricCard} ${styles.profitCard}`} style={{ borderColor: netProfit >= 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)', background: netProfit >= 0 ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)' }}>
            <div className={styles.metricHeader} style={{ color: netProfit >= 0 ? '#10b981' : '#f43f5e' }}>
              <TrendingUp size={20} />
              <span>Net Profit</span>
            </div>
            <div className={styles.metricValue} style={{ color: netProfit >= 0 ? '#10b981' : '#f43f5e' }}>
              ₦{netProfit.toLocaleString()}
            </div>
            <span className={styles.metricSubtext}>Realized cash minus expenses</span>
          </div>

        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Monthly Business Inflow</h3>
              <p className={styles.chartSub}>Collected payments over the last 6 months</p>
            </div>
            <BarChart3 size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          
          {paidRevenue === 0 ? (
            <div className={styles.emptyChart}>
              <BarChart3 size={40} style={{ opacity: 0.15 }} />
              <p>No paid invoices recorded. Mark your invoices as Paid to see statistical charts.</p>
            </div>
          ) : (
            <div className={styles.barChart}>
              {monthlyRevenue.map((m, i) => (
                <div key={i} className={styles.barGroup}>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ height: `${Math.max((m.amount / maxBar) * 100, m.amount > 0 ? 5 : 0)}%` }}
                      title={`₦${m.amount.toLocaleString()}`}
                    />
                  </div>
                  <div className={styles.barLabel}>{m.month}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions & Recent */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h3 className={styles.recentTitle}>Recent Invoices</h3>
            <Link 
              href="/invoices" 
              className={styles.generateBtn}
            >
              New Invoice <ArrowRight size={16} />
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div className={styles.emptyState}>
              <TrendingUp size={48} className={styles.emptyIcon} />
              <p>No invoices yet. Create your first invoice to start tracking revenue.</p>
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
