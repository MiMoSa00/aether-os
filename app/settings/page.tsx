'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Settings, User, Shield, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useData } from '@/context/DataContext';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useData();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const fullName = user?.user_metadata?.full_name || '—';
  const email = user?.email || '—';
  const role = user?.user_metadata?.role || 'Agency Owner';

  const sections = [
    {
      title: 'Account Information',
      icon: User,
      items: [
        { label: 'Full Name', value: fullName },
        { label: 'Email Address', value: email },
        { label: 'Account Role', value: role },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Data Encryption', value: 'AES-256 Active' },
        { label: 'Two-Factor Authentication', value: 'Enabled' },
        { label: 'Session Duration', value: '30 Days' },
      ]
    },
    {
      title: 'AI Configuration',
      icon: Zap,
      items: [
        { label: 'AI Model', value: 'Claude Sonnet 4.6' },
        { label: 'Response Style', value: 'Balanced (0.7)' },
        { label: 'Context Window', value: '200k Tokens' },
      ]
    }
  ];

  return (
    <ModulePage
      title="Settings"
      subtitle="Manage your account details and preferences."
      icon={Settings}
    >
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}><section.icon size={20} /></div>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
              </div>
              <div className={styles.itemBox}>
                {section.items.map((item, i) => (
                  <div key={i} className={styles.settingItem}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={styles.itemValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>
    </ModulePage>
  );
}
