'use client';

import React, { useState } from 'react';
import styles from './settings.module.css';
import { 
  Settings, 
  Plus, 
  Landmark, 
  Sparkles, 
  Check, 
  Pencil, 
  X, 
  CheckCircle2, 
  CreditCard,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
}

export default function AgencySettingsPage() {
  const router = useRouter();

  // Team Members
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: 'tm-1',
      name: 'Elara Vance',
      email: 'elara@aether.studio',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'tm-2',
      name: 'Julian Thorne',
      email: 'julian@aether.studio',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'tm-3',
      name: 'Maya K.',
      email: 'finance@aether.studio',
      initials: 'MK'
    }
  ]);

  // Ledger Config
  const [usdSecondary, setUsdSecondary] = useState(true);

  // AI Config
  const [aiMode, setAiMode] = useState<'analytical' | 'creative'>('analytical');
  const [focusAreas, setFocusAreas] = useState<string[]>(['Brand Strategy', 'Financial Projections']);

  // Modals & Feedback
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddFocusModal, setShowAddFocusModal] = useState(false);
  const [newFocusText, setNewFocusText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const parts = newMemberName.trim().split(/\s+/);
    const initials = parts.length >= 2 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      initials
    };

    setTeam([...team, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowInviteModal(false);
  };

  const handleAddFocusArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFocusText.trim() && !focusAreas.includes(newFocusText.trim())) {
      setFocusAreas([...focusAreas, newFocusText.trim()]);
      setNewFocusText('');
      setShowAddFocusModal(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleSaveConfig = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Header */}
        <header className={styles.headerSection}>
          <div className={styles.workspaceTag}>
            <Settings size={14} />
            <span>DIRECTOR WORKSPACE</span>
          </div>
          <h1 className={styles.pageTitle}>Agency Settings</h1>
          <p className={styles.pageSubtitle}>
            Manage your modular workspace configuration, team access hierarchies, and financial ledgers.
          </p>
        </header>

        {saveSuccess && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} />
            <span>Studio configuration successfully synchronized to ledger node.</span>
          </div>
        )}

        {/* ─── CARD 1: TEAM & ROLES ────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Team & Roles</h2>
              <p className={styles.cardSubtitle}>Manage access levels and studio personnel.</p>
            </div>
            <button 
              className={styles.inviteBtn}
              onClick={() => setShowInviteModal(true)}
            >
              <Plus size={14} /> Invite Member
            </button>
          </div>

          <div className={styles.teamTable}>
            <div className={styles.teamTableHeader}>
              <span>Member</span>
              <span>Email</span>
            </div>

            <div className={styles.teamList}>
              {team.map((member) => (
                <div key={member.id} className={styles.teamRow}>
                  <div className={styles.memberCell}>
                    {member.avatarUrl ? (
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        className={styles.avatarImg} 
                      />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {member.initials || 'MK'}
                      </div>
                    )}
                    <span className={styles.memberName}>{member.name}</span>
                  </div>

                  <div className={styles.emailCell}>
                    {member.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CARD 2: LEDGER CONFIG ──────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Ledger Config</h2>
              <p className={styles.cardSubtitle}>Multi-currency settings.</p>
            </div>
            <Landmark size={22} className={styles.headerIcon} />
          </div>

          <div className={styles.ledgerBoxes}>
            {/* Primary Base */}
            <div className={`${styles.ledgerItem} ${styles.primaryLedger}`}>
              <div className={styles.ledgerItemLeft}>
                <span className={styles.ledgerRoleTag}>PRIMARY BASE</span>
                <span className={styles.currencyName}>Nigerian Naira (NGN)</span>
              </div>
              <span className={styles.defaultBadge}>Default</span>
            </div>

            {/* Secondary Currency */}
            <div className={styles.ledgerItem}>
              <div className={styles.ledgerItemLeft}>
                <span className={styles.ledgerRoleTag}>SECONDARY</span>
                <span className={styles.currencyName}>US Dollar (USD)</span>
              </div>
              <button 
                type="button" 
                className={`${styles.toggleSwitch} ${usdSecondary ? styles.toggleOn : ''}`}
                onClick={() => setUsdSecondary(!usdSecondary)}
              >
                <div className={styles.toggleKnob} />
              </button>
            </div>
          </div>

          <p className={styles.ledgerNotice}>
            Invoices will default to NGN, USD conversions rely on daily dynamic rates.
          </p>
        </div>

        {/* ─── CARD 3: SUBSCRIPTION ───────────────────────── */}
        <div className={styles.subscriptionCard}>
          <div className={styles.subHeader}>
            <h2 className={styles.subTitle}>Subscription</h2>
            <span className={styles.proTierBadge}>⭐ Pro Tier</span>
          </div>

          <div className={styles.storageUsageRow}>
            <span className={styles.storageLabel}>Storage Used</span>
            <span className={styles.storageValue}>850GB / 1TB</span>
          </div>

          <div className={styles.progressBarWrapper}>
            <div className={styles.progressGoldFill} style={{ width: '85%' }} />
          </div>

          <div className={styles.subActions}>
            <button 
              className={styles.billingHistoryBtn}
              onClick={() => router.push('/billing')}
            >
              View Billing History
            </button>
          </div>
        </div>

        {/* ─── CARD 4: AETHER AI CONFIG ───────────────────── */}
        <div className={styles.card}>
          <div className={styles.aiHeader}>
            <Sparkles size={20} className={styles.headerIcon} />
            <h2 className={styles.cardTitle}>Aether AI Config</h2>
          </div>
          <p className={styles.cardSubtitle}>
            Tune the assistant's behavior to match your agency's operational workflow.
          </p>

          {/* Radio Options */}
          <div className={styles.radioOptions}>
            {/* Option 1: Analytical */}
            <div 
              className={`${styles.radioBox} ${aiMode === 'analytical' ? styles.radioSelected : ''}`}
              onClick={() => setAiMode('analytical')}
            >
              <div className={styles.radioIconWrapper}>
                <div className={`${styles.radioBullet} ${aiMode === 'analytical' ? styles.bulletActive : ''}`}>
                  {aiMode === 'analytical' && <div className={styles.bulletInner} />}
                </div>
              </div>
              <div className={styles.radioText}>
                <h4 className={styles.radioTitle}>Analytical & Precise</h4>
                <p className={styles.radioDesc}>
                  Focuses on data, ledger accuracy, and strict formatting.
                </p>
              </div>
            </div>

            {/* Option 2: Creative */}
            <div 
              className={`${styles.radioBox} ${aiMode === 'creative' ? styles.radioSelected : ''}`}
              onClick={() => setAiMode('creative')}
            >
              <div className={styles.radioIconWrapper}>
                <div className={`${styles.radioBullet} ${aiMode === 'creative' ? styles.bulletActive : ''}`}>
                  {aiMode === 'creative' && <div className={styles.bulletInner} />}
                </div>
              </div>
              <div className={styles.radioText}>
                <h4 className={styles.radioTitle}>Creative Ideation</h4>
                <p className={styles.radioDesc}>
                  Expansive vocabulary, brainstorm-friendly, conceptual.
                </p>
              </div>
            </div>
          </div>

          {/* Contextual Focus Areas */}
          <div className={styles.focusSection}>
            <div className={styles.focusHeader}>
              <span className={styles.focusLabel}>CONTEXTUAL FOCUS AREAS</span>
              <button 
                type="button" 
                className={styles.editFocusLink}
                onClick={() => setShowAddFocusModal(true)}
              >
                <Pencil size={12} /> Edit
              </button>
            </div>

            <div className={styles.chipsRow}>
              {focusAreas.map((area, i) => (
                <button 
                  key={i} 
                  type="button" 
                  className={styles.chipSelected}
                  onClick={() => toggleFocusArea(area)}
                >
                  <Check size={14} /> {area}
                </button>
              ))}
              <button 
                type="button" 
                className={styles.chipAdd}
                onClick={() => setShowAddFocusModal(true)}
              >
                + Add Focus Area
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.saveSection}>
            <button 
              type="button" 
              className={styles.saveConfigBtn}
              onClick={handleSaveConfig}
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Studio Account / Sign Out */}
        <div className={styles.logoutWrapper}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> Sign Out of Aether OS
          </button>
        </div>

      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Invite Studio Member</h3>
                <p className={styles.modalSub}>Grant team collaborator credentials to Aether OS</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowInviteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Adebayo Ogunlesi"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. adebayo@aether.studio"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Focus Area Modal */}
      {showAddFocusModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddFocusModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add AI Focus Domain</h3>
                <p className={styles.modalSub}>Guide the neural assistant's specialized context</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowAddFocusModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFocusArea} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Domain / Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. FinTech Regulatory Compliance"
                  value={newFocusText}
                  onChange={(e) => setNewFocusText(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowAddFocusModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Add Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
