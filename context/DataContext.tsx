'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Task {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
  description?: string;
  dueDate?: string;
  assignee?: string;
  progress?: number; // 0-100
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface Client {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  due_date?: string;
  line_items?: Array<{ description: string; qty: number; unitPrice: number; total: number }>;
  notes?: string;
  paystack_reference?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

interface TimeEntry {
  id: string;
  client: string;
  description: string;
  duration: number; // seconds
  billable: boolean;
  rate: number; // ₦ per hour
  date: string;
}

interface Proposal {
  id: string;
  client: string;
  title: string;
  scope: string;
  deliverables: string;
  timeline: string;
  price: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  date: string;
}

interface Expense {
  id: string;
  name: string;
  amount: string;
  category: 'Software' | 'Travel' | 'Equipment' | 'Marketing' | 'Office Rent' | 'Other';
  date: string;
  client: string;
}

interface DataContextType {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  clients: Client[];
  invoices: Invoice[];
  notifications: Notification[];
  timeEntries: TimeEntry[];
  proposals: Proposal[];
  expenses: Expense[];
  payments: any[];
  user: any;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addTask: (columnId: string, content: string, priority: 'High' | 'Medium' | 'Low', description?: string, dueDate?: string, assignee?: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addClient: (name: string, role: string, email: string, phone: string) => void;
  addInvoice: (client: string, amount: string, due_date?: string, line_items?: any[], notes?: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: 'Paid' | 'Pending' | 'Overdue') => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  verifyInvoicePayment: (invoiceId: string, reference: string) => Promise<boolean>;
  moveTask: (activeId: string, overId: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning') => void;
  addTimeEntry: (client: string, description: string, duration: number, billable: boolean, rate: number) => void;
  deleteTimeEntry: (id: string) => void;
  addProposal: (client: string, title: string, scope: string, deliverables: string, timeline: string, price: string) => Promise<string>;
  updateProposalStatus: (id: string, status: Proposal['status']) => void;
  addExpense: (name: string, amount: string, category: Expense['category'], client: string) => void;
  deleteExpense: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

import { createClient } from '@/utils/supabase/client';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [columns, setColumns] = useState<Record<string, Column>>({
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('aether_theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = isSystemDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      if (defaultTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('aether_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Listen to auth changes to synchronize session globally without locks
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 1. Initial Load: Try LocalStorage first for instant UI, then sync with Supabase
  useEffect(() => {
    const loadLocal = () => {
      const savedTasks = localStorage.getItem('aether_tasks');
      const savedCols = localStorage.getItem('aether_cols');
      const savedClients = localStorage.getItem('aether_clients');
      const savedInvoices = localStorage.getItem('aether_invoices');
      const savedNotifs = localStorage.getItem('aether_notifs');
      const savedTime = localStorage.getItem('aether_time_entries');
      const savedProposals = localStorage.getItem('aether_proposals');
      const savedExpenses = localStorage.getItem('aether_expenses');
      const savedPayments = localStorage.getItem('aether_payments');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedCols) setColumns(JSON.parse(savedCols));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      if (savedTime) setTimeEntries(JSON.parse(savedTime));
      if (savedProposals) setProposals(JSON.parse(savedProposals));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedPayments) setPayments(JSON.parse(savedPayments));
    };

    const fetchData = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) return;
      setUser(supabaseUser);

      // Fetch Tasks
      const { data: taskData } = await supabase.from('tasks').select('*').eq('user_id', supabaseUser.id);
      if (taskData) {
        const taskMap: Record<string, Task> = {};
        const newCols: Record<string, Column> = { 
          'todo': { id: 'todo', title: 'To Do', taskIds: [] },
          'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
          'done': { id: 'done', title: 'Done', taskIds: [] },
        };
        
        taskData.forEach((t: any) => {
          taskMap[t.id] = { 
            id: t.id, 
            content: t.content, 
            priority: t.priority,
            description: t.description || undefined,
            dueDate: t.due_date || t.dueDate || undefined,
            assignee: t.assignee || undefined,
            progress: t.progress !== undefined ? t.progress : (t.status === 'done' ? 100 : t.status === 'in-progress' ? 50 : 0)
          };
          if (newCols[t.status as keyof typeof newCols]) {
            newCols[t.status as keyof typeof newCols].taskIds.push(t.id);
          }
        });
        setTasks(taskMap);
        setColumns(newCols);
        localStorage.setItem('aether_tasks', JSON.stringify(taskMap));
        localStorage.setItem('aether_cols', JSON.stringify(newCols));
      }

      // Fetch Clients
      const { data: clientData } = await supabase.from('clients').select('*').eq('user_id', supabaseUser.id);
      if (clientData) {
        setClients(clientData);
        localStorage.setItem('aether_clients', JSON.stringify(clientData));
      }

      // Fetch Invoices
      const { data: invoiceData } = await supabase.from('invoices').select('*').eq('user_id', supabaseUser.id);
      if (invoiceData) {
        const today = new Date();
        const updatedInvoices = invoiceData.map((inv: any) => {
          if (inv.status === 'Pending' && inv.due_date) {
            const due = new Date(inv.due_date);
            if (!isNaN(due.getTime()) && due < today) {
              return { ...inv, status: 'Overdue' };
            }
          }
          return inv;
        });
        setInvoices(updatedInvoices);
        localStorage.setItem('aether_invoices', JSON.stringify(updatedInvoices));
      }

      // Fetch Notifications
      const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', supabaseUser.id).order('created_at', { ascending: false });
      if (notifData) {
        setNotifications(notifData);
        localStorage.setItem('aether_notifs', JSON.stringify(notifData));
      }

      // Fetch Time Entries
      try {
        const { data: timeData } = await supabase.from('time_entries').select('*').eq('user_id', supabaseUser.id);
        if (timeData) {
          setTimeEntries(timeData);
          localStorage.setItem('aether_time_entries', JSON.stringify(timeData));
        }
      } catch {}

      // Fetch Proposals
      try {
        const { data: proposalData } = await supabase.from('proposals').select('*').eq('user_id', supabaseUser.id);
        if (proposalData) {
          setProposals(proposalData);
          localStorage.setItem('aether_proposals', JSON.stringify(proposalData));
        }
      } catch {}

      // Fetch Expenses
      try {
        const { data: expenseData } = await supabase.from('expenses').select('*').eq('user_id', supabaseUser.id);
        if (expenseData) {
          setExpenses(expenseData);
          localStorage.setItem('aether_expenses', JSON.stringify(expenseData));
        }
      } catch {}

      // Fetch Payments
      try {
        const { data: paymentData } = await supabase.from('payments').select('*').eq('user_id', supabaseUser.id);
        if (paymentData) {
          setPayments(paymentData);
          localStorage.setItem('aether_payments', JSON.stringify(paymentData));
        }
      } catch {}
      
      setIsLoaded(true);
    };

    loadLocal();
    fetchData();
  }, [supabase]);

  // 2. Helper to update both storages
  const updateStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    if (!user) return;

    const newNotif = {
      id: String(Date.now()),
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      user_id: user.id
    };

    setNotifications(prev => {
      const next = [newNotif, ...prev];
      updateStorage('aether_notifs', next);
      return next;
    });
    await supabase.from('notifications').insert([newNotif]);
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      updateStorage('aether_notifs', next);
      return next;
    });
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const addTask = async (columnId: string, content: string, priority: 'High' | 'Medium' | 'Low', description?: string, dueDate?: string, assignee?: string) => {
    if (!user) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, content, priority, status: columnId, user_id: user.id, description, due_date: dueDate, assignee };
    
    setTasks(prev => {
      const next = { ...prev, [newTaskId]: { id: newTaskId, content, priority, description, dueDate, assignee, progress: 0 } };
      updateStorage('aether_tasks', next);
      return next;
    });
    setColumns(prev => {
      const next = { ...prev, [columnId]: { ...prev[columnId], taskIds: [...prev[columnId].taskIds, newTaskId] } };
      updateStorage('aether_cols', next);
      return next;
    });

    await supabase.from('tasks').insert([newTask]);
  };

  const deleteTask = async (taskId: string) => {
    // Remove from columns
    setColumns(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(colId => {
        next[colId] = { ...next[colId], taskIds: next[colId].taskIds.filter(id => id !== taskId) };
      });
      updateStorage('aether_cols', next);
      return next;
    });
    // Remove from tasks
    setTasks(prev => {
      const next = { ...prev };
      delete next[taskId];
      updateStorage('aether_tasks', next);
      return next;
    });
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch {}
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const next = { ...prev, [taskId]: { ...prev[taskId], ...updates } };
      updateStorage('aether_tasks', next);
      return next;
    });
    try {
      const dbUpdates: Record<string, any> = { ...updates };
      if (updates.dueDate !== undefined) { dbUpdates.due_date = updates.dueDate; delete dbUpdates.dueDate; }
      await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    } catch {}
  };

  const addClient = async (name: string, role: string, email: string, phone: string) => {
    if (!user) return;

    const newClient = { id: String(Date.now()), name, role, email, phone, user_id: user.id };
    setClients(prev => {
      const next = [...prev, newClient];
      updateStorage('aether_clients', next);
      return next;
    });
    await supabase.from('clients').insert([newClient]);
  };

  const addInvoice = async (client: string, amount: string, due_date?: string, line_items?: any[], notes?: string) => {
    if (!user) return;

    const ref = `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newInvoice: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      client,
      amount: `₦${amount}`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      due_date: due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      line_items: line_items || [],
      notes: notes || '',
      paystack_reference: ref
    };
    
    setInvoices(prev => {
      const next = [...prev, newInvoice];
      updateStorage('aether_invoices', next);
      return next;
    });
    
    // Add success notification
    await addNotification(
      'Invoice Generated',
      `Invoice ${newInvoice.id} for ${client} of ₦${amount} has been successfully created.`,
      'success'
    );

    try {
      await supabase.from('invoices').insert([{ ...newInvoice, user_id: user.id }]);
    } catch (e) {
      console.error("Supabase insert invoice failed:", e);
    }
  };

  const updateInvoiceStatus = async (id: string, status: 'Paid' | 'Pending' | 'Overdue') => {
    setInvoices(prev => {
      const next = prev.map(inv => inv.id === id ? { ...inv, status } : inv);
      updateStorage('aether_invoices', next);
      return next;
    });
    try {
      await supabase.from('invoices').update({ status }).eq('id', id);
    } catch (e) {
      console.error("Supabase update status failed:", e);
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => {
      const next = prev.filter(inv => inv.id !== id);
      updateStorage('aether_invoices', next);
      return next;
    });
    try {
      await supabase.from('invoices').delete().eq('id', id);
      await addNotification('Invoice Deleted', `Invoice ${id} has been deleted.`, 'info');
    } catch (e) {
      console.error("Supabase delete invoice failed:", e);
    }
  };

  const verifyInvoicePayment = async (invoiceId: string, reference: string) => {
    try {
      const res = await fetch(`/api/payments/verify-invoice?reference=${reference}&invoice_id=${invoiceId}`);
      const data = await res.json();
      if (data.status === 'Paid') {
        setInvoices(prev => {
          const next = prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv);
          updateStorage('aether_invoices', next);
          return next;
        });
        await addNotification('Payment Confirmed', `Invoice ${invoiceId} has been successfully paid via Paystack!`, 'success');
        return true;
      }
      return false;
    } catch (e) {
      console.error("Verify invoice payment failed:", e);
      return false;
    }
  };

  const moveTask = async (activeId: string, overId: string) => {
    let newStatus = '';
    
    setColumns(prev => {
      let activeColId: string | null = null;
      let overColId: string | null = null;

      Object.keys(prev).forEach(colId => {
        if (prev[colId].taskIds.includes(activeId)) activeColId = colId;
        if (prev[colId].taskIds.includes(overId)) overColId = colId;
      });

      if (!overColId && prev[overId]) overColId = overId;
      if (!activeColId || !overColId) return prev;

      newStatus = overColId;

      if (activeColId === overColId) {
        const col = prev[activeColId];
        const oldIndex = col.taskIds.indexOf(activeId);
        const newIndex = col.taskIds.indexOf(overId);
        return {
          ...prev,
          [activeColId]: { ...col, taskIds: arrayMove(col.taskIds, oldIndex, newIndex) }
        };
      }

      const sourceCol = prev[activeColId];
      const destCol = prev[overColId];
      const sourceIndex = sourceCol.taskIds.indexOf(activeId);
      const destIndex = destCol.taskIds.includes(overId) ? destCol.taskIds.indexOf(overId) : destCol.taskIds.length;

      const newSourceTasks = [...sourceCol.taskIds];
      newSourceTasks.splice(sourceIndex, 1);
      const newDestTasks = [...destCol.taskIds];
      newDestTasks.splice(destIndex, 0, activeId);

      return {
        ...prev,
        [activeColId]: { ...sourceCol, taskIds: newSourceTasks },
        [overColId]: { ...destCol, taskIds: newDestTasks }
      };
    });

    if (newStatus) {
      // Automatically adjust progress according to target column
      let autoProgress = 0;
      if (newStatus === 'in-progress') autoProgress = 50;
      else if (newStatus === 'done') autoProgress = 100;
      else if (newStatus === 'todo') autoProgress = 0;

      setTasks(prev => {
        if (!prev[activeId]) return prev;
        const next = {
          ...prev,
          [activeId]: {
            ...prev[activeId],
            progress: autoProgress
          }
        };
        updateStorage('aether_tasks', next);
        return next;
      });

      try {
        await supabase.from('tasks').update({ status: newStatus, progress: autoProgress }).eq('id', activeId);
      } catch (e) {
        console.error("Supabase move task failed:", e);
      }
    }
  };

  const addTimeEntry = async (client: string, description: string, duration: number, billable: boolean, rate: number) => {
    if (!user) return;
    const newEntry: TimeEntry = {
      id: String(Date.now()),
      client,
      description: description || 'Work session',
      duration,
      billable,
      rate,
      date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setTimeEntries(prev => {
      const next = [newEntry, ...prev];
      updateStorage('aether_time_entries', next);
      return next;
    });
    try {
      await supabase.from('time_entries').insert([{ ...newEntry, user_id: user.id }]);
    } catch {}
  };

  const deleteTimeEntry = async (id: string) => {
    setTimeEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      updateStorage('aether_time_entries', next);
      return next;
    });
    try {
      await supabase.from('time_entries').delete().eq('id', id);
    } catch {}
  };

  const addProposal = async (client: string, title: string, scope: string, deliverables: string, timeline: string, price: string) => {
    if (!user) return '';
    const id = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProposal: Proposal = {
      id,
      client,
      title,
      scope,
      deliverables,
      timeline,
      price: price.startsWith('₦') ? price : `₦${price}`,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setProposals(prev => {
      const next = [newProposal, ...prev];
      updateStorage('aether_proposals', next);
      return next;
    });
    try {
      await supabase.from('proposals').insert([{ ...newProposal, user_id: user.id }]);
    } catch {}
    return id;
  };

  const updateProposalStatus = async (id: string, status: Proposal['status']) => {
    setProposals(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status } : p);
      updateStorage('aether_proposals', next);
      return next;
    });
    try {
      await supabase.from('proposals').update({ status }).eq('id', id);
    } catch {}
  };

  const addExpense = async (name: string, amount: string, category: Expense['category'], client: string) => {
    if (!user) return;
    const newExpense: Expense = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      amount: amount.startsWith('₦') ? amount : `₦${amount}`,
      category,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      client
    };
    setExpenses(prev => {
      const next = [newExpense, ...prev];
      updateStorage('aether_expenses', next);
      return next;
    });
    try {
      await supabase.from('expenses').insert([{ ...newExpense, user_id: user.id }]);
    } catch {}
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      updateStorage('aether_expenses', next);
      return next;
    });
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch {}
  };

  return (
    <DataContext.Provider value={{ 
      tasks, 
      columns, 
      clients, 
      invoices, 
      notifications,
      timeEntries,
      proposals,
      expenses,
      payments,
      user,
      theme,
      toggleTheme,
      addTask,
      deleteTask,
      updateTask,
      addClient, 
      addInvoice, 
      updateInvoiceStatus,
      deleteInvoice,
      verifyInvoicePayment,
      moveTask,
      markNotificationRead,
      addNotification,
      addTimeEntry,
      deleteTimeEntry,
      addProposal,
      updateProposalStatus,
      addExpense,
      deleteExpense
    }}>
      {children}
    </DataContext.Provider>
  );
}

// Helper
function arrayMove(array: string[], from: number, to: number) {
  const newArray = [...array];
  newArray.splice(to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
