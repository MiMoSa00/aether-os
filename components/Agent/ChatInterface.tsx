'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ChatInterface.module.css';
import { Send, Bot, Trash2, Settings, FileText, Globe, Code, Zap, ChevronDown, Clock, MessageSquare, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { createClient } from '@/utils/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  user_id?: string;
  model?: string;
  session_id?: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  preview: string;
}

const MODEL_OPTIONS = [
  {
    provider: 'Claude',
    color: '#d97706',
    icon: '◆',
    models: [
      { id: 'claude-opus-4-8', label: 'Claude 4.8 Opus', desc: 'Most powerful reasoning' },
      { id: 'claude-sonnet-4-6', label: 'Claude 4.6 Sonnet', desc: 'Best quality & speed' },
      { id: 'claude-haiku-4-5', label: 'Claude 4.5 Haiku', desc: 'Ultra fast & efficient' },
    ],
  },
  {
    provider: 'Simulation',
    color: '#8b5cf6',
    icon: '✦',
    models: [
      { id: 'simulation', label: 'Simulation Mode', desc: 'Free local AI insights' },
    ],
  },
];

const ALL_MODELS = MODEL_OPTIONS.flatMap(p => p.models.map(m => ({ ...m, provider: p.provider, color: p.color, icon: p.icon })));

// ── Local storage helpers ──────────────────────────────────────────────────
const LS_SESSIONS_KEY = 'aether_chat_sessions';
const LS_ACTIVE_KEY   = 'aether_active_session';
const LS_MSGS_PREFIX  = 'aether_msgs_';

function lsSaveSessions(sessions: ChatSession[]) {
  try { localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}
function lsLoadSessions(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(LS_SESSIONS_KEY) || '[]'); } catch { return []; }
}
function lsSaveMsgs(sessionId: string, msgs: Message[]) {
  try { localStorage.setItem(LS_MSGS_PREFIX + sessionId, JSON.stringify(msgs)); } catch {}
}
function lsLoadMsgs(sessionId: string): Message[] {
  try { return JSON.parse(localStorage.getItem(LS_MSGS_PREFIX + sessionId) || '[]'); } catch { return []; }
}
function lsSaveActiveSession(id: string) {
  try { localStorage.setItem(LS_ACTIVE_KEY, id); } catch {}
}
function lsLoadActiveSession(): string | null {
  try { return localStorage.getItem(LS_ACTIVE_KEY); } catch { return null; }
}

