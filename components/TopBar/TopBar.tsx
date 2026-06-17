import React from 'react';
import styles from './TopBar.module.css';
import { Search, Bell, Settings, Menu } from 'lucide-react';
import Link from 'next/link';

import { useData } from '@/context/DataContext';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { notifications } = useData();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className={styles.searchContainer}>
          <Search size={18} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/notifications" className={styles.iconButton} style={{ position: 'relative' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              bottom: '-2px', 
              right: '-2px', 
              background: '#ef4444', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '2px 5px', 
              borderRadius: '100px',
              border: '2px solid #0a0a0b',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/settings" className={styles.iconButton}>
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
