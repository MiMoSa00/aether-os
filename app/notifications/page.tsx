'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Bell, Info, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useData();

  useEffect(() => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  }, [notifications, markNotificationRead]);

  return (
    <ModulePage 
      title="Notifications" 
      subtitle="Monitor real-time updates from your agency's neural nodes." 
      icon={Bell}
    >
      <div style={{ width: '100%', padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {notifications.length > 0 ? notifications.map((notif) => {
            const Icon = notif.type === 'success' ? CheckCircle : notif.type === 'warning' ? AlertTriangle : Info;
            const color = notif.type === 'success' ? '#22c55e' : notif.type === 'warning' ? '#fbbf24' : '#3b82f6';

            return (
              <div key={notif.id} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--surface-border)', 
                borderRadius: '20px', 
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1.25rem',
                opacity: notif.read ? 0.7 : 1
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: `${color}15`, 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: color,
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{notif.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{notif.message}</p>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.3 }}>
              <Bell size={64} style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Neural Alerts Detected</h3>
              <p>Your agency nodes are currently operating within nominal parameters.</p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  );
}
