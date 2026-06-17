'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Shield, Zap, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './billing.module.css';

interface Subscription {
  plan_id: string;
  status: string;
  current_period_end: string;
}

interface Payment {
  id: string;
  amount_ngn: number;
  status: string;
  paystack_reference: string;
  created_at: string;
  plan_id: string;
}

export default function BillingPage() {
  return (
    <React.Suspense fallback={
      <div className={styles.centered}>
        <RefreshCw size={24} className={styles.spin} />
        <span>Loading session…</span>
      </div>
    }>
      <BillingContent />
    </React.Suspense>
  );
}

function BillingContent() {
  const { user } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dbError, setDbError] = useState(false);

  const reference = searchParams.get('reference');

  const fetchBillingData = async () => {
    if (!user) return;
    setLoading(true);
    setDbError(false);
    try {
      // Fetch sub
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('plan_id, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError && subError.code === '42P01') {
        // Table doesn't exist
        setDbError(true);
      } else if (subData) {
        setSubscription(subData as Subscription);
      }

      // Fetch payments
      const { data: pmtsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pmtsData) {
        setPayments(pmtsData as Payment[]);
      }
    } catch (err) {
      console.error('Billing fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Verify transaction if redirected back from Paystack
  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference || !user) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();
        if (data.success) {
          setVerifyStatus({
            type: 'success',
            message: `Successfully upgraded to ${data.plan_id.toUpperCase()}! Your account is now active.`,
          });
          // Clear query params
          router.replace('/billing');
        } else {
          setVerifyStatus({
            type: 'error',
            message: data.error || 'Payment verification failed. Please contact support.',
          });
        }
      } catch (err) {
        setVerifyStatus({
          type: 'error',
          message: 'Error verifying payment. Please try refreshing.',
        });
      } finally {
        fetchBillingData();
      }
    };

    if (reference && user) {
      verifyPayment();
    } else if (user) {
      fetchBillingData();
    }
  }, [user, reference]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          plan_id: planId,
          user_id: user.id,
          callback_url: `${window.location.origin}/billing`,
        }),
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || 'Could not initialize payment. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  const currentPlan = subscription?.status === 'active' ? subscription.plan_id : 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      price: 0,
      period: 'forever',
      description: 'Ideal for agency setup and basic invoicing tools.',
      features: ['5 Clients maximum', '10 Invoices total', 'Basic dashboard reports', 'Community support'],
      buttonText: 'Current Plan',
      accent: 'var(--accent-blue)',
    },
    {
      id: 'pro',
      name: 'Agency Pro',
      price: 5000,
      period: 'month',
      description: 'Grow your business with unlimited invoices and AI power.',
      features: ['Unlimited Clients', 'Unlimited Invoices', 'Full AI Agent access', 'Priority support', 'Metrics and growth curves'],
      buttonText: 'Upgrade to Pro',
      accent: 'var(--accent-purple)',
    },
    {
      id: 'agency',
      name: 'Agency Enterprise',
      price: 15000,
      period: 'month',
      description: 'For teams needing visibility, oversight, and analytics.',
      features: ['Everything in Pro', 'Private Developer Console', 'Client performance reports', 'Advanced API integrations', '24/7 dedicated support'],
      buttonText: 'Upgrade to Enterprise',
      accent: '#00f0ff',
    },
  ];

  if (!user) {
    return (
      <div className={styles.centered}>
        <RefreshCw size={24} className={styles.spin} />
        <span>Loading session…</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Verify Banner */}
      {verifyStatus && (
        <div className={`${styles.banner} ${verifyStatus.type === 'success' ? styles.bannerSuccess : styles.bannerError}`}>
          {verifyStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{verifyStatus.message}</span>
        </div>
      )}

      {/* SQL Warning */}
      {dbError && (
        <div className={styles.dbWarning}>
          <AlertTriangle size={20} />
          <div>
            <strong>Supabase Billing Tables Missing</strong>
            <p>You need to create the required tables in Supabase to start using billing. Please run the SQL schema script provided by the developer in your Supabase SQL Editor.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.badge}>
            <CreditCard size={14} />
            <span>Billing & Subs</span>
          </div>
          <h1 className={styles.title}>Manage Subscription Plans</h1>
          <p className={styles.subtitle}>Select the tier that best matches your client invoicing and AI agent needs</p>
        </div>
        {subscription && subscription.status === 'active' && (
          <div className={styles.activePlanCard}>
            <span>Active Plan</span>
            <strong>{subscription.plan_id.toUpperCase()}</strong>
            <span className={styles.planExpiry}>Renews/Ends: {fmtDate(subscription.current_period_end)}</span>
          </div>
        )}
      </header>

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div key={p.id} className={`${styles.planCard} ${isCurrent ? styles.planCardActive : ''}`} style={{ '--plan-accent': p.accent } as React.CSSProperties}>
              {p.id !== 'free' && <div className={styles.planCardGlow} />}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{p.name}</h3>
                <p className={styles.planDesc}>{p.description}</p>
                <div className={styles.planPriceContainer}>
                  <span className={styles.priceSymbol}>₦</span>
                  <span className={styles.priceAmount}>{p.price.toLocaleString()}</span>
                  <span className={styles.pricePeriod}>/{p.period}</span>
                </div>
              </div>

              <div className={styles.planFeatures}>
                {p.features.map((f, i) => (
                  <div key={i} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={`${styles.planBtn} ${isCurrent ? styles.planBtnCurrent : ''}`}
                disabled={isCurrent || checkoutLoading !== null}
                onClick={() => p.id !== 'free' && handleSubscribe(p.id)}
              >
                {checkoutLoading === p.id ? (
                  <RefreshCw size={16} className={styles.spin} />
                ) : isCurrent ? (
                  'Current Active Plan'
                ) : (
                  <>
                    {p.buttonText} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment History */}
      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Transaction History</h2>
        {loading ? (
          <div className={styles.tableLoading}>
            <RefreshCw size={20} className={styles.spin} />
            <span>Loading payments…</span>
          </div>
        ) : payments.length === 0 ? (
          <div className={styles.emptyState}>
            <CreditCard size={32} style={{ opacity: 0.3 }} />
            <span>No payments detected</span>
            <p>Once you complete a Paystack transaction, it will be listed here.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pmt) => (
                  <tr key={pmt.id} className={styles.tableRow}>
                    <td><span className={styles.tablePlanBadge}>{pmt.plan_id}</span></td>
                    <td className={styles.tableMoney}>{fmt(pmt.amount_ngn)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${pmt.status === 'success' ? styles.statusSuccess : styles.statusFailed}`}>
                        {pmt.status === 'success' ? 'Successful' : 'Failed'}
                      </span>
                    </td>
                    <td><code className={styles.codeRef}>{pmt.paystack_reference}</code></td>
                    <td>{fmtDate(pmt.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
