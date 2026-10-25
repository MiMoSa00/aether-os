'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { SalesRevenueChart } from '@/components/Visuals/SalesRevenueChart';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, CheckCircle, Clock, Zap, ArrowUpRight,
  Sparkles, UserPlus, FilePlus, Receipt, Wallet, ArrowRight,
  KanbanSquare, BarChart3, Circle, AlertCircle, CheckCircle2,
  Plus, MessageSquare, Info
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import styles from './dashboard.module.css';

/* ─── KPI Card Component ────────────────────────────── */
interface KPICardProps {
  label: string;
  value: string;
  delay?: number;
}

const KPICard = ({ label, value, delay = 0 }: KPICardProps) => {
  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
    </motion.div>
  );
};

export default function Dashboard() {
  const { clients, tasks, columns, invoices, timeEntries, expenses, payments, user, addInvoice, addNotification } = useData();

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Dynamic time-of-day greeting for the Director
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Director.';
    if (hour < 17) return 'Good afternoon, Director.';
    return 'Good evening, Director.';
  }, []);

  // Outstanding ₦ (Pending + Overdue invoices)
  const outstandingAmount = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  }, [invoices]);

  // Revenue ₦ (Paid invoices)
  const totalInvoiced = useMemo(() => {
    const invoiceSum = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
    const paymentSum = (payments || [])
      .filter(pmt => pmt.status === 'success')
      .reduce((sum, pmt) => sum + (pmt.amount_ngn || 0), 0);
    return invoiceSum + paymentSum;
  }, [invoices, payments]);

  // Active Tasks count (todo + in-progress)
  const activeTasksCount = useMemo(() => {
    const todoCount = columns['todo']?.taskIds?.length || 0;
    const progCount = columns['in-progress']?.taskIds?.length || 0;
    return todoCount + progCount;
  }, [columns]);

  // Billable Hours sum
  const totalBillableHours = useMemo(() => {
    const secs = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0);
    return Math.round(secs / 3600);
  }, [timeEntries]);

  // Recent activity stream with icons
  const recentActivity = useMemo(() => {
    const list: any[] = [];
    invoices.forEach(inv => list.push({
      title: inv.status === 'Paid' ? `Invoice Paid: ${inv.client}` : `Invoice Sent: ${inv.id}`,
      time: inv.date,
      type: inv.status,
      amount: parseAmount(inv.amount),
      icon: inv.status === 'Paid' ? CheckCircle2 : Receipt,
      isPositive: inv.status === 'Paid',
      rawDate: new Date(inv.date),
      meta: inv.status
    }));
    expenses.forEach(exp => list.push({
      title: `Expense: ${exp.name}`,
      time: exp.date,
      type: `Expense`,
      amount: -parseAmount(exp.amount),
      icon: Wallet,
      isPositive: false,
      rawDate: new Date(exp.date),
      meta: exp.category
    }));
    timeEntries.forEach(entry => {
      const hrs = entry.duration / 3600;
      list.push({
        title: `${hrs.toFixed(1)} hrs tracked for ${entry.client}`,
        time: entry.date,
        type: 'Time Logged',
        amount: entry.billable ? hrs * entry.rate : 0,
        icon: Clock,
        isPositive: true,
        rawDate: new Date(entry.date),
        meta: entry.billable ? 'Billable' : 'Internal'
      });
    });
    return list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 4);
  }, [invoices, expenses, timeEntries]);

  // Generate dynamic AI suggestion prompts based on live client status
  const aiSuggestions = useMemo(() => {
    const list: Array<{ text: string; actionText?: string; onAction?: () => void }> = [];

    // Prompt 1: Tracked hours to invoice conversion
    const unbilledEntries = timeEntries.filter(e => e.billable);
    if (unbilledEntries.length > 0) {
      const totalUnbilledVal = unbilledEntries.reduce((sum, entry) => sum + (entry.duration / 3600) * entry.rate, 0);
      const uniqueClient = unbilledEntries[0].client;
      list.push({
        text: `AI Suggestion: Draft invoice for ${uniqueClient} based on unbilled hours value of ₦${Math.round(totalUnbilledVal).toLocaleString()}.`,
        actionText: 'Review Draft',
        onAction: async () => {
          const hoursTotal = unbilledEntries.reduce((s, e) => s + e.duration, 0);
          const valTotal = unbilledEntries.reduce((s, e) => s + (e.duration / 3600) * e.rate, 0);
          
          await addInvoice(
            uniqueClient, 
            String(Math.round(valTotal)), 
            undefined, 
            [{ description: `Tracked work: ${(hoursTotal / 3600).toFixed(1)} hours`, qty: 1, unitPrice: Math.round(valTotal), total: Math.round(valTotal) }],
            'Generated from unbilled time log.'
          );
          alert(`Draft invoice successfully created for ${uniqueClient}!`);
        }
      });
    }

    // Prompt 2: Overhead expenses checking
    const highExpense = expenses.find(e => parseAmount(e.amount) > 100000);
    if (highExpense) {
      list.push({
        text: `Expense warning: "${highExpense.name}" exceeded typical threshold (₦${parseAmount(highExpense.amount).toLocaleString()}).`
      });
    }

    // Default suggestions
    if (list.length === 0) {
      list.push({
        text: 'All operational parameters look nominal. Consider reviewing project pipelines for Q3.'
      });
    }

    return list;
  }, [timeEntries, expenses, addInvoice]);

  return (
    <div className={styles.container}>

      {/* Header Greeting */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <h1 className={styles.title}>{greetingText}</h1>
          <p className={styles.subtitle}>Here is your operational overview for today.</p>
        </div>
        <div className={styles.statusBadge}>
          <Zap size={13} style={{ color: '#10b981' }} />
          Active
        </div>
      </motion.header>

      {/* KPI Card Grid (Outstanding, Revenue, Tasks, Hours) */}
      <section className={styles.statsGrid}>
        <KPICard label="Outstanding ₦" value={outstandingAmount > 0 ? outstandingAmount.toLocaleString() : '0'} delay={0.1} />
        <KPICard label="Revenue ₦" value={totalInvoiced > 0 ? totalInvoiced.toLocaleString() : '0'} delay={0.15} />
        <KPICard label="Active Tasks" value={String(activeTasksCount)} delay={0.2} />
        <KPICard label="Billable Hours" value={String(totalBillableHours)} delay={0.25} />
      </section>

      {/* Bento Section: AI Insights & Recent Activity */}
      <section className={styles.bentoSectionGrid}>
        
        {/* Aether AI Insights */}
        <div className={styles.aiCardCol}>
          <div className={styles.aiHeader}>
            <Sparkles size={18} style={{ color: '#d97706' }} />
            <h2 className={styles.aiTitle}>Aether AI Insights</h2>
          </div>
          <div className={styles.aiCardContentList}>
            {aiSuggestions.map((sug, i) => (
              <div key={i} className={styles.aiSuggestItem}>
                <p className={styles.aiSuggestText}>{sug.text}</p>
                {sug.actionText && sug.onAction && (
                  <button onClick={sug.onAction} className={styles.aiSuggestBtn}>
                    {sug.actionText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentActivityCol}>
          <div className={styles.panelHeaderRow}>
            <h2 className={styles.panelTitle}>Recent Activity</h2>
            <Link href="/invoices" className={styles.panelHeaderLink}>
              View All
            </Link>
          </div>
          <div className={styles.activityFeed}>
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className={styles.feedRow}>
                    <div className={styles.feedIconBox}>
                      <Icon size={15} />
                    </div>
                    <div className={styles.feedInfo}>
                      <div className={styles.feedTitle}>{act.title}</div>
                      <div className={styles.feedTime}>{act.time} &bull; {act.meta}</div>
                    </div>
                    <span className={act.amount > 0 ? styles.feedValuePositive : styles.feedValueNegative}>
                      {act.amount !== 0 ? (act.amount > 0 ? '+' : '-') + `₦${Math.abs(Math.round(act.amount)).toLocaleString()}` : ''}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyNote}>No activity logged yet.</div>
            )}
          </div>
        </div>

      </section>

      {/* Sales & Revenue Overview Chart */}
      <section className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <BarChart3 size={18} style={{ color: '#6366f1' }} />
          <h3 className={styles.chartTitleText}>Sales &amp; Revenue Overview</h3>
        </div>
        <p className={styles.chartDescText}>Monthly breakdown of collects, expenses, and net profit margins.</p>
        <div style={{ minHeight: '280px' }}>
          <SalesRevenueChart />
        </div>
      </section>

    </div>
  );
}
