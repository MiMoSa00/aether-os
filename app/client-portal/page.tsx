'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, MailCheck, ShieldCheck } from 'lucide-react';

export default function ClientPortalLandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, rgba(246,196,69,0.18), transparent 30%), var(--bg-main)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        background: 'var(--bg-surface-bright)',
        border: '1px solid var(--border-color)',
        borderRadius: '28px',
        boxShadow: 'var(--modal-shadow)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '2.25rem 2rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              AP
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '0.08em'
              }}>
                AETHER OS
              </div>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: '0.1rem'
              }}>
                Client Portal
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/client-portal/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.8rem 1.15rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 700
            }}>
              Client Sign In
            </Link>
            <Link href="/client-portal/accept-invite" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              background: '#f6c445',
              color: '#111827',
              textDecoration: 'none',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(246,196,69,0.35)'
            }}>
              Activate Invite <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '2rem',
          padding: '2rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.42rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#fef3c7',
              color: '#92400e',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={14} /> Invitation Only
            </div>

            <h1 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(2.3rem, 4vw, 4.2rem)',
              lineHeight: 1.04,
              margin: '0 0 1rem 0',
              letterSpacing: '-0.04em'
            }}>
              The dedicated client homepage for your delivery workflow.
            </h1>

            <p style={{
              margin: 0,
              fontSize: '1.06rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              maxWidth: '620px'
            }}>
              This is the client-facing website experience. Your director adds a client, sends an invite link, and the client sets their password before entering their portal to review projects, files, contracts, and invoices.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                <CheckCircle2 size={18} color='#16a34a' /> Director-managed access
              </div>
              <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                <CheckCircle2 size={18} color='#16a34a' /> Secure client-only portal
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-low)',
            border: '1px solid var(--border-color)',
            borderRadius: '22px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.8rem',
              alignItems: 'center',
              padding: '0.9rem 1rem',
              background: 'var(--bg-surface-bright)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <MailCheck size={22} color='#d97706' />
              <div>
                <div style={{ fontWeight: 800, marginBottom: '0.15rem' }}>Client invite flow</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Director sends a secure invite link by email</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.8rem',
              alignItems: 'center',
              padding: '0.9rem 1rem',
              background: 'var(--bg-surface-bright)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <ShieldCheck size={22} color='#16a34a' />
              <div>
                <div style={{ fontWeight: 800, marginBottom: '0.15rem' }}>Password setup</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Client creates their password on the invite page</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.8rem',
              alignItems: 'center',
              padding: '0.9rem 1rem',
              background: 'var(--bg-surface-bright)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <ArrowRight size={22} color='#2563eb' />
              <div>
                <div style={{ fontWeight: 800, marginBottom: '0.15rem' }}>Access portal</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Client sees only their project and account information</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
