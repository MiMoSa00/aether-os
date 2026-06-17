'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VisualElement3D } from '@/components/Visuals/VisualElement3D';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, Clock, Zap, Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';

import styles from './dashboard.module.css';

const StatCard = ({ icon: Icon, label, value, delta, color }: any) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <div className={styles.statIcon} style={{ background: `rgba(59, 130, 246, 0.1)`, border: `1px solid rgba(59, 130, 246, 0.2)` }}>
        <Icon size={20} className="text-blue-400" />
      </div>
      <div className={styles.delta}>
        <ArrowUpRight size={12} />
        {delta}%
      </div>
    </div>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useData();

  // Derive first name: prefer full_name metadata, fall back to email prefix
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userName = fullName.split(' ')[0];

  const [stats] = useState({
    revenue: 0,
    clients: 0,
    tasks: 0,
    velocity: 0,
  });
  const [recentActivity] = useState([]);
  const [teamMembers] = useState([]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.title}
          >
            Welcome back, {userName}
            <Sparkles size={24} className={styles.sparkleIcon} />
          </motion.h1>
          <p className={styles.subtitle}>Your workspace is ready. Add your first client or project to get started.</p>
        </div>
        <div className={styles.statusBadge}>
          <Zap size={14} style={{ color: '#fbbf24' }} />
          Neural Link Active
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₦${stats.revenue.toLocaleString()}`} delta="0" color="blue" />
        <StatCard icon={Users} label="Active Clients" value={stats.clients} delta="0" color="purple" />
        <StatCard icon={CheckCircle} label="Completed Tasks" value={stats.tasks} delta="0" color="green" />
        <StatCard icon={Clock} label="Average Velocity" value={`${stats.velocity}d`} delta="0" color="orange" />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <div className={styles.projectionCard}>
            <h3 className={styles.cardTitle}>
              <Target size={20} style={{ color: '#60a5fa' }} />
              Revenue Overview
            </h3>
            <p className={styles.cardDesc}>No data yet. Add your first client and invoice to start seeing your revenue grow.</p>
            <div style={{ height: '300px' }}>
              <VisualElement3D />
            </div>
          </div>

          <div className={styles.activityCard}>
            <h3 className={styles.cardTitle}>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivity.length > 0 ? recentActivity.map((activity: any, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <CheckCircle size={18} />
                  </div>
                  <div className={styles.activityInfo}>
                    <div className={styles.activityTitle}>{activity.title}</div>
                    <div className={styles.activityMeta}>{activity.time} • {activity.type}</div>
                  </div>
                  <div className={styles.activityValue}>₦{activity.amount.toLocaleString()}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, fontSize: '0.9rem' }}>
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Start a New Project</h3>
            <p className={styles.actionDesc}>Ready to take on more work? Create a project and get organised.</p>
            <Link href="/tasks" className={styles.actionBtn}>
              Launch Project <ArrowUpRight size={18} />
            </Link>
            <Sparkles size={120} style={{ position: 'absolute', bottom: '-40px', right: '-40px', opacity: 0.1, transform: 'rotate(15deg)' }} />
          </div>

          <div className={styles.teamCard}>
            <h3 className={styles.cardTitle}>Team Status</h3>
            <div className={styles.teamList}>
              {teamMembers.length > 0 ? teamMembers.map((member: any) => (
                <div key={member.name} className={styles.teamMember}>
                  <div className={styles.memberAvatar}>
                    <div className={`${styles.statusIndicator} ${member.status === 'online' ? styles.online : styles.offline}`} />
                  </div>
                  <div>
                    <div className={styles.memberName}>{member.name}</div>
                    <div className={styles.memberRole}>{member.role}</div>
                  </div>
                </div>
              )) : (
                <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                  No team members added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
