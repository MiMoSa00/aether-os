'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo/Logo';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Building } from 'lucide-react';
import Link from 'next/link';

function ClientLoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate client credentials
    if (!email || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      // Derive company name or use email domain
      const company = email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() + ' Corp' : 'Client Partner';
      router.push(`/client-portal/dashboard?client=${encodeURIComponent(company)}`);
    }, 1000);
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
        maxWidth: '460px',
        background: 'var(--bg-surface-bright)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: 'var(--modal-shadow)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              AP
            </div>
            <span style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)'
            }}>
              AETHER OS
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={14} /> CLIENT PORTAL
          </div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.4rem'
          }}>
            Client Access Hub
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Sign in to track active projects, review deliverables, execute contracts, and settle invoices.
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Client Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="client@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
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
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 2.6rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-low)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            {loading ? 'Accessing Secure Portal...' : (
              <>
                Sign In to Client Portal <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Client accounts are created by agency invitation only.
          </p>
          <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Agency Director? Sign in to Director Console →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        Loading...
      </div>
    }>
      <ClientLoginContent />
    </Suspense>
  );
}
