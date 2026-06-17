'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Bell, Info, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useEffect } from 'react';
import styles from './notifications.module.css';

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
      <div className={styles.container}>
        <div className={styles.list}>
          {notifications.length > 0 ? notifications.map((notif) => {
            const Icon = notif.type === 'success' ? CheckCircle : notif.type === 'warning' ? AlertTriangle : Info;
            const colorClass = notif.type === 'success' ? styles.success : notif.type === 'warning' ? styles.warning : styles.info;

            return (
              <div key={notif.id} className={`${styles.card} ${notif.read ? styles.cardRead : ''}`}>
                <div className={`${styles.iconBox} ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className={styles.body}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>{notif.title}</h4>
                    <span className={styles.cardTime}>
                      <Clock size={12} />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={styles.cardMessage}>{notif.message}</p>
                </div>
              </div>
            );
          }) : (
            <div className={styles.empty}>
              <Bell size={56} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No Neural Alerts Detected</h3>
              <p className={styles.emptyText}>Your agency nodes are currently operating within nominal parameters.</p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  );
}
