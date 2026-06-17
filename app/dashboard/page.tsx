'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { VisualElement3D } from '@/components/Visuals/VisualElement3D';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, CheckCircle, Clock, Zap, Target, 
  ArrowUpRight, Sparkles, UserPlus, FilePlus, Receipt, 
  Wallet, Play, ArrowRight, KanbanSquare 
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import styles from './dashboard.module.css';

const StatCard = ({ icon: Icon, label, value, delta, color }: any) => {
  const colorMap: Record<string, string> = {
    blue: '#60a5fa',
    purple: '#a78bfa',
    green: '#34d399',
    orange: '#fb923c',
  };

  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <div className={styles.statIcon} style={{ background: `${colorMap[color]}12`, border: `1px solid ${colorMap[color]}20` }}>
          <Icon size={20} style={{ color: colorMap[color] }} />
        </div>
        {delta && (
          <div className={styles.delta}>
            <ArrowUpRight size={12} />
            {delta}
          </div>
        )}
      </div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
};

export default function Dashboard() {
  const { clients, tasks, columns, invoices, timeEntries, expenses, payments, user } = useData();

  // Helper to parse currency amount
  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Derive first name
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userName = fullName.split(' ')[0];

  // Dynamic calculations
  const totalInvoiced = useMemo(() => {
    const invoiceSum = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

    const paymentSum = (payments || [])
      .filter(pmt => pmt.status === 'success')
      .reduce((sum, pmt) => sum + (pmt.amount_ngn || 0), 0);

    return invoiceSum + paymentSum;
  }, [invoices, payments]);

  const activeClientsCount = clients.length;

  const completedTasksCount = useMemo(() => {
    return columns['done']?.taskIds?.length || 0;
  }, [columns]);

  const totalTasksCount = useMemo(() => {
    return Object.values(columns).reduce((sum, col) => sum + (col.taskIds?.length || 0), 0);
  }, [columns]);

  const totalHours = useMemo(() => {
    const secs = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return (secs / 3600).toFixed(1);
  }, [timeEntries]);

  // Unified activity stream
  const recentActivity = useMemo(() => {
    const list: any[] = [];
    
    invoices.forEach(inv => {
      list.push({
        title: `Invoice created for ${inv.client}`,
        time: inv.date,
        type: `Invoice (${inv.status})`,
        amount: parseAmount(inv.amount),
        isPositive: inv.status === 'Paid',
        rawDate: new Date(inv.date),
      });
    });

    expenses.forEach(exp => {
      list.push({
        title: `Expense: ${exp.name}`,
        time: exp.date,
        type: `Expense (${exp.category})`,
        amount: -parseAmount(exp.amount),
        isPositive: false,
        rawDate: new Date(exp.date),
      });
    });

    timeEntries.forEach(entry => {
      const hours = entry.duration / 3600;
      const earnings = entry.billable ? hours * entry.rate : 0;
      list.push({
        title: `Logged ${hours.toFixed(1)} hrs for ${entry.client}`,
        time: entry.date,
        type: 'Time Entry',
        amount: earnings,
        isPositive: true,
        rawDate: new Date(entry.date),
      });
    });

    (payments || []).forEach(pmt => {
      if (pmt.status === 'success') {
        const dateObj = new Date(pmt.created_at);
        const formattedDate = isNaN(dateObj.getTime())
          ? 'Just now'
          : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        list.push({
          title: `Subscription Payment: ${pmt.plan_id.toUpperCase()} Plan`,
          time: formattedDate,
          type: 'Subscription Payment',
          amount: pmt.amount_ngn,
          isPositive: true,
          rawDate: isNaN(dateObj.getTime()) ? new Date() : dateObj,
        });
      }
    });

    return list
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .slice(0, 5);
  }, [invoices, expenses, timeEntries, payments]);

  // Quick Action configuration
  const quickActions = [
    { label: 'Add Client', href: '/clients', icon: UserPlus, color: '#60a5fa' },
    { label: 'Create Invoice', href: '/invoices', icon: Receipt, color: '#34d399' },
    { label: 'New Task', href: '/tasks', icon: KanbanSquare, color: '#a78bfa' },
    { label: 'Draft Proposal', href: '/proposals', icon: FilePlus, color: '#f472b6' },
    { label: 'Log Expense', href: '/expenses', icon: Wallet, color: '#fbbf24' },
    { label: 'Ask AI Core', href: '/agent', icon: Sparkles, color: '#22d3ee' },
  ];

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <header className={styles.header}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.title}
          >
            Welcome back, {userName}
            <Sparkles size={24} className={styles.sparkleIcon} />
          </motion.h1>
          <p className={styles.subtitle}>Your agency dashboard is live. Monitor stats and take actions.</p>
        </div>
        <div className={styles.statusBadge}>
          <Zap size={14} style={{ color: '#10b981' }} />
          Workspace Active
        </div>
      </header>

      {/* Getting Started Callout if 0 Clients */}
      {clients.length === 0 && (
        <div className={styles.onboardingCard}>
          <div className={styles.onboardingLeft}>
            <Sparkles size={28} className={styles.onboardingSparkle} />
            <div>
              <h3>Quick Start Onboarding Sequence</h3>
              <p>Initialize your client node, Kanban task cards, and invoice parameters to sync the workspace dashboard.</p>
            </div>
          </div>
          <Link href="/onboarding" className={styles.onboardingBtn}>
            Configure Checklist <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className={styles.quickActionsSection}>
        <h3 className={styles.cardTitle}>Quick Actions</h3>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((act, i) => {
            const Icon = act.icon;
            return (
              <Link key={i} href={act.href} className={styles.quickActionBtn}>
                <div className={styles.quickIconBox} style={{ background: `${act.color}15`, color: act.color }}>
                  <Icon size={18} />
                </div>
                <span>{act.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className={styles.statsGrid}>
        <StatCard icon={TrendingUp} label="Total Paid Revenue" value={`₦${totalInvoiced.toLocaleString()}`} delta={totalInvoiced > 0 ? "Active" : ""} color="green" />
        <StatCard icon={Users} label="Active Clients" value={String(activeClientsCount)} delta={activeClientsCount > 0 ? `${activeClientsCount} total` : ""} color="blue" />
        <StatCard icon={CheckCircle} label="Completed Tasks" value={`${completedTasksCount}/${totalTasksCount}`} delta={totalTasksCount > 0 ? `${Math.round((completedTasksCount/totalTasksCount)*100)}%` : ""} color="purple" />
        <StatCard icon={Clock} label="Tracked Billable Hours" value={`${totalHours} hrs`} delta={timeEntries.length > 0 ? "Live" : ""} color="orange" />
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          {/* Revenue Overview chart block */}
          <div className={styles.projectionCard}>
            <h3 className={styles.cardTitle}>
              <Target size={20} style={{ color: '#818cf8' }} />
              Workspace Intelligence Feed
            </h3>
            <p className={styles.cardDesc}>Visualized neural activity showing client logs and system parameters.</p>
            <div style={{ height: '300px' }}>
              <VisualElement3D />
            </div>
          </div>

          {/* Unified Activity Logs */}
          <div className={styles.activityCard}>
            <h3 className={styles.cardTitle}>Workspace Activity Feed</h3>
            <div className={styles.activityList}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: any, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <CheckCircle size={18} />
                    </div>
                    <div className={styles.activityInfo}>
                      <div className={styles.activityTitle}>{activity.title}</div>
                      <div className={styles.activityMeta}>{activity.time} • {activity.type}</div>
                    </div>
                    <div className={styles.activityValue} style={{ color: activity.amount === 0 ? '#fff' : activity.isPositive ? '#10b981' : '#f43f5e' }}>
                      {activity.amount === 0 ? '' : activity.amount > 0 ? '+' : ''}
                      {activity.amount === 0 ? 'Free' : `₦${Math.abs(activity.amount).toLocaleString()}`}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, fontSize: '0.9rem' }}>
                  No recent activities recorded. Log some time or create an invoice to populate the feed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side panel */}
        <div className={styles.rightCol}>
          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Workspace Assistant</h3>
            <p className={styles.actionDesc}>Ask our embedded Claude AI core to draft responses, explain code structures, or map plans.</p>
            <Link href="/agent" className={styles.actionBtn}>
              Consult AI <ArrowUpRight size={18} />
            </Link>
            <Sparkles size={120} style={{ position: 'absolute', bottom: '-40px', right: '-40px', opacity: 0.1, transform: 'rotate(15deg)' }} />
          </div>

          <div className={styles.teamCard}>
            <h3 className={styles.cardTitle}>Client Node Synchronization</h3>
            <div className={styles.teamList}>
              {clients.length > 0 ? (
                clients.map((c) => (
                  <div key={c.id} className={styles.teamMember}>
                    <div className={styles.memberAvatar}>
                      <div className={`${styles.statusIndicator} ${styles.online}`} />
                    </div>
                    <div>
                      <div className={styles.memberName}>{c.name}</div>
                      <div className={styles.memberRole}>{c.role} • {c.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ opacity: 0.5, fontSize: '0.85rem', padding: '1rem 0' }}>
                  No active client nodes. Use the onboarding checklist or Add Client action.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
