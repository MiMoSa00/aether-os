'use client';

import { ModulePage } from '@/components/Layout/ModulePage';
import { Settings, User, Shield, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const sections = [
    {
      title: 'Neural Identity',
      icon: User,
      items: [
        { label: 'Agency Name', value: 'Aether Agency' },
        { label: 'Primary Node Email', value: 'admin@aetheros.ai' },
        { label: 'Access Level', value: 'Prime Architect' },
      ]
    },
    {
      title: 'Security Protocol',
      icon: Shield,
      items: [
        { label: 'Neural Encryption', value: 'AES-256 Active' },
        { label: 'Two-Factor Authentication', value: 'Enabled' },
        { label: 'Session Persistence', value: '30 Days' },
      ]
    },
    {
      title: 'A.I. Core Configuration',
      icon: Zap,
      items: [
        { label: 'Language Model', value: 'Claude Sonnet 4.6' },
        { label: 'Neural Temperature', value: '0.7 (Optimal)' },
        { label: 'Context Window', value: '200k Tokens' },
      ]
    }
  ];

  return (
    <ModulePage 
      title="Settings" 
      subtitle="Configure your agency's neural parameters and account preferences." 
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
            <LogOut size={20} /> Terminate Secure Session
          </button>
        </div>
      </div>
    </ModulePage>
  );
}
