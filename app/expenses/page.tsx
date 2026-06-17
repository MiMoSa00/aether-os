'use client';

import React, { useState, useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { Wallet, Plus, Trash2, DollarSign, ArrowDownRight, Tag, Users, Percent } from 'lucide-react';
import { useData } from '@/context/DataContext';
import styles from './expenses.module.css';

export default function ExpensesPage() {
  const { clients, expenses, invoices, addExpense, deleteExpense } = useData();

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Software' | 'Travel' | 'Equipment' | 'Marketing' | 'Other'>('Software');
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
  const profitMargin = totalInvoiced > 0 ? (netProfit / totalInvoiced) * 100 : 100;

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
    
    // Seed with existing clients
    clients.forEach(c => {
      clientMap[c.name] = { invoiced: 0, expenses: 0 };
    });

    // Add Invoiced
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

    // Add Expenses
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
        const pct = data.invoiced > 0 ? (net / data.invoiced) * 100 : data.expenses > 0 ? -100 : 100;
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
    addExpense(
      name,
      amount,
      category,
      client || 'Internal/None'
    );
    setName('');
    setAmount('');
    setClient('');
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  const stats = [
    { label: 'Total Expenses', value: fmt(totalSpent), sub: `${expenses.length} total entries`, color: '#f43f5e' },
    { label: 'This Month Spent', value: fmt(thisMonthSpent), sub: 'Current billing period', color: '#fb7185' },
    { label: 'Net Business Profit', value: fmt(netProfit), sub: `From paid invoices`, color: netProfit >= 0 ? '#10b981' : '#f43f5e' },
    { label: 'Profit Margin', value: `${Math.round(profitMargin)}%`, sub: 'Earnings kept', color: '#6366f1' },
  ];

  return (
    <ModulePage title="Expenses" subtitle="Track project costs, software tools, and client profitability." icon={Wallet}>
      <div className={styles.container}>
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.mainGrid}>
          {/* Left: Log Form + Log Entries */}
          <div className={styles.leftColumn}>
            
            {/* Add Expense Form */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Log New Expense</h3>
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
                      placeholder="e.g. 15000"
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
                      <option value="Software">Software & Subscriptions</option>
                      <option value="Travel">Travel & Lodging</option>
                      <option value="Equipment">Equipment & Tech</option>
                      <option value="Marketing">Marketing & Ads</option>
                      <option value="Other">Other Expenses</option>
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
                  <Plus size={16} /> Log Expense
                </button>
              </form>
            </div>

            {/* Expense Log */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Expense Log</h3>
              {expenses.length === 0 ? (
                <div className={styles.emptyState}>
                  <Wallet size={40} style={{ opacity: 0.2 }} />
                  <p>No expenses logged yet. Add your costs using the form above.</p>
                </div>
              ) : (
                <div className={styles.expenseList}>
                  {expenses.map(exp => (
                    <div key={exp.id} className={styles.expenseRow}>
                      <div className={styles.rowLeft}>
                        <div className={styles.expName}>{exp.name}</div>
                        <div className={styles.expMeta}>
                          <span className={styles.categoryBadge}>{exp.category}</span>
                          {exp.client && exp.client !== 'Internal/None' && (
                            <span className={styles.clientTag}>
                              <Users size={12} /> {exp.client}
                            </span>
                          )}
                          <span className={styles.dateText}>{exp.date}</span>
                        </div>
                      </div>
                      <div className={styles.rowRight}>
                        <div className={styles.expAmount}>{exp.amount}</div>
                        <button className={styles.deleteBtn} onClick={() => deleteExpense(exp.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right: Profit Margin / Client Analytics */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Profit Margin per Client</h3>
              <p className={styles.cardDesc}>Compares collected revenue against expenses linked to each client account.</p>

              {clientProfitability.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users size={32} style={{ opacity: 0.2 }} />
                  <p>No clients or invoicing data to compile profitability dashboard.</p>
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
