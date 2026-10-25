'use client';

import React from 'react';
import styles from '../dashboard/dashboard.module.css';
import { FolderKanban, Calendar, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useClientProjects } from '@/lib/useClientData';

export default function ClientProjectsPage() {
  const { projects, loading, error } = useClientProjects();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.headerSection}>
          <span className={styles.clientPortalBadge}>CLIENT PORTAL / PROJECTS</span>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Project Hub</h1>
            <Link href="/client-portal/dashboard" className={styles.projectHubBtn}>
              Back to Overview
            </Link>
          </div>
        </header>

        {loading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Projects Yet</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Your projects will appear here once created by your director.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {projects.map((p) => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{p.project_name}</h2>
                  <span className={styles.inProgressBadge}>{p.status}</span>
                </div>

                {p.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {p.description}
                  </p>
                )}

                {p.phase && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{p.phase}</p>
                )}

                <div className={styles.progressSection}>
                  <div className={styles.progressLabelRow}>
                    <span className={styles.progressLabel}>Milestone Progress</span>
                    <span className={styles.progressValue}>{p.progress_percentage}%</span>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBarFill} style={{ width: `${p.progress_percentage}%` }} />
                  </div>
                </div>

                <div className={styles.cardDivider} />

                <div className={styles.timelineRow}>
                  <Calendar size={16} className={styles.timelineIcon} />
                  <span className={styles.timelineText}>
                    Timeline: {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'} - {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {p.project_deliverables && p.project_deliverables.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Deliverables</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {p.project_deliverables.map((d: any) => (
                        <div key={d.id} style={{
                          padding: '0.6rem 0.8rem',
                          background: 'var(--bg-surface-low)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: d.status === 'approved' ? '#16a34a' : d.status === 'reviewed' ? '#f59e0b' : '#3b82f6'
                          }} />
                          {d.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
