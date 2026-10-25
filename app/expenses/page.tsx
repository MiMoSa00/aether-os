'use client';

import React, { useState, useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { Wallet, Plus, Trash2, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import styles from './expenses.module.css';

export default function ExpensesPage() {
  const { clients, expenses, invoices, addExpense, deleteExpense } = useData();

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Software' | 'Travel' | 'Equipment' | 'Marketing' | 'Office Rent' | 'Other'>('Software');
  const [client, setClient] = useState('');

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Calculation helpers
  const totalInvoiced = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  }, [invoices]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
  }, [expenses]);

  const netProfit = totalInvoiced - totalSpent;
  const profitMargin = totalInvoiced > 0 ? (netProfit / totalInvoiced) * 100 : 0;

  // Monthly spent
  const thisMonthSpent = useMemo(() => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
    const currentYear = new Date().getFullYear();
    return expenses
      .filter(exp => {
        const d = new Date(exp.date);
        return !isNaN(d.getTime()) && 
               d.toLocaleString('en-US', { month: 'short' }) === currentMonth &&
               d.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
  }, [expenses]);

  // Client financial summary
  const clientProfitability = useMemo(() => {
    const clientMap: Record<string, { invoiced: number; expenses: number }> = {};
    
    clients.forEach(c => {
      clientMap[c.name] = { invoiced: 0, expenses: 0 };
    });

    invoices.forEach(inv => {
      if (inv.status === 'Paid') {
        const amt = parseAmount(inv.amount);
        if (clientMap[inv.client]) {
          clientMap[inv.client].invoiced += amt;
        } else {
          clientMap[inv.client] = { invoiced: amt, expenses: 0 };
        }
      }
    });

    expenses.forEach(exp => {
      if (exp.client && exp.client !== 'Internal/None') {
        const amt = parseAmount(exp.amount);
        if (clientMap[exp.client]) {
          clientMap[exp.client].expenses += amt;
        } else {
          clientMap[exp.client] = { invoiced: 0, expenses: amt };
        }
      }
    });

    return Object.entries(clientMap)
      .map(([name, data]) => {
        const net = data.invoiced - data.expenses;
        const pct = data.invoiced > 0 ? (net / data.invoiced) * 100 : data.expenses > 0 ? -100 : 0;
        return { name, invoiced: data.invoiced, expenses: data.expenses, net, pct };
      })
      .sort((a, b) => b.net - a.net);
  }, [clients, invoices, expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) {
      alert('Please fill in Name and Amount fields.');
      return;
    }
    addExpense(name, amount, category, client || 'Internal/None');
    setName('');
    setAmount('');
    setClient('');
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Software': return '💻';
      case 'Travel': return '✈️';
      case 'Equipment': return '🔧';
      case 'Marketing': return '📣';
      case 'Office Rent': return '🏢';
      default: return '📦';
    }
  };

  return (
    <ModulePage title="Expenses" subtitle="Track what you spend and see exactly how much profit you're making." icon={Wallet}>
      <div className={styles.container}>

        {/* ── Hero Profit Banner (inspired by reference design) ── */}
        <div className={styles.heroGrid}>
          {/* Net Profit Hero Card */}
          <div className={styles.heroProfitCard}>
            <div className={styles.heroBg}>₦</div>
            <div className={styles.heroContent}>
              <div className={styles.heroLabel}>Net Business Profit</div>
              <div className={styles.heroValue} style={{ color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                {fmt(netProfit)}
              </div>
              <div className={styles.heroRow}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Total Revenue Collected</span>
                  <span className={styles.heroStatValue}>{fmt(totalInvoiced)}</span>
                </div>
                <div className={styles.heroSeparator} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Total Expenses</span>
                  <span className={styles.heroStatValue} style={{ color: '#e11d48' }}>{fmt(totalSpent)}</span>
                </div>
                <div className={styles.heroBadge} style={{ background: netProfit >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                  {netProfit >= 0 ? <TrendingUp size={14} style={{ color: '#10b981' }} /> : <TrendingDown size={14} style={{ color: '#ef4444' }} />}
                  <span style={{ color: netProfit >= 0 ? '#10b981' : '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>
                    {Math.round(Math.abs(profitMargin))}% margin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#e11d48' }}>{fmt(totalSpent)}</div>
              <div className={styles.statLabel}>All-time Expenses</div>
              <div className={styles.statSub}>{expenses.length} total entries</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#f59e0b' }}>{fmt(thisMonthSpent)}</div>
              <div className={styles.statLabel}>This Month Spent</div>
              <div className={styles.statSub}>Current billing period</div>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left: Add Form + Recent Expenses */}
          <div className={styles.leftColumn}>

            {/* Add Expense Form */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Log New Expense</h3>
              <p className={styles.cardDesc}>Keep your records up to date by logging every cost.</p>
              <form onSubmit={handleAddExpense} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Expense Item</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Adobe Creative Cloud"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Amount (₦)</label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="e.g. 45000"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Category</label>
                    <select
                      className={styles.select}
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                    >
                      <option value="Software">💻 Software & Subscriptions</option>
                      <option value="Travel">✈️ Travel & Lodging</option>
                      <option value="Equipment">🔧 Equipment & Tech</option>
                      <option value="Marketing">📣 Marketing & Ads</option>
                      <option value="Office Rent">🏢 Office Rent</option>
                      <option value="Other">📦 Other Expenses</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Linked Client (Optional)</label>
                    <select
                      className={styles.select}
                      value={client}
                      onChange={e => setClient(e.target.value)}
                    >
                      <option value="">None / Internal Overhead</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Plus size={16} /> Add Expense
                </button>
              </form>
            </div>

            {/* Recent Expenses List */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Recent Expenses</h3>
              {expenses.length === 0 ? (
                <div className={styles.emptyState}>
                  <Wallet size={40} style={{ opacity: 0.2 }} />
                  <p>No expenses logged yet. Add your first cost using the form above.</p>
                </div>
              ) : (
                <div className={styles.expenseList}>
                  {expenses.map(exp => (
                    <div key={exp.id} className={styles.expenseRow}>
                      <div className={styles.expCategoryIcon}>{getCategoryIcon(exp.category)}</div>
                      <div className={styles.rowLeft}>
                        <div className={styles.expName}>{exp.name}</div>
                        <div className={styles.expMeta}>
                          <span className={styles.categoryBadge}>{exp.category}</span>
                          {exp.client && exp.client !== 'Internal/None' && (
                            <span className={styles.clientTag}>
                              <Users size={11} /> {exp.client}
                            </span>
                          )}
                          <span className={styles.dateText}>{exp.date}</span>
                        </div>
                      </div>
                      <div className={styles.rowRight}>
                        <div className={styles.expAmount}>{exp.amount}</div>
                        <button className={styles.deleteBtn} onClick={() => deleteExpense(exp.id)} title="Delete expense">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right: Profit Margin per Client */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Profit Margin per Client</h3>
              <p className={styles.cardDesc}>Revenue collected minus expenses linked to each client.</p>

              {clientProfitability.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users size={32} style={{ opacity: 0.2 }} />
                  <p>No client or invoice data to build a profitability report yet.</p>
                </div>
              ) : (
                <div className={styles.profitList}>
                  {clientProfitability.map((cp, idx) => {
                    const marginColor = cp.pct >= 70 ? '#10b981' : cp.pct >= 30 ? '#3b82f6' : cp.pct >= 0 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={idx} className={styles.profitItem}>
                        <div className={styles.profitHeader}>
                          <div className={styles.clientName}>{cp.name}</div>
                          <div className={styles.marginPercent} style={{ color: marginColor }}>
                            {cp.pct < 0 ? '-' : ''}{Math.round(Math.abs(cp.pct))}%
                          </div>
                        </div>
                        <div className={styles.profitSubRow}>
                          <span>Earned: {fmt(cp.invoiced)}</span>
                          <span>Spent: {fmt(cp.expenses)}</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: `${Math.max(0, Math.min(100, cp.pct))}%`,
                              backgroundColor: marginColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </ModulePage>
  );
}
