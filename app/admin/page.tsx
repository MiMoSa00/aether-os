'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, TrendingUp, Activity, Shield, Search, RefreshCw, Eye, AlertTriangle, CheckCircle, Clock, UserX } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  subscription_status: string;
  plan_id: string;
  total_paid_ngn: number;
  message_count: number;
  payment_count: number;
}

interface AdminStats {
  total_users: number;
  active_subs: number;
  total_revenue_ngn: number;
  new_today: number;
}

interface Payment {
  id: string;
  user_id: string;
  amount_ngn: number;
  status: string;
  plan_id: string;
  created_at: string;
  paystack_reference: string;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminDashboard() {
  const { user } = useData();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'users' | 'payments'>('users');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Access control
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const fetchData = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-token': ADMIN_EMAIL! },
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.stats) setStats(data.stats);
      if (data.payments) setPayments(data.payments);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => `₦${n.toLocaleString()}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtTime = (d: string) => {
    if (!d) return 'Never';
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return fmtDate(d);
  };

  if (!user) return null;
  if (user.email !== ADMIN_EMAIL) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.shieldBadge}>
            <Shield size={18} />
            <span>Admin Console</span>
          </div>
          <h1 className={styles.title}>Aether OS — Developer Dashboard</h1>
          <p className={styles.subtitle}>Real-time visibility into all users, subscriptions, and payments</p>
        </div>
        <button onClick={fetchData} className={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spin : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}><Users size={20} /></div>
            <div className={styles.statNum}>{stats.total_users}</div>
            <div className={styles.statLabel}>Total Users</div>
          </motion.div>
          <motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}><CheckCircle size={20} /></div>
            <div className={styles.statNum}>{stats.active_subs}</div>
            <div className={styles.statLabel}>Active Subscriptions</div>
          </motion.div>
          <motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.statIcon} style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}><TrendingUp size={20} /></div>
            <div className={styles.statNum}>{fmt(stats.total_revenue_ngn)}</div>
            <div className={styles.statLabel}>Total Revenue</div>
          </motion.div>
          <motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className={styles.statIcon} style={{ background: 'rgba(0,210,255,0.12)', color: '#00f0ff' }}><Activity size={20} /></div>
            <div className={styles.statNum}>{stats.new_today}</div>
            <div className={styles.statLabel}>New Today</div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
          <Users size={15} /> Users ({users.length})
        </button>
        <button className={`${styles.tab} ${tab === 'payments' ? styles.tabActive : ''}`} onClick={() => setTab('payments')}>
          <CreditCard size={15} /> Payments ({payments.length})
        </button>
      </div>

      {/* Search */}
      {tab === 'users' && (
        <div className={styles.searchBar}>
          <Search size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            className={styles.searchInput}
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loadingState}><RefreshCw size={22} className={styles.spin} /><span>Loading users…</span></div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.emptyState}><UserX size={32} style={{ opacity: 0.3 }} /><span>No users found</span></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Paid</th>
                  <th>AI Msgs</th>
                  <th>Joined</th>
                  <th>Last Seen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userEmail}>{u.email}</div>
                          {u.full_name && <div className={styles.userName}>{u.full_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.planBadge} ${u.subscription_status === 'active' ? styles.planActive : styles.planFree}`}>
                        {u.subscription_status === 'active' ? u.plan_id : 'free'}
                      </span>
                    </td>
                    <td className={styles.moneyCell}>{u.total_paid_ngn > 0 ? fmt(u.total_paid_ngn) : '₦0'}</td>
                    <td>{u.message_count}</td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td>{fmtTime(u.last_sign_in_at)}</td>
                    <td>
                      <button className={styles.viewBtn} onClick={() => setSelectedUser(u)}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Payments Table */}
      {tab === 'payments' && (
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loadingState}><RefreshCw size={22} className={styles.spin} /><span>Loading payments…</span></div>
          ) : payments.length === 0 ? (
            <div className={styles.emptyState}>
              <CreditCard size={32} style={{ opacity: 0.3 }} />
              <span>No payments yet</span>
              <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>Payments will appear here once users subscribe</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User ID</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: Payment) => (
                  <tr key={p.id} className={styles.tableRow}>
                    <td><code className={styles.refCode}>{p.paystack_reference?.slice(0, 20)}…</code></td>
                    <td><code className={styles.refCode}>{p.user_id?.slice(0, 12)}…</code></td>
                    <td><span className={styles.planBadge}>{p.plan_id}</span></td>
                    <td className={styles.moneyCell}>{fmt(p.amount_ngn)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${p.status === 'success' ? styles.statusSuccess : styles.statusFailed}`}>
                        {p.status === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {p.status}
                      </span>
                    </td>
                    <td>{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)}>
            <motion.div className={styles.modal} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalAvatar}>{(selectedUser.full_name || selectedUser.email).slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className={styles.modalName}>{selectedUser.full_name || 'Unknown Name'}</div>
                  <div className={styles.modalEmail}>{selectedUser.email}</div>
                </div>
              </div>
              <div className={styles.modalGrid}>
                <div className={styles.modalItem}><span>Plan</span><strong>{selectedUser.plan_id}</strong></div>
                <div className={styles.modalItem}><span>Status</span><strong>{selectedUser.subscription_status}</strong></div>
                <div className={styles.modalItem}><span>Total Paid</span><strong>{fmt(selectedUser.total_paid_ngn)}</strong></div>
                <div className={styles.modalItem}><span>AI Messages</span><strong>{selectedUser.message_count}</strong></div>
                <div className={styles.modalItem}><span>Payments</span><strong>{selectedUser.payment_count}</strong></div>
                <div className={styles.modalItem}><span>Joined</span><strong>{fmtDate(selectedUser.created_at)}</strong></div>
                <div className={styles.modalItem}><span>Last Seen</span><strong>{fmtTime(selectedUser.last_sign_in_at)}</strong></div>
                <div className={styles.modalItem}><span>User ID</span><strong style={{ fontSize: '0.7rem' }}>{selectedUser.id}</strong></div>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedUser(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
