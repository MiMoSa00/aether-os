'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './module.module.css';

interface ModulePageProps {
  title: string;
  subtitle: string;
  icon: any;
  children?: React.ReactNode;
}

export function ModulePage({ title, subtitle, icon: Icon, children }: ModulePageProps) {
  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backBtn}>
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>
      
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={styles.iconBox}
          >
            <Icon size={32} />
          </motion.div>
          <div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
        <div className={styles.neuralStatus}>
          <Sparkles size={16} className={styles.sparkle} />
          <span>Neural Node Synchronized</span>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.content}
      >
        {children || (
          <div className={styles.emptyState}>
            <Bot size={64} className={styles.botIcon} />
            <h3>No Data Detected</h3>
            <p>This neural node is currently empty. Initialize your first record to begin processing.</p>
            <button 
              className={styles.actionBtn} 
              onClick={() => alert(`Initializing new ${title.endsWith('s') ? title.slice(0, -1) : title} sequence...`)}
            >
              Create New {title.endsWith('s') ? title.slice(0, -1) : title}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
