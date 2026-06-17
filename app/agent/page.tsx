import React from 'react';
import { ChatInterface } from '@/components/Agent/ChatInterface';
import { Sparkles } from 'lucide-react';

import styles from './agent.module.css';

export default function AgentPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>AI Control Center</h1>
            <Sparkles color="var(--accent-purple)" size={28} />
          </div>
          <p className={styles.subtitle}>Interact with your intelligent agency assistant.</p>
        </div>
      </header>

      <ChatInterface />
    </div>
  );
}
