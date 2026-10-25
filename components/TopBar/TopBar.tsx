import React from 'react';
import styles from './TopBar.module.css';
import { Search, Bell, Settings, Menu, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

import { useData } from '@/context/DataContext';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { notifications, theme, toggleTheme } = useData();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={styles.topbar}>
      <div className={styles.leftGroup}>
        <button 
          className={styles.menuButton} 
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className={styles.searchInput}
            aria-label="Search projects"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Link 
          href="/notifications" 
          className={styles.iconButton} 
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className={styles.notifBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/settings" className={styles.iconButton} aria-label="Settings">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
