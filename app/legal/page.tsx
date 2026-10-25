'use client';

import React, { useState } from 'react';
import styles from './legal.module.css';
import { 
  FileText, 
  Search, 
  ArrowRight, 
  PenTool, 
  CheckCircle2, 
  Eye, 
  Clock, 
  Plus, 
  ShieldCheck, 
  Award, 
  RefreshCw, 
  X,
  Send,
  Download,
  Share2
} from 'lucide-react';

interface LegalDoc {
  id: string;
  name: string;
  client: string;
  status: 'Sent' | 'Draft' | 'Signed';
  date: string;
  steps: {
    prepared: string;
    sent?: string;
    viewed?: string;
    signed?: string;
  };
}

const initialDocuments: LegalDoc[] = [
  {
    id: 'doc-1',
    name: 'Q3 Branding Campaign SLA',
    client: 'Zenith Holdings',
    status: 'Sent',
    date: 'Oct 12, 2023',
    steps: {
      prepared: 'Oct 12, 10:00 AM',
      sent: 'Oct 12, 11:30 AM',
      viewed: 'Oct 13, 09:15 AM',
    }
  },
  {
    id: 'doc-2',
    name: 'Project Alpha NDA',
    client: 'TechVentures NG',
    status: 'Draft',
    date: 'Oct 10, 2023',
    steps: {
      prepared: 'Oct 10, 04:20 PM',
    }
  },
  {
    id: 'doc-3',
    name: 'Website Redesign Retainer',
    client: 'EcoFoods Ltd',
    status: 'Signed',
    date: 'Oct 05, 2023',
    steps: {
      prepared: 'Oct 05, 09:00 AM',
      sent: 'Oct 05, 10:15 AM',
      viewed: 'Oct 05, 11:00 AM',
      signed: 'Oct 05, 02:45 PM',
    }
  }
];