export function ChatInterface() {
  const { clients, invoices, tasks, user } = useData();
  const supabase = createClient();

  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(ALL_MODELS[1]); // Claude Sonnet default
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [sessions, setSessions]         = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [dbHasSessionId, setDbHasSessionId] = useState<boolean | null>(null); // null = unknown

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const modelPickerRef  = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Save messages to localStorage whenever they change ─────────────────
  useEffect(() => {
    if (activeSession && messages.length > 0) {
      lsSaveMsgs(activeSession, messages);
    }
  }, [messages, activeSession]);

  // ── Persist session list to localStorage ───────────────────────────────
  const persistSessions = useCallback((list: ChatSession[]) => {
    setSessions(list);
    lsSaveSessions(list);
  }, []);

  // ── Build sessions list from messages array ────────────────────────────
  const buildSessionsFromMessages = useCallback((allMsgs: Message[]): ChatSession[] => {
    const sessionMap = new Map<string, { title: string; time: string }>();

    allMsgs.forEach((msg) => {
      const sid = msg.session_id || 'default';
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, { title: '', time: msg.created_at || new Date().toISOString() });
      }
      const entry = sessionMap.get(sid)!;
      if (msg.role === 'user' && !entry.title) {
        entry.title = msg.content;
      }
      // Keep the latest timestamp
      if (msg.created_at && msg.created_at > entry.time) {
        entry.time = msg.created_at;
      }
    });

    return Array.from(sessionMap.entries())
      .map(([id, val]) => ({
        id,
        title: (val.title || 'New conversation').slice(0, 45) + ((val.title || '').length > 45 ? '…' : ''),
        preview: val.title || 'New conversation',
        created_at: val.time,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, []);

  // ── Check if session_id column exists ─────────────────────────────────
  const checkDbSchema = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    // Try to fetch one message and see if session_id is present
    const { data, error } = await supabase
      .from('messages')
      .select('session_id')
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      // session_id column does not exist
      console.warn('session_id column missing from messages table. Using localStorage fallback.');
      setDbHasSessionId(false);
      return false;
    }
    setDbHasSessionId(true);
    return true;
  }, [user, supabase]);

  // ── Safe Supabase insert — only sends columns that exist in schema ──────
  const safeInsert = useCallback(async (msg: Message): Promise<boolean> => {
    // Start with only the columns we know for certain exist in all schemas
    const basePayload: Record<string, any> = {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      user_id: msg.user_id,
    };

    // Optionally add session_id if we know it exists (or haven't checked yet)
    if (dbHasSessionId !== false && msg.session_id) {
      basePayload.session_id = msg.session_id;
    }

    // Optionally add model field if msg has one
    if (msg.model) {
      basePayload.model = msg.model;
    }

    const { error } = await supabase.from('messages').insert([basePayload]);

    if (error) {
      const missingCol = error.message?.match(/Could not find the '(\w+)' column/)?.[1];

      if (missingCol === 'session_id') {
        setDbHasSessionId(false);
        delete basePayload.session_id;
        // Also remove model if present (it might also be missing)
        delete basePayload.model;
        const { error: err2 } = await supabase.from('messages').insert([basePayload]);
        if (!err2) return true;
      }

      if (missingCol === 'model' || error.message?.includes("'model'")) {
        // model column doesn't exist — strip it and retry
        delete basePayload.model;
        const { error: err3 } = await supabase.from('messages').insert([basePayload]);
        if (!err3) return true;
      }

      // If still failing, try absolute minimum payload
      const { error: err4 } = await supabase.from('messages').insert([{
        id: msg.id,
        role: msg.role,
        content: msg.content,
        user_id: msg.user_id,
      }]);

      if (err4) {
        console.error('Insert error (final attempt):', err4.message);
        return false;
      }
      return true;
    }
    return true;
  }, [dbHasSessionId, supabase]);

  // ── Load session ───────────────────────────────────────────────────────
  const loadSession = useCallback(async (sessionId: string) => {
    setActiveSession(sessionId);
    lsSaveActiveSession(sessionId);

    // First: load from localStorage instantly (no flash)
    const cachedMsgs = lsLoadMsgs(sessionId);
    if (cachedMsgs.length > 0) {
      setMessages(cachedMsgs);
    }

    if (!user) return;

    // Then: sync from Supabase
    if (dbHasSessionId) {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
        lsSaveMsgs(sessionId, data);
      }
    }
  }, [user, supabase, dbHasSessionId]);

  // ── New session ────────────────────────────────────────────────────────
  const newSession = useCallback(() => {
    const sid = `session-${Date.now()}`;
    setActiveSession(sid);
    lsSaveActiveSession(sid);
    const welcomeMsg: Message = {
      id: `welcome-${sid}`,
      role: 'assistant',
      content: 'Neural link established. I am **Aether AI** — powered by Claude. Select your preferred model and let\'s get to work. How can I help your agency today?',
      session_id: sid,
    };
    setMessages([welcomeMsg]);
    lsSaveMsgs(sid, [welcomeMsg]);
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────
  useEffect(() => {
    const initChat = async () => {
      // 1. Instantly restore from localStorage (zero flash on navigation)
      const cachedSessions = lsLoadSessions();
      const lastSessionId  = lsLoadActiveSession();

      if (lastSessionId) {
        setActiveSession(lastSessionId);
        const cachedMsgs = lsLoadMsgs(lastSessionId);
        if (cachedMsgs.length > 0) {
          setMessages(cachedMsgs);
        }
      }
      if (cachedSessions.length > 0) {
        setSessions(cachedSessions);
      }

      if (!user) return;

      // 2. Check schema, then sync from Supabase
      const hasSessionId = await checkDbSchema();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load messages:', error.message);
        // Keep whatever localStorage has
        if (!lastSessionId) newSession();
        return;
      }

      if (!data || data.length === 0) {
        // No messages in DB at all — start fresh
        if (!lastSessionId || lsLoadMsgs(lastSessionId).length === 0) {
          newSession();
        }
        return;
      }

      // 3. Build sessions from all DB messages
      const dbSessions = buildSessionsFromMessages(data);
      persistSessions(dbSessions);

      // 4. Determine which session to show
      let targetSession: string;

      if (hasSessionId) {
        // DB has session_id — find most recent session
        const latestMsg = [...data].sort(
          (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        targetSession = lastSessionId || latestMsg?.session_id || 'default';

        const sessionMsgs = data.filter((m: any) => (m.session_id || 'default') === targetSession);
        if (sessionMsgs.length > 0) {
          setMessages(sessionMsgs);
          setActiveSession(targetSession);
          lsSaveActiveSession(targetSession);
          lsSaveMsgs(targetSession, sessionMsgs);
        }
      } else {
        // DB has NO session_id column — show all messages in one conversation
        setMessages(data);
        const fallbackSid = lastSessionId || 'default';
        setActiveSession(fallbackSid);
        lsSaveActiveSession(fallbackSid);
        lsSaveMsgs(fallbackSid, data);
      }
    };

    initChat();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Send message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!user) return;

    const sessionId = activeSession || `session-${Date.now()}`;
    if (!activeSession) {
      setActiveSession(sessionId);
      lsSaveActiveSession(sessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      user_id: user.id,
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    lsSaveMsgs(sessionId, nextMessages); // Save to localStorage immediately

    await safeInsert(userMsg); // Save to Supabase

    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          context: { clients, invoices, tasks },
          model: selectedModel.id,
        }),
      });

      const data = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'No response received.',
        user_id: user.id,
        model: data.model,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      const withAiMsg = [...nextMessages, aiMsg];
      setMessages(withAiMsg);
      lsSaveMsgs(sessionId, withAiMsg); // Save AI response to localStorage immediately
      await safeInsert(aiMsg);
      setIsLoading(false);

      // Update session list
      const newSessionList = buildSessionsFromMessages(withAiMsg.map(m => ({ ...m, session_id: sessionId })));
      // Merge with existing sessions
      const mergedSessions = [...newSessionList];
      sessions.forEach(s => {
        if (!mergedSessions.find(ms => ms.id === s.id)) mergedSessions.push(s);
      });
      mergedSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      persistSessions(mergedSessions);

    } catch (error) {
      console.error('Aether AI Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Neural link interrupted. Please check your API keys and try again.',
        user_id: user.id,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
      const withError = [...nextMessages, errorMsg];
      setMessages(withError);
      lsSaveMsgs(sessionId, withError);
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    if (!activeSession) return;
    // Clear localStorage
    try { localStorage.removeItem(LS_MSGS_PREFIX + activeSession); } catch {}
    // Clear DB
    if (user) {
      await supabase.from('messages').delete().eq('user_id', user.id);
    }
    const updatedSessions = sessions.filter(s => s.id !== activeSession);
    persistSessions(updatedSessions);
    newSession();
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try { localStorage.removeItem(LS_MSGS_PREFIX + sessionId); } catch {}
    if (dbHasSessionId) {
      await supabase.from('messages').delete().eq('user_id', user.id).eq('session_id', sessionId);
    }
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    persistSessions(updatedSessions);
    if (activeSession === sessionId) newSession();
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* ── Left: Main Chat ────────────────────────────── */}
        <div className={styles.mainContent}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <Bot size={22} color="var(--accent-blue)" />
              <div>
                <h3 className={styles.headerTitle}>Aether AI</h3>
                <span className={styles.headerSub}>
                  Powered by {selectedModel.provider}
                </span>
              </div>
            </div>

            <div className={styles.headerRight}>
              {/* Model Picker */}
              <div ref={modelPickerRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className={styles.modelBtn}
                  style={{ borderColor: `${selectedModel.color}44` }}
                >
                  <span style={{ color: selectedModel.color }}>{selectedModel.icon}</span>
                  <span className={styles.modelLabel}>{selectedModel.label}</span>
                  <ChevronDown size={13} style={{ opacity: 0.6 }} />
                </button>

                <AnimatePresence>
                  {showModelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={styles.modelDropdown}
                    >
                      {MODEL_OPTIONS.map((provider) => (
                        <div key={provider.provider}>
                          <div className={styles.providerLabel} style={{ color: provider.color }}>
                            {provider.icon} {provider.provider}
                          </div>
                          {provider.models.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => { setSelectedModel({ ...m, provider: provider.provider, color: provider.color, icon: provider.icon }); setShowModelPicker(false); }}
                              className={styles.modelOption}
                              style={{ background: selectedModel.id === m.id ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                            >
                              <div className={styles.modelOptionLabel}>{m.label}</div>
                              <div className={styles.modelOptionDesc}>{m.desc}</div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={newSession} className={styles.iconButton} title="New Chat">
                <Plus size={17} />
              </button>
              <button onClick={clearSession} className={styles.iconButton} title="Clear Chat">
                <Trash2 size={17} />
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`${styles.iconButton} ${showSidebar ? styles.iconButtonActive : ''}`}
                title="Toggle Panel"
              >
                <Settings size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.ai}`}
                >
                  <div className={styles.bubble}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.model && msg.role === 'assistant' && (
                    <span className={styles.msgMeta}>{msg.model}</span>
                  )}
                </motion.div>
              ))}
              {isLoading && !streamingContent && (
                <div className={styles.thinking}>
                  <Zap size={13} className={styles.pulse} />
                  <span>Aether AI is thinking via {selectedModel.label}…</span>
                </div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                className={styles.textarea}
                placeholder={`Ask Aether AI (${selectedModel.label})…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                rows={1}
              />
              <button className={styles.sendButton} onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send size={17} />
              </button>
            </div>
            <p className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

        {/* ── Right: Info Sidebar ──────────────────────── */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              className={styles.sidebar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sidebar Close Header */}
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarHeaderTitle}>Config &amp; History</span>
                <button 
                  onClick={() => setShowSidebar(false)} 
                  className={styles.closeSidebarBtn}
                  title="Close panel"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Active Model */}
              <div className={styles.sidebarSection}>
                <h4 className={styles.sidebarTitle}>Active Model</h4>
                <div className={styles.statusCard}>
                  <div className={styles.modelCardRow}>
                    <span style={{ fontSize: '1.1rem', color: selectedModel.color }}>{selectedModel.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className={styles.modelCardName}>{selectedModel.label}</div>
                      <div className={styles.modelCardDesc}>{selectedModel.provider} · {selectedModel.desc}</div>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '80%', background: selectedModel.color }} />
                  </div>
                </div>
              </div>

              {/* Switch Model */}
              <div className={styles.sidebarSection}>
                <h4 className={styles.sidebarTitle}>Switch Model</h4>
                {MODEL_OPTIONS.map((provider) => (
                  <div key={provider.provider} className={styles.providerGroup}>
                    <div className={styles.providerGroupLabel} style={{ color: provider.color }}>
                      {provider.provider}
                    </div>
                    {provider.models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel({ ...m, provider: provider.provider, color: provider.color, icon: provider.icon })}
                        className={styles.sidebarModelBtn}
                        style={{
                          background: selectedModel.id === m.id ? `${provider.color}22` : 'rgba(255,255,255,0.03)',
                          borderColor: selectedModel.id === m.id ? `${provider.color}55` : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <div className={styles.sidebarModelName}>{m.label}</div>
                        <div className={styles.sidebarModelDesc}>{m.desc}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Capabilities */}
              <div className={styles.sidebarSection}>
                <h4 className={styles.sidebarTitle}>Capabilities</h4>
                <div className={styles.capabilityList}>
                  <div className={styles.capabilityItem}><Code size={13} /> Code &amp; Technical Help</div>
                  <div className={styles.capabilityItem}><Globe size={13} /> Business Strategy</div>
                  <div className={styles.capabilityItem}><FileText size={13} /> Invoice &amp; Client Analysis</div>
                  <div className={styles.capabilityItem}><Zap size={13} /> Agency Insights</div>
                </div>
              </div>

              {/* Chat History */}
              <div className={`${styles.sidebarSection} ${styles.historySection}`}>
                <div className={styles.historyHeader}>
                  <h4 className={styles.sidebarTitle} style={{ marginBottom: 0 }}>
                    <Clock size={12} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Chat History
                  </h4>
                  <button onClick={newSession} className={styles.newChatBtn} title="New Chat">
                    <Plus size={13} />
                  </button>
                </div>

                <div className={styles.historyList}>
                  {sessions.length === 0 && (
                    <div className={styles.historyEmpty}>
                      <MessageSquare size={18} style={{ opacity: 0.3 }} />
                      <span>No saved chats yet</span>
                    </div>
                  )}
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => loadSession(session.id)}
                      onKeyDown={(e) => e.key === 'Enter' && loadSession(session.id)}
                      className={`${styles.historyItem} ${activeSession === session.id ? styles.historyItemActive : ''}`}
                    >
                      <div className={styles.historyItemInner}>
                        <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
                        <span className={styles.historyItemTitle}>{session.title}</span>
                      </div>
                      <div className={styles.historyItemMeta}>
                        <span className={styles.historyItemTime}>{formatTime(session.created_at)}</span>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className={styles.deleteSessionBtn}
                          title="Delete chat"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
