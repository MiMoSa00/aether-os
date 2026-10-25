'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Bot, Eye, EyeOff } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [role, setRole] = useState<'director' | 'client'>('director');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (role === 'client') {
        router.push('/client-portal/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.authCard}
      >
        {/* Role Toggle Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-surface-low)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '1.5rem',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setRole('director')}
            style={{
              padding: '0.65rem 0.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: role === 'director' ? 'var(--text-primary)' : 'transparent',
              color: role === 'director' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Director Portal
          </button>
        </div>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Bot size={32} />
          </div>
          <h1 className={styles.title}>Director Workspace</h1>
          <p className={styles.subtitle}>Enter credentials to access agency operations & billings</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Director Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`${styles.input} ${styles.inputWithToggle}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.error}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Accessing Studio...' : 'Sign In as Director'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className={styles.footer} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            Don't have an agency account?{' '}
            <Link href="/signup" className={styles.link}>
              Initialize Director Access
            </Link>
          </p>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Client access is invitation-only and is controlled from the director's Clients page.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
