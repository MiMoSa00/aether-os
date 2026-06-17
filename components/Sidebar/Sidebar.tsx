'use client';

import React from 'react';
import { Logo } from '@/components/Logo/Logo';
import styles from './Sidebar.module.css';
import { LayoutDashboard, FolderKanban, FileText, Users, Bot, X, CreditCard, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { createClient } from '@/utils/supabase/client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: FolderKanban },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'AI Agent', href: '/agent', icon: Bot },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useData();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === 'umarkrishna558@gmail.com';

  const activeNavItems = [
    ...navItems,
    { name: 'Billing', href: '/billing', icon: CreditCard }
  ];

  if (isAdmin) {
    activeNavItems.push({ name: 'Admin Console', href: '/admin', icon: Shield });
  }

  // Derive initials: prefer full_name ("John Doe" → "JD"), else first 2 chars of email username
  const getInitials = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    const emailUser = user?.email?.split('@')[0] || 'AU';
    return emailUser.slice(0, 2).toUpperCase();
  };
  const initials = getInitials();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.logo}>
        <Logo href="/dashboard" iconSize={48} />
        <button 
          onClick={onClose}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            marginLeft: 'auto',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className={styles.mobileOnly}
        >
          <X size={24} />
        </button>
      </div>

      <nav className={styles.nav}>
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <span className={styles.avatarInitials}>{initials}</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>Agency Admin</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