export default function LegalEnginePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<LegalDoc[]>(initialDocuments);
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [reminderSent, setReminderSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [templateType, setTemplateType] = useState('Standard NDA');
  
  // New Doc Form
  const [newDocName, setNewDocName] = useState('');
  const [newClient, setNewClient] = useState('');

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newClient.trim()) return;

    const newDoc: LegalDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName,
      client: newClient,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      steps: {
        prepared: 'Just now'
      }
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDocId(newDoc.id);
    setNewDocName('');
    setNewClient('');
    setShowModal(false);
  };

  const handleSendReminder = () => {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3500);
  };

  const templates = [
    {
      title: 'Standard NDA',
      desc: 'Non-Disclosure Agreement optimized for Nigerian corporate standards.',
      icon: FileText,
      defaultName: 'Mutual Non-Disclosure Agreement'
    },
    {
      title: 'Service Level Agreement',
      desc: 'Define scope, timelines, and deliverables for creative services.',
      icon: ShieldCheck,
      defaultName: 'Creative Services SLA'
    },
    {
      title: 'IP Transfer Agreement',
      desc: 'Formalize the transfer of intellectual property rights upon project completion.',
      icon: Award,
      defaultName: 'Full Intellectual Property Assignment'
    },
    {
      title: 'Retainer Agreement',
      desc: 'Ongoing service contract with predefined monthly engagements.',
      icon: RefreshCw,
      defaultName: 'Annual Studio Retainer'
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Header */}
        <header className={styles.headerSection}>
          <div>
            <h1 className={styles.pageTitle}>Legal Engine</h1>
            <p className={styles.pageSubtitle}>Contract & NDA Management</p>
          </div>
          <button 
            className={styles.newContractBtn}
            onClick={() => {
              setTemplateType('Standard NDA');
              setNewDocName('Mutual Non-Disclosure Agreement');
              setShowModal(true);
            }}
          >
            <Plus size={18} /> New Document
          </button>
        </header>

        {/* Search Bar */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Templates Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Templates</h2>
          <div className={styles.templatesGrid}>
            {templates.map((tpl, i) => {
              const Icon = tpl.icon;
              return (
                <div 
                  key={i} 
                  className={styles.templateCard}
                  onClick={() => {
                    setTemplateType(tpl.title);
                    setNewDocName(tpl.defaultName);
                    setShowModal(true);
                  }}
                >
                  <div className={styles.templateIconWrapper}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.templateInfo}>
                    <h3 className={styles.templateTitle}>{tpl.title}</h3>
                    <p className={styles.templateDesc}>{tpl.desc}</p>
                  </div>
                  <ArrowRight size={18} className={styles.templateArrow} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Documents Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Active Documents</h2>
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.colDocName}>Document Name</span>
              <span className={styles.colClient}>Client / Party</span>
              <span className={styles.colStatus}>Status</span>
            </div>
            
            <div className={styles.tableBody}>
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div 
                    key={doc.id} 
                    className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <div className={styles.docNameCell}>
                      <FileText size={18} className={styles.docIcon} />
                      <div>
                        <span className={styles.docNameText}>{doc.name}</span>
                        <span className={styles.mobileClientText}>{doc.client}</span>
                      </div>
                    </div>
                    <div className={styles.clientCell}>
                      {doc.client}
                    </div>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredDocs.length === 0 && (
                <div className={styles.noResults}>
                  No documents found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Signature Tracking Section */}
        {selectedDoc && (
          <section className={styles.section}>
            <div className={styles.signatureCard}>
              <div className={styles.sigHeader}>
                <div className={styles.sigIcon}>
                  <PenTool size={18} />
                </div>
                <h3 className={styles.sigTitle}>Signature Tracking</h3>
              </div>

              {/* Selected Doc Summary */}
              <div className={styles.selectedDocHero}>
                <h4 className={styles.selectedDocTitle}>{selectedDoc.name}</h4>
                <p className={styles.selectedDocSub}>Sent to {selectedDoc.client}</p>
              </div>

              {/* Audit Stepper */}
              <div className={styles.timelineList}>
                {/* Step 1: Prepared */}
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${styles.completed}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.stepTitle}>Prepared</span>
                    <span className={styles.stepTime}>{selectedDoc.steps.prepared}</span>
                  </div>
                </div>

                {/* Step 2: Sent */}
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${selectedDoc.steps.sent ? styles.completed : styles.pending}`}>
                    {selectedDoc.steps.sent ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.stepTitle}>Sent</span>
                    <span className={styles.stepTime}>{selectedDoc.steps.sent || 'Pending delivery'}</span>
                  </div>
                </div>

                {/* Step 3: Viewed */}
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${selectedDoc.steps.viewed ? styles.activeViewed : styles.pending}`}>
                    <Eye size={18} />
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.stepTitle}>Viewed</span>
                    <span className={styles.stepTime}>{selectedDoc.steps.viewed || 'Not yet opened'}</span>
                  </div>
                </div>

                {/* Step 4: Awaiting Signature */}
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${selectedDoc.steps.signed ? styles.completed : styles.dashed}`}>
                    {selectedDoc.steps.signed ? <CheckCircle2 size={18} /> : <PenTool size={16} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.stepTitle}>
                      {selectedDoc.steps.signed ? 'Signed & Executed' : 'Awaiting Signature'}
                    </span>
                    <span className={styles.stepTime}>
                      {selectedDoc.steps.signed || 'Pending client signature'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.sigActions}>
                <button 
                  className={styles.sendReminderBtn}
                  onClick={handleSendReminder}
                  disabled={selectedDoc.status === 'Signed'}
                >
                  <Send size={16} />
                  {selectedDoc.status === 'Signed' ? 'Contract Completed' : 'Send Reminder'}
                </button>
              </div>

              {reminderSent && (
                <div className={styles.toastSuccess}>
                  ✓ Reminder email and SMS notification sent to {selectedDoc.client}!
                </div>
              )}
            </div>
          </section>
        )}

      </div>

      {/* Draft New Agreement Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Draft {templateType}</h3>
                <p className={styles.modalSub}>Nigerian law compliant legal framework</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Agreement Title</label>
                <input 
                  type="text" 
                  value={newDocName} 
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2024"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client / Counterparty</label>
                <input 
                  type="text" 
                  value={newClient} 
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="e.g. Zenith Holdings Ltd"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Governing Jurisdiction</label>
                <input 
                  type="text" 
                  defaultValue="Federal Republic of Nigeria (Lagos Jurisdiction)" 
                  className={styles.formInput}
                  disabled
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Generate Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
