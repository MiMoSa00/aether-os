'use client';

import React, { useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { BarChart3, TrendingUp, FileText, Users, CheckCircle, DollarSign, ArrowUpRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './reports.module.css';

export default function ReportsPage() {
  const { invoices, clients, tasks, columns, payments } = useData();

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Revenue calculations
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
  const invoiceRevenue = paidInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  
  const successfulPayments = (payments || []).filter(pmt => pmt.status === 'success');
  const paymentRevenue = successfulPayments.reduce((sum, pmt) => sum + (pmt.amount_ngn || 0), 0);

  const totalRevenue = invoiceRevenue + paymentRevenue;
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const totalAll = totalRevenue + totalPending;

  // Completed tasks
  const completedTasks = columns['done']?.taskIds?.length || 0;
  const totalTasks = Object.values(columns).reduce((sum, col) => sum + col.taskIds.length, 0);

  // Monthly revenue from paid invoices + subscription payments
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    paidInvoices.forEach(inv => {
      const d = new Date(inv.date);
      const key = isNaN(d.getTime()) ? 'Unknown' : monthNames[d.getMonth()];
      months[key] = (months[key] || 0) + parseAmount(inv.amount);
    });

    successfulPayments.forEach(pmt => {
      const d = new Date(pmt.created_at);
      const key = isNaN(d.getTime()) ? 'Unknown' : monthNames[d.getMonth()];
      months[key] = (months[key] || 0) + (pmt.amount_ngn || 0);
    });

    // Show last 6 months always
    const now = new Date();
    const last6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return monthNames[d.getMonth()];
    });

    return last6.map(m => ({ month: m, amount: months[m] || 0 }));
  }, [paidInvoices, successfulPayments]);

  const maxBar = Math.max(...monthlyRevenue.map(m => m.amount), 1);

  // Top clients by invoiced amount
  const clientRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => {
      map[inv.client] = (map[inv.client] || 0) + parseAmount(inv.amount);
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
  }, [invoices]);

  const maxClient = Math.max(...clientRevenue.map(c => c.amount), 1);

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  const stats = [
    { icon: DollarSign, label: 'Total Earned', value: fmt(totalRevenue), sub: `${paidInvoices.length} invoices & ${successfulPayments.length} payments`, color: '#22c55e' },
    { icon: TrendingUp, label: 'Pending Revenue', value: fmt(totalPending), sub: `${pendingInvoices.length} awaiting payment`, color: '#fbbf24' },
    { icon: Users, label: 'Total Clients', value: String(clients.length), sub: 'Active client accounts', color: '#60a5fa' },
    { icon: CheckCircle, label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`, sub: 'Across all projects', color: '#a78bfa' },
  ];

  return (
    <ModulePage title="Reports" subtitle="Track your agency's performance and revenue insights." icon={BarChart3}>
      <div className={styles.container}>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={20} />
                </div>
                <ArrowUpRight size={16} className={styles.arrow} />
              </div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.chartsRow}>
          {/* Monthly Revenue Bar Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Monthly Revenue</h3>
            <p className={styles.chartSub}>Paid invoices over the last 6 months</p>
            {totalRevenue === 0 ? (
              <div className={styles.emptyChart}>
                <BarChart3 size={40} style={{ opacity: 0.2 }} />
                <p>No paid invoices yet. Mark invoices as paid to see your revenue chart.</p>
              </div>
            ) : (
              <div className={styles.barChart}>
                {monthlyRevenue.map((m, i) => (
                  <div key={i} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <div
                        className={styles.bar}
                        style={{ height: `${Math.max((m.amount / maxBar) * 100, m.amount > 0 ? 4 : 0)}%` }}
                        title={fmt(m.amount)}
                      />
                    </div>
                    <div className={styles.barLabel}>{m.month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Breakdown */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Invoice Status</h3>
            <p className={styles.chartSub}>Paid vs pending breakdown</p>
            {invoices.length === 0 ? (
              <div className={styles.emptyChart}>
                <FileText size={40} style={{ opacity: 0.2 }} />
                <p>No invoices yet. <Link href="/invoices" style={{ color: '#60a5fa' }}>Create your first invoice</Link></p>
              </div>
            ) : (
              <>
                <div className={styles.donutWrap}>
                  <div className={styles.donutRing}>
                    <svg viewBox="0 0 36 36" className={styles.donutSvg}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.8" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="#22c55e" strokeWidth="3.8"
                        strokeDasharray={`${totalAll > 0 ? (totalRevenue / totalAll) * 100 : 0} 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className={styles.donutCenter}>
                      <span className={styles.donutPct}>{totalAll > 0 ? Math.round((totalRevenue / totalAll) * 100) : 0}%</span>
                      <span className={styles.donutCaptionText}>Collected</span>
                    </div>
                  </div>
                </div>
                <div className={styles.legendRow}>
                  <div className={styles.legendItem}><span className={styles.dot} style={{ background: '#22c55e' }} />Paid: {fmt(totalRevenue)}</div>
                  <div className={styles.legendItem}><span className={styles.dot} style={{ background: '#fbbf24' }} />Pending: {fmt(totalPending)}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className={styles.chartCard} style={{ marginTop: 0 }}>
          <h3 className={styles.chartTitle}>Top Clients by Revenue</h3>
          <p className={styles.chartSub}>Total invoiced amount per client</p>
          {clientRevenue.length === 0 ? (
            <div className={styles.emptyChart}>
              <Users size={40} style={{ opacity: 0.2 }} />
              <p>No client revenue data yet.</p>
            </div>
          ) : (
            <div className={styles.clientBars}>
              {clientRevenue.map((c, i) => (
                <div key={i} className={styles.clientBarRow}>
                  <div className={styles.clientBarName}>{c.name}</div>
                  <div className={styles.clientBarTrack}>
                    <div
                      className={styles.clientBarFill}
                      style={{ width: `${(c.amount / maxClient) * 100}%` }}
                    />
                  </div>
                  <div className={styles.clientBarAmt}>{fmt(c.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ModulePage>
  );
}
