'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { Clock, Play, Pause, Square, Plus, Trash2, DollarSign } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { createClient } from '@/utils/supabase/client';
import styles from './time-tracking.module.css';

interface TimeEntry {
  id: string;
  client: string;
  description: string;
  duration: number; // seconds
  billable: boolean;
  rate: number; // ₦ per hour
  date: string;
  user_id?: string;
}

const fmt = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const fmtHours = (secs: number) => `${(secs / 3600).toFixed(1)} hrs`;

export default function TimeTrackingPage() {
  const { clients, user, timeEntries, addTimeEntry, deleteTimeEntry } = useData();

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [accumulated, setAccumulated] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer form state
  const [timerClient, setTimerClient] = useState('');
  const [timerDesc, setTimerDesc] = useState('');
  const [timerRate, setTimerRate] = useState('5000');
  const [timerBillable, setTimerBillable] = useState(true);

  // Load saved timer state from localStorage
  useEffect(() => {
    const savedStart = localStorage.getItem('aether_timer_start');
    const savedAccumulated = localStorage.getItem('aether_timer_accumulated');
    const savedPaused = localStorage.getItem('aether_timer_paused');

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
  };

  const deleteEntry = (id: string) => {
    deleteTimeEntry(id);
  };

  // Summary stats
  const totalSecs = timeEntries.reduce((s, e) => s + e.duration, 0);
  const billableSecs = timeEntries.filter(e => e.billable).reduce((s, e) => s + e.duration, 0);
  const billableEarned = timeEntries.filter(e => e.billable).reduce((s, e) => s + (e.duration / 3600) * e.rate, 0);
  const todayEntries = timeEntries.filter(e => e.date === new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }));
  const todaySecs = todayEntries.reduce((s, e) => s + e.duration, 0);

  return (
    <ModulePage title="Time Tracking" subtitle="Track billable hours and convert them into invoices." icon={Clock}>
      <div className={styles.container}>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: "Today's Hours", value: fmtHours(todaySecs), color: '#60a5fa' },
            { label: 'Total Hours', value: fmtHours(totalSecs), color: '#a78bfa' },
            { label: 'Billable Hours', value: fmtHours(billableSecs), color: '#22c55e' },
            { label: 'Billable Value', value: `₦${Math.round(billableEarned).toLocaleString()}`, color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timer Card */}
        <div className={styles.timerCard}>
          <div className={styles.timerDisplay}>{fmt(elapsed)}</div>
          {running && <div className={styles.timerPulse} />}

          <div className={styles.timerForm}>
            <select
              className={styles.select}
              value={timerClient}
              onChange={e => setTimerClient(e.target.value)}
              disabled={running || paused}
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              <option value="Internal">Internal / Admin</option>
            </select>

            <input
              className={styles.input}
              placeholder="What are you working on?"
              value={timerDesc}
              onChange={e => setTimerDesc(e.target.value)}
              disabled={running || paused}
            />

            <div className={styles.timerMeta}>
              <label className={styles.billableToggle}>
                <input
                  type="checkbox"
                  checked={timerBillable}
                  onChange={e => setTimerBillable(e.target.checked)}
                  disabled={running || paused}
                />
                <span>Billable</span>
              </label>

              <div className={styles.rateInput}>
                <DollarSign size={14} />
                <input
                  type="number"
                  className={styles.rateField}
                  placeholder="Rate ₦/hr"
                  value={timerRate}
                  onChange={e => setTimerRate(e.target.value)}
                  disabled={running || paused}
                />
                <span>/hr</span>
              </div>
            </div>
          </div>

          <div className={styles.timerActions}>
            {(running || paused) ? (
              <>
                <button
                  className={running ? styles.pauseBtn : styles.resumeBtn}
                  onClick={running ? pauseTimer : resumeTimer}
                >
                  {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
                </button>
                <button
                  className={styles.stopBtn}
                  onClick={stopTimer}
                >
                  <Square size={18} /> Stop & Save
                </button>
              </>
            ) : (
              <button
                className={styles.startBtn}
                onClick={startTimer}
              >
                <Play size={18} /> Start Timer
              </button>
            )}
          </div>
        </div>

        {/* Entries Log */}
        <div className={styles.logSection}>
          <h3 className={styles.logTitle}>Time Log</h3>
          {timeEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <Clock size={40} style={{ opacity: 0.2 }} />
              <p>No time entries yet. Start the timer above to log your first session.</p>
            </div>
          ) : (
            <div className={styles.entryList}>
              {timeEntries.map(entry => (
                <div key={entry.id} className={styles.entryRow}>
                  <div className={styles.entryLeft}>
                    <div className={styles.entryClient}>{entry.client}</div>
                    <div className={styles.entryDesc}>{entry.description}</div>
                    <div className={styles.entryMeta}>{entry.date}</div>
                  </div>
                  <div className={styles.entryRight}>
                    <div className={styles.entryDuration}>{fmtHours(entry.duration)}</div>
                    {entry.billable && (
                      <div className={styles.entryBillable}>
                        ₦{Math.round((entry.duration / 3600) * entry.rate).toLocaleString()}
                      </div>
                    )}
                    <span className={entry.billable ? styles.billableBadge : styles.nonBillableBadge}>
                      {entry.billable ? 'Billable' : 'Non-billable'}
                    </span>
                    <button className={styles.deleteBtn} onClick={() => deleteEntry(entry.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ModulePage>
  );
}
