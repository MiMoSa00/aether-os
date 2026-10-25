'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { TrendingUp, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import styles from './SalesRevenueChart.module.css';

export function SalesRevenueChart() {
  const { invoices, payments, expenses } = useData();
  const [activeTab, setActiveTab] = useState<'revenue' | 'profit'>('revenue');

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Compute monthly data for the past 6 months
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    // Generate last 6 months list
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0,
        expense: 0,
        profit: 0
      };
    });

    const monthMap: Record<string, typeof months[0]> = {};
    months.forEach(m => { monthMap[m.key] = m; });

    // Sum paid invoices
    invoices.filter(inv => inv.status === 'Paid').forEach(inv => {
      const d = new Date(inv.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap[key]) {
          monthMap[key].revenue += parseAmount(inv.amount);
        }
      }
    });

    // Sum online subscription payments
    (payments || []).filter(pmt => pmt.status === 'success').forEach(pmt => {
      const d = new Date(pmt.created_at);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap[key]) {
          monthMap[key].revenue += (pmt.amount_ngn || 0);
        }
      }
    });

    // Sum expenses
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap[key]) {
          monthMap[key].expense += parseAmount(exp.amount);
        }
      }
    });

    // Calculate profit
    months.forEach(m => {
      m.profit = Math.max(0, m.revenue - m.expense);
    });

    // If zero across all months, provide realistic baseline proportions for a polished empty view
    const totalRev = months.reduce((s, m) => s + m.revenue, 0);
    return { months, totalRev };
  }, [invoices, payments, expenses]);

  const maxVal = useMemo(() => {
    const vals = chartData.months.map(m => activeTab === 'revenue' ? m.revenue : m.profit);
    return Math.max(...vals, 100000);
  }, [chartData, activeTab]);

  return (
    <div className={styles.container}>
      {/* Top Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.tabGroup}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'revenue' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            Total Revenue
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'profit' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profit')}
          >
            Net Profit
          </button>
        </div>

        <div className={styles.badge}>
          <TrendingUp size={14} style={{ color: '#10b981' }} />
          <span>Last 6 Months</span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className={styles.chartArea}>
        <div className={styles.barsContainer}>
          {chartData.months.map((m, i) => {
            const currentVal = activeTab === 'revenue' ? m.revenue : m.profit;
            const heightPct = Math.max(8, Math.round((currentVal / maxVal) * 100));

            return (
              <div key={i} className={styles.barColumn}>
                <div className={styles.barTrack}>
                  {/* Tooltip on hover */}
                  <div className={styles.barTooltip}>
                    <div className={styles.tooltipLabel}>{m.label} {m.year}</div>
                    <div className={styles.tooltipVal}>₦{currentVal.toLocaleString()}</div>
                    {m.expense > 0 && (
                      <div className={styles.tooltipSub}>Expenses: ₦{m.expense.toLocaleString()}</div>
                    )}
                  </div>

                  <div 
                    className={`${styles.barFill} ${activeTab === 'profit' ? styles.profitFill : styles.revenueFill}`}
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className={styles.barCap} />
                  </div>
                </div>

                <div className={styles.colLabel}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className={styles.chartFooter}>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>6-Month {activeTab === 'revenue' ? 'Revenue' : 'Profit'}</span>
          <span className={styles.footerValue}>
            ₦{chartData.months.reduce((acc, m) => acc + (activeTab === 'revenue' ? m.revenue : m.profit), 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.footerLegend}>
          <div className={styles.legendDot} style={{ background: activeTab === 'profit' ? '#10b981' : '#fed65b' }} />
          <span>{activeTab === 'revenue' ? 'Paid Inflow (₦)' : 'Realized Profit (₦)'}</span>
        </div>
      </div>
    </div>
  );
}
