'use client';

import React, { useState } from 'react';
import styles from './onboarding.module.css';
import { 
  FileText, 
  Wallet, 
  ClipboardList, 
  Video, 
  Lightbulb, 
  Code2, 
  PenTool, 
  ChevronRight, 
  Plus, 
  X,
  CheckCircle2,
  Settings2
} from 'lucide-react';

interface ActiveOnboarding {
  id: string;
  client: string;
  workflow: string;
  progress: number;
  waitingOn: string;
}

const initialOnboardings: ActiveOnboarding[] = [
  {
    id: 'onb-1',
    client: 'Zenith Holdings',
    workflow: 'CREATIVE STRATEGY',
    progress: 65,
    waitingOn: 'Questionnaire'
  },
  {
    id: 'onb-2',
    client: 'Lumina Tech',
    workflow: 'TECH AUDIT',
    progress: 20,
    waitingOn: 'Initial Payment'
  }
];

export default function ClientOnboardingPage() {
  const [activeFlowTitle, setActiveFlowTitle] = useState('Active Flow: Strategy Kickoff');
  const [onboardings, setOnboardings] = useState<ActiveOnboarding[]>(initialOnboardings);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // New Onboarding State
  const [clientName, setClientName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('Creative Strategy Kickoff');
  const [waitingTask, setWaitingTask] = useState('Send NDA');

  const templates = [
    {
      id: 'tpl-1',
      title: 'Creative Strategy Kickoff',
      steps: '4 Steps • Est. 3 days',
      icon: Lightbulb,
      iconBg: '#e0e7ff',
      iconColor: '#4f46e5',
      nodes: ['Send NDA', 'Payment', 'Briefing', 'Kickoff Call']
    },
    {
      id: 'tpl-2',
      title: 'Tech Audit Flow',
      steps: '6 Steps • Est. 1 week',
      icon: Code2,
      iconBg: '#f3f4f6',
      iconColor: '#374151',
      nodes: ['NDA Sign', 'Repo Access', 'Env Audit', 'Architecture Review', 'Security Scan', 'Debrief']
    },
    {
      id: 'tpl-3',
      title: 'Brand Identity Lite',
      steps: '3 Steps • Est. 2 days',
      icon: PenTool,
      iconBg: '#f3f4f6',
      iconColor: '#374151',
      nodes: ['Deposit', 'Moodboard', 'Concept Review']
    }
  ];

  const handleStartNewOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newOnb: ActiveOnboarding = {
      id: `onb-${Date.now()}`,
      client: clientName.trim(),
      workflow: selectedTemplate.toUpperCase(),
      progress: 10,
      waitingOn: waitingTask
    };

    setOnboardings([newOnb, ...onboardings]);
    setClientName('');
    setShowNewModal(false);
  };

  const handleSelectTemplate = (tpl: typeof templates[0]) => {
    setActiveFlowTitle(`Active Flow: ${tpl.title}`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Breadcrumb & Header */}
        <header className={styles.headerSection}>
          <div className={styles.categoryBreadcrumb}>
            PROJECTS / WORKFLOWS
          </div>
          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.pageTitle}>Client Onboarding</h1>
              <p className={styles.pageSubtitle}>
                Manage and automate the agency-side experience for incoming clients. Ensure a consistent, high-end touchpoint at every phase.
              </p>
            </div>
            <button 
              className={styles.newWorkflowBtn}
              onClick={() => setShowWorkflowModal(true)}
            >
              <Plus size={16} /> NEW WORKFLOW
            </button>
          </div>
        </header>

        {/* Card 1: Active Flow */}
        <div className={styles.flowCard}>
          <div className={styles.flowHeader}>
            <h2 className={styles.flowTitle}>{activeFlowTitle}</h2>
            <button 
              className={styles.editFlowBtn}
              onClick={() => alert('Opening visual flow canvas editor...')}
            >
              Edit Flow
            </button>
          </div>

          <div className={styles.stepperContainer}>
            {/* Step 1 */}
            <div className={styles.stepNode}>
              <div className={`${styles.nodeCircle} ${styles.goldCircle}`}>
                <FileText size={20} />
              </div>
              <span className={styles.nodeLabel}>Send NDA</span>
            </div>

            <div className={styles.nodeConnector} />

            {/* Step 2 */}
            <div className={styles.stepNode}>
              <div className={`${styles.nodeCircle} ${styles.grayCircle}`}>
                <Wallet size={20} />
              </div>
              <span className={styles.nodeLabel}>Payment</span>
            </div>

            <div className={styles.nodeConnector} />

            {/* Step 3 */}
            <div className={styles.stepNode}>
              <div className={`${styles.nodeCircle} ${styles.grayCircle}`}>
                <ClipboardList size={20} />
              </div>
              <span className={styles.nodeLabel}>Briefing</span>
            </div>

            <div className={styles.nodeConnector} />

            {/* Step 4 */}
            <div className={styles.stepNode}>
              <div className={`${styles.nodeCircle} ${styles.grayCircle}`}>
                <Video size={20} />
              </div>
              <span className={styles.nodeLabel}>Kickoff Call</span>
            </div>
          </div>
        </div>

        {/* Card 2: Onboarding Templates */}
        <div className={styles.templatesCard}>
          <h2 className={styles.sectionHeading}>Onboarding Templates</h2>
          <div className={styles.templatesList}>
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div 
                  key={tpl.id} 
                  className={styles.templateRow}
                  onClick={() => handleSelectTemplate(tpl)}
                >
                  <div 
                    className={styles.templateIconBox}
                    style={{ backgroundColor: tpl.iconBg, color: tpl.iconColor }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className={styles.templateDetails}>
                    <h3 className={styles.templateName}>{tpl.title}</h3>
                    <span className={styles.templateSub}>{tpl.steps}</span>
                  </div>
                  <ChevronRight size={18} className={styles.templateChevron} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Active Onboardings */}
        <div className={styles.activeOnboardingsCard}>
          <h2 className={styles.sectionHeading}>Active Onboardings</h2>

          <div className={styles.onboardingsList}>
            {onboardings.map((item) => (
              <div key={item.id} className={styles.onboardingItem}>
                <div className={styles.itemHeader}>
                  <div className={styles.clientGroup}>
                    <h3 className={styles.clientName}>{item.client}</h3>
                    <span className={styles.workflowTag}>{item.workflow}</span>
                  </div>
                  <span className={`${styles.progressBadge} ${item.progress >= 50 ? styles.progressHigh : styles.progressLow}`}>
                    {item.progress}% Complete
                  </span>
                </div>

                <div className={styles.progressBarWrapper}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>

                <div className={styles.waitingNotice}>
                  Waiting on: <strong>{item.waitingOn}</strong>
                </div>
              </div>
            ))}

            {/* Start New Dashed Button */}
            <button 
              className={styles.startNewDashedBtn}
              onClick={() => setShowNewModal(true)}
            >
              <Plus size={16} /> Start New
            </button>
          </div>
        </div>

      </div>

      {/* Start New Onboarding Modal */}
      {showNewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Launch Client Onboarding</h3>
                <p className={styles.modalSub}>Initialize structured welcome pipeline for a new partner</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowNewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStartNewOnboarding} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Client Name / Company</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Global Media" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Select Workflow Template</label>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className={styles.selectInput}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.title}>{t.title} ({t.steps})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>First Step Required</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mutual NDA Execution"
                  value={waitingTask}
                  onChange={(e) => setWaitingTask(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Initialize Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Custom Workflow Modal */}
      {showWorkflowModal && (
        <div className={styles.modalOverlay} onClick={() => setShowWorkflowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Create New Workflow Template</h3>
                <p className={styles.modalSub}>Define stages, notifications, and automatic triggers</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowWorkflowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Standard modular workflow sequence activated. Custom triggers can be configured in Agency Settings.
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalSubmit} onClick={() => setShowWorkflowModal(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
