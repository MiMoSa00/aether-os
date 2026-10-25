'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo/Logo';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientName = searchParams.get('client') || 'Client Partner';
  const clientEmail = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    // Simulate setting password & establishing authenticated portal session
    setTimeout(() => {
      setLoading(false);
      router.push(`/client-portal/dashboard?client=${encodeURIComponent(clientName)}`);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-surface-bright)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: 'var(--modal-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Logo href="/" iconSize={48} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.3rem 0.8rem', 
            background: 'var(--bg-surface-low)', 
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={14} /> SECURE INVITATION
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-playfair), Georgia, serif', 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Welcome, {clientName}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Your agency director has invited you to the Aether OS Client Portal. Set your password to access your project deliverables, contracts, and invoices.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {clientEmail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Account Email
              </label>
              <input 
                type="email" 
                value={clientEmail} 
                disabled 
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-low)',
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Choose Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-low)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Confirm Password
            </label>
            <input 
              type="password" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-low)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0.95rem',
              background: '#f6c445',
              color: '#111827',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 2px 8px rgba(246, 196, 69, 0.35)'
            }}
          >
            {loading ? 'Activating Client Portal...' : (
              <>
                Enter Client Portal <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
