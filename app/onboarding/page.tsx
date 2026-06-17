'use client';

import React, { useEffect, useState } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { CheckCircle2, Circle, ArrowRight, Sparkles, UserPlus, FilePlus, Bot, Shield, Check } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const { clients, tasks, invoices } = useData();
  const [aiTried, setAiTried] = useState(false);
  const [billingDone, setBillingDone] = useState(false);

  // Load localStorage variables on client mount
  useEffect(() => {
    setAiTried(localStorage.getItem('aether_onboarding_ai_tried') === 'true');
    setBillingDone(localStorage.getItem('aether_onboarding_billing_setup') === 'true');
  }, []);

  // Determine completions
  const steps = [
    {
      id: 'step-client',
      title: 'Add Your First Client',
      desc: 'Populate your workspace by adding a client partner details.',
      link: '/clients',
      cta: 'Go to Clients',
      completed: clients.length > 0,
      icon: UserPlus,
    },
    {
      id: 'step-task',
      title: 'Create an Active Task',
      desc: 'Set up an assignment on the Kanban board to track your workflow.',
      link: '/tasks',
      cta: 'Open Tasks Board',
      completed: Object.keys(tasks).length > 0,
      icon: FilePlus,
    },
    {
      id: 'step-invoice',
      title: 'Draft a Client Invoice',
      desc: 'Request payments in Naira native or international currencies.',
      link: '/invoices',
      cta: 'Create Invoice',
      completed: invoices.length > 0,
      icon: FilePlus,
    },
    {
      id: 'step-ai',
      title: 'Interact with Claude AI Core',
      desc: 'Test your workspace agent to draft code, generate briefings, or ask questions.',
      link: '/agent',
      cta: 'Open AI Console',
      completed: aiTried,
      icon: Bot,
    },
    {
      id: 'step-billing',
      title: 'Configure Billing Plan',
      desc: 'Activate a professional or enterprise tier to unlock unlimited clients and invoices.',
      link: '/billing',
      cta: 'Manage Plan',
      completed: billingDone,
      icon: Shield,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const percentComplete = Math.round((completedCount / steps.length) * 100);

  return (
    <ModulePage title="Workspace Onboarding" subtitle="Complete the setup checklist to activate your workspace nodes." icon={Sparkles}>
      <div className={styles.container}>
        
        {/* Progress Card */}
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <div>
              <h3>Workspace Completion</h3>
              <p className={styles.subtext}>Follow these steps to fully configure Aether OS for your agency.</p>
            </div>
            <div className={styles.progressBadge}>{percentComplete}% Complete</div>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.barFill} style={{ width: `${percentComplete}%` }} />
          </div>
          <div className={styles.progressStats}>
            <span>{completedCount} of {steps.length} tasks completed</span>
            {completedCount === steps.length && (
              <span className={styles.successMessage}>🎉 Workspace fully synchronized!</span>
            )}
          </div>
        </div>

        {/* Steps List */}
        <div className={styles.stepsList}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className={`${styles.stepRow} ${step.completed ? styles.stepCompleted : ''}`}
              >
                <div className={styles.stepIndicator}>
                  {step.completed ? (
                    <CheckCircle2 size={24} className={styles.completedIcon} />
                  ) : (
                    <div className={styles.circleNumber}>{idx + 1}</div>
                  )}
                </div>

                <div className={styles.stepContent}>
                  <div className={styles.stepLeft}>
                    <div className={styles.stepIconBox}>
                      <Icon size={20} className={styles.stepIcon} />
                    </div>
                    <div>
                      <h4 className={styles.stepTitle}>{step.title}</h4>
                      <p className={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                  
                  <div className={styles.stepRight}>
                    {step.completed ? (
                      <span className={styles.doneLabel}>
                        <Check size={14} /> Completed
                      </span>
                    ) : (
                      <Link href={step.link} className={styles.actionBtn}>
                        {step.cta} <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </ModulePage>
  );
}
