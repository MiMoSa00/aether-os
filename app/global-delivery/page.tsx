'use client';

import React, { useState } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { Globe, DollarSign, Calculator, Send, ShieldAlert, Sparkles, Check } from 'lucide-react';
import styles from './global-delivery.module.css';

export default function GlobalDeliveryPage() {
  // Waitlist form state
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Calculator states
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [foreignAmount, setForeignAmount] = useState('1000');
  const [exchangeRate, setExchangeRate] = useState({ USD: 1510, EUR: 1620, GBP: 1910 });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }
    localStorage.setItem('aether_waitlist_email', email);
    setSubmitted(true);
  };

  const calculatedNaira = parseFloat(foreignAmount) * exchangeRate[currency] || 0;

  const features = [
    {
      title: 'Multi-Currency Settlement',
      desc: 'Receive client payments in USD, EUR, or GBP, cleared instantly to NGN via local gateways.',
      icon: DollarSign,
    },
    {
      title: 'Global Compliance Safeguard',
      desc: 'Automated warnings on tax withholdings, cross-border levies, and localized NDA clauses.',
      icon: ShieldAlert,
    },
    {
      title: 'AI Translation Core',
      desc: 'Instantly translate client briefs, requirements, and comments from any language into English.',
      icon: Sparkles,
    },
  ];

  return (
    <ModulePage title="Global Delivery" subtitle="Expand your agency reach across borders with localized multi-currency capabilities." icon={Globe}>
      <div className={styles.container}>
        
        {/* Banner */}
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>NEXT-GEN UPGRADE</span>
            <h2>Take Your Agency Global</h2>
            <p>Work with partners worldwide. Log invoices in dollars, manage offshore tasks, and receive local payouts seamlessly.</p>
          </div>
          <div className={styles.heroVisual}>
            <Globe className={styles.spinningGlobe} size={140} />
          </div>
        </div>

        {/* Feature Grid */}
        <div className={styles.featuresGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={styles.featureCard}>
                <div className={styles.iconBox}>
                  <Icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Calculator & Waitlist splits */}
        <div className={styles.splitGrid}>
          
          {/* Remittance Calculator */}
          <div className={styles.panelCard}>
            <div className={styles.panelTitle}>
              <Calculator size={18} className={styles.panelIcon} />
              <h3>Offshore Exchange Calculator</h3>
            </div>
            <p className={styles.panelDesc}>Estimate your revenue payouts. Check exchange conversions directly inside your workspace.</p>

            <div className={styles.calcForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Currency</label>
                <div className={styles.currencyToggle}>
                  {(['USD', 'EUR', 'GBP'] as const).map(curr => (
                    <button
                      key={curr}
                      type="button"
                      className={`${styles.toggleBtn} ${currency === curr ? styles.toggleActive : ''}`}
                      onClick={() => setCurrency(curr)}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Foreign Amount</label>
                <div className={styles.inputWithSymbol}>
                  <span className={styles.currencySymbol}>
                    {currency === 'USD' && '$'}
                    {currency === 'EUR' && '€'}
                    {currency === 'GBP' && '£'}
                  </span>
                  <input
                    type="number"
                    className={styles.calcInput}
                    value={foreignAmount}
                    onChange={e => setForeignAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Estimated NGN Payout (₦):</span>
                <span className={styles.resultValue}>₦{Math.round(calculatedNaira).toLocaleString()}</span>
              </div>
              <span className={styles.rateCaption}>Current conversion estimate: 1 {currency} = ₦{exchangeRate[currency]}</span>
            </div>
          </div>

          {/* Waitlist Panel */}
          <div className={styles.panelCard}>
            <div className={styles.panelTitle}>
              <Globe size={18} className={styles.panelIcon} style={{ color: '#818cf8' }} />
              <h3>Join waitlist for Beta</h3>
            </div>
            <p className={styles.panelDesc}>We are rolling out multi-currency payments and global compliance checklists in selected test workspaces next week.</p>

            {submitted ? (
              <div className={styles.successBox}>
                <div className={styles.successIconBox}>
                  <Check size={24} />
                </div>
                <h4>Request Received!</h4>
                <p>We've registered <strong>{email}</strong> for beta priority. You'll receive credentials when the next server sync initializes.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className={styles.waitlistForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Agency Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="you@agency.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  <Send size={14} /> Request Beta Access
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </ModulePage>
  );
}
