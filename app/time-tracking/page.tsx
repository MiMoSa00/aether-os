'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { Clock, Play, Pause, Square, Plus, Trash2, DollarSign, ArrowRight, Eye, Briefcase, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';
import styles from './time-tracking.module.css';
import { Modal } from '@/components/ui/Modal';
import modalStyles from '@/components/ui/Modal.module.css';
import { Button } from '@/components/ui/Button';

const fmt = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const fmtHours = (secs: number) => `${(secs / 3600).toFixed(1)} hrs`;

export default function TimeTrackingPage() {
  const { clients, user, timeEntries, addTimeEntry, deleteTimeEntry, addInvoice, addNotification } = useData();

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [accumulated, setAccumulated] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form & entry state
  const [timerClient, setTimerClient] = useState('');
  const [timerDesc, setTimerDesc] = useState('');
  const [timerRate, setTimerRate] = useState('5000');
  const [timerBillable, setTimerBillable] = useState(true);

  // Manual Log Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualClient, setManualClient] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualHours, setManualHours] = useState('');
  const [manualBillable, setManualBillable] = useState(true);
  const [manualRate, setManualRate] = useState('5000');

  // Load saved timer state from localStorage
  useEffect(() => {
    const savedStart = localStorage.getItem('aether_timer_start');
    const savedAccumulated = localStorage.getItem('aether_timer_accumulated');
    const savedPaused = localStorage.getItem('aether_timer_paused');
    const savedClient = localStorage.getItem('aether_timer_client');
    const savedDesc = localStorage.getItem('aether_timer_desc');
    const savedRate = localStorage.getItem('aether_timer_rate');
    const savedBillable = localStorage.getItem('aether_timer_billable');

    if (savedClient) setTimerClient(savedClient);
    if (savedDesc) setTimerDesc(savedDesc);
    if (savedRate) setTimerRate(savedRate);
    if (savedBillable) setTimerBillable(savedBillable === 'true');

    const accVal = savedAccumulated ? Number(savedAccumulated) : 0;
    setAccumulated(accVal);

    if (savedPaused === 'true') {
      setPaused(true);
      setRunning(false);
      setElapsed(accVal);
    } else if (savedStart) {
      const ts = Number(savedStart);
      setStartTs(ts);
      setRunning(true);
      setPaused(false);
      setElapsed(accVal + Math.floor((Date.now() - ts) / 1000));
    }
  }, []);

  // Tick
  useEffect(() => {
    if (running && startTs !== null) {
      intervalRef.current = setInterval(() => {
        setElapsed(accumulated + Math.floor((Date.now() - startTs) / 1000));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, startTs, accumulated]);

  const startTimer = () => {
    if (!timerClient) { alert('Please select a client before starting the timer.'); return; }
    const ts = Date.now();
    localStorage.setItem('aether_timer_start', String(ts));
    localStorage.setItem('aether_timer_accumulated', '0');
    localStorage.setItem('aether_timer_client', timerClient);
    localStorage.setItem('aether_timer_desc', timerDesc);
    localStorage.setItem('aether_timer_rate', timerRate);
    localStorage.setItem('aether_timer_billable', String(timerBillable));
    localStorage.removeItem('aether_timer_paused');
    
    setStartTs(ts);
    setAccumulated(0);
    setRunning(true);
    setPaused(false);
    setElapsed(0);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const sessionElapsed = startTs ? Math.floor((Date.now() - startTs) / 1000) : 0;
    const newAccumulated = accumulated + sessionElapsed;
    
    localStorage.setItem('aether_timer_accumulated', String(newAccumulated));
    localStorage.setItem('aether_timer_paused', 'true');
    localStorage.removeItem('aether_timer_start');
    
    setAccumulated(newAccumulated);
    setElapsed(newAccumulated);
    setRunning(false);
    setPaused(true);
    setStartTs(null);
  };

  const resumeTimer = () => {
    const ts = Date.now();
    localStorage.setItem('aether_timer_start', String(ts));
    localStorage.removeItem('aether_timer_paused');
    
    setStartTs(ts);
    setRunning(true);
    setPaused(false);
  };

  const stopTimer = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    localStorage.removeItem('aether_timer_start');
    localStorage.removeItem('aether_timer_accumulated');
    localStorage.removeItem('aether_timer_paused');
    localStorage.removeItem('aether_timer_client');
    localStorage.removeItem('aether_timer_desc');
    localStorage.removeItem('aether_timer_rate');
    localStorage.removeItem('aether_timer_billable');
    
    setRunning(false);
    setPaused(false);

    const sessionElapsed = startTs ? Math.floor((Date.now() - startTs) / 1000) : 0;
    const totalDuration = accumulated + sessionElapsed;

    if (totalDuration < 5) {
      setElapsed(0);
      setAccumulated(0);
      setStartTs(null);
      return;
    }

    await addTimeEntry(
      timerClient,
      timerDesc || 'Work session',
      totalDuration,
      timerBillable,
      Number(timerRate) || 5000
    );

    setElapsed(0);
    setAccumulated(0);
    setStartTs(null);
    setTimerDesc('');
    setTimerClient('');
  };

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClient || !manualHours || !manualDesc) {
      alert('Please fill in Client, Description, and Hours.');
      return;
    }
    const duration = parseFloat(manualHours) * 3600;
    await addTimeEntry(
      manualClient,
      manualDesc,
      duration,
      manualBillable,
      Number(manualRate) || 5000
    );
    
    setManualClient('');
    setManualDesc('');
    setManualHours('');
    setIsManualModalOpen(false);
  };

  // Convert unbilled hours to invoice
  const handleConvertToInvoice = async () => {
    const unbilledEntries = timeEntries.filter(e => e.billable);
    if (unbilledEntries.length === 0) {
      alert('No unbilled hours available to convert to invoice.');
      return;
    }

    // Group by client
    const clientMap: Record<string, { seconds: number; value: number }> = {};
    unbilledEntries.forEach(entry => {
      if (!clientMap[entry.client]) {
        clientMap[entry.client] = { seconds: 0, value: 0 };
      }
      clientMap[entry.client].seconds += entry.duration;
      clientMap[entry.client].value += (entry.duration / 3600) * entry.rate;
    });

    // Create invoices for each client
    for (const [cli, data] of Object.entries(clientMap)) {
      const items = [{
        description: `Time Tracking Log: ${fmtHours(data.seconds)} accrued`,
        qty: 1,
        unitPrice: Math.round(data.value),
        total: Math.round(data.value)
      }];

      await addInvoice(cli, String(Math.round(data.value)), undefined, items, 'Converted automatically from tracked time entries.');
      
      // Delete entries so they aren't billed twice
      const cliEntries = unbilledEntries.filter(e => e.client === cli);
      for (const entry of cliEntries) {
        await deleteTimeEntry(entry.id);
      }
    }

    addNotification('Time entries invoiced', 'All billable hours have been converted to invoices successfully.', 'success');
  };

  // Icon selector based on description keywords
  const getLogEmoji = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('design') || d.includes('ui') || d.includes('logo') || d.includes('brand')) return '🎨';
    if (d.includes('code') || d.includes('dev') || d.includes('front') || d.includes('bug')) return '💻';
    if (d.includes('meeting') || d.includes('call') || d.includes('discuss')) return '📞';
    if (d.includes('write') || d.includes('copy') || d.includes('content') || d.includes('deck')) return '✏️';
    return '⏱️';
  };

  // Summary stats
  const totalSecs = timeEntries.reduce((s, e) => s + e.duration, 0);
  const billableSecs = timeEntries.filter(e => e.billable).reduce((s, e) => s + e.duration, 0);
  const billableEarned = timeEntries.filter(e => e.billable).reduce((s, e) => s + (e.duration / 3600) * e.rate, 0);

  return (
    <ModulePage title="Time Tracking" subtitle="Log hours, run live timers, and automatically bill clients." icon={Clock}>
      <div className={styles.container}>

        {/* ── Active Session / Timer Hero Banner (Matching sovereign layout) ── */}
        <div className={styles.heroTimerCard}>
          <div className={styles.heroPattern} />
          
          <div className={styles.activeSessionBadge}>
            <span className={styles.pulseDot} style={{ animation: running ? 'pulseRing 2s infinite' : 'none' }} />
            <span>{running ? 'Active Session' : paused ? 'Timer Paused' : 'Timer Inactive'}</span>
          </div>

          <h2 className={styles.activeTitle}>
            {running || paused ? (timerDesc || 'Unnamed Session') : 'Ready to start tracking?'}
          </h2>
          <p className={styles.activeSubtitle}>
            {running || paused ? `Client Partner: ${timerClient}` : 'Select a client, enter details, and hit start below.'}
          </p>

          <div className={styles.giantTimerDisplay}>
            {fmt(elapsed)}
          </div>

          <div className={styles.heroTimerForm}>
            {!running && !paused && (
              <div className={styles.formInlineRow}>
                <select
                  className={styles.select}
                  value={timerClient}
                  onChange={e => setTimerClient(e.target.value)}
                >
                  <option value="">Choose client...</option>
                  {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="Internal">Internal / Admin</option>
                </select>

                <input
                  className={styles.input}
                  placeholder="What are you working on right now?"
                  value={timerDesc}
                  onChange={e => setTimerDesc(e.target.value)}
                />

                <div className={styles.quickFormMeta}>
                  <label className={styles.billableLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={timerBillable}
                      onChange={e => setTimerBillable(e.target.checked)}
                    />
                    <span>Billable</span>
                  </label>

                  <div className={styles.rateFieldGroup}>
                    <DollarSign size={13} />
                    <input
                      type="number"
                      className={styles.rateFieldInline}
                      value={timerRate}
                      onChange={e => setTimerRate(e.target.value)}
                    />
                    <span>/hr</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.timerActionsRow}>
            {(running || paused) ? (
              <>
                <button
                  className={running ? styles.pauseBtn : styles.resumeBtn}
                  onClick={running ? pauseTimer : resumeTimer}
                >
                  {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
                </button>
                <button
                  className={styles.stopBtn}
                  onClick={stopTimer}
                >
                  <Square size={16} /> Stop & Log Time
                </button>
              </>
            ) : (
              <button
                className={styles.startBtn}
                onClick={startTimer}
              >
                <Play size={16} /> Start Live Session
              </button>
            )}
          </div>
        </div>

        {/* Bento Layout Row */}
        <div className={styles.bentoGrid}>
          
          {/* Left Column: Recent Logs */}
          <div className={styles.logsPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Recent Logs</h3>
              <span className={styles.entryCountBadge}>{timeEntries.length} logged</span>
            </div>

            {timeEntries.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={40} style={{ opacity: 0.15 }} />
                <p>No logged sessions yet. Start a live timer or log manual hours above.</p>
              </div>
            ) : (
              <div className={styles.logList}>
                {timeEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className={styles.logRow}>
                    <div className={styles.logIconBox}>
                      {getLogEmoji(entry.description)}
                    </div>
                    <div className={styles.logInfo}>
                      <div className={styles.logDesc}>{entry.description}</div>
                      <div className={styles.logClient}>{entry.client} &bull; {entry.date}</div>
                    </div>
                    <div className={styles.logRight}>
                      <div className={styles.logDuration}>{fmtHours(entry.duration)}</div>
                      <span className={entry.billable ? styles.billableLabelChip : styles.internalLabelChip}>
                        {entry.billable ? `₦${Math.round((entry.duration / 3600) * entry.rate).toLocaleString()}` : 'Internal'}
                      </span>
                      <button className={styles.deleteLogBtn} onClick={() => deleteTimeEntry(entry.id)} title="Delete entry">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Invoicing Actions & Manual Entry */}
          <div className={styles.sideControls}>
            
            {/* Convert to Invoice Card */}
            <div className={styles.cardUnbilled}>
              <div className={styles.unbilledIcon}>
                <FileText size={26} />
              </div>
              <h3 className={styles.unbilledTitle}>Unbilled Hours</h3>
              <p className={styles.unbilledValue}>{fmtHours(billableSecs)}</p>
              <p className={styles.unbilledSub}>
                Accumulated billable value: <strong>₦{Math.round(billableEarned).toLocaleString()}</strong>
              </p>
              <button 
                className={styles.invoiceActionBtn}
                onClick={handleConvertToInvoice}
                disabled={billableSecs === 0}
              >
                <span>Convert to Invoice</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Log Time Manually Button */}
            <button 
              className={styles.dashedManualBtn}
              onClick={() => setIsManualModalOpen(true)}
            >
              <div className={styles.dashedIconCircle}>
                <Plus size={16} />
              </div>
              <span className={styles.dashedText}>Log Time Manually</span>
            </button>

          </div>

        </div>

      </div>

      {/* ─── MANUAL LOG MODAL ────────────────────────────────────── */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Log Work Session Manually"
        description="Enter the parameters below to add client billable work history."
      >
        <form onSubmit={handleManualLog} className={modalStyles.form}>
          <div className={modalStyles.field}>
            <label className={modalStyles.label}>Select Client Partner *</label>
            <select
              className={modalStyles.input}
              value={manualClient}
              onChange={e => setManualClient(e.target.value)}
              required
              style={{ background: 'var(--bg-main)' }}
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              <option value="Internal">Internal / None</option>
            </select>
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label}>Task Description *</label>
            <input
              className={modalStyles.input}
              placeholder="e.g. Frontend Architecture"
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={modalStyles.field}>
              <label className={modalStyles.label}>Hours Accrued *</label>
              <input
                type="number"
                step="0.1"
                className={modalStyles.input}
                placeholder="e.g. 3.5"
                value={manualHours}
                onChange={e => setManualHours(e.target.value)}
                required
              />
            </div>

            <div className={modalStyles.field}>
              <label className={modalStyles.label}>Hourly Rate (₦)</label>
              <input
                type="number"
                className={modalStyles.input}
                value={manualRate}
                onChange={e => setManualRate(e.target.value)}
              />
            </div>
          </div>

          <div className={modalStyles.field}>
            <label className={styles.billableLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={manualBillable}
                onChange={e => setManualBillable(e.target.checked)}
              />
              <span>This session is billable to the client</span>
            </label>
          </div>

          <div className={modalStyles.actions}>
            <Button variant="secondary" onClick={() => setIsManualModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Log Session</Button>
          </div>
        </form>
      </Modal>

    </ModulePage>
  );
}
