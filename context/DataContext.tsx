'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Task {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
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
  status: 'Paid' | 'Pending';
  date: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

interface DataContextType {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  clients: Client[];
  invoices: Invoice[];
  notifications: Notification[];
  user: any;
  addTask: (columnId: string, content: string, priority: 'High' | 'Medium' | 'Low') => void;
  addClient: (name: string, role: string, email: string, phone: string) => void;
  addInvoice: (client: string, amount: string) => void;
  updateInvoiceStatus: (id: string, status: 'Paid' | 'Pending') => void;
  moveTask: (activeId: string, overId: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning') => void;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

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

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedCols) setColumns(JSON.parse(savedCols));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
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
          taskMap[t.id] = { id: t.id, content: t.content, priority: t.priority };
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
        setInvoices(invoiceData);
        localStorage.setItem('aether_invoices', JSON.stringify(invoiceData));
      }

      // Fetch Notifications
      const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', supabaseUser.id).order('created_at', { ascending: false });
      if (notifData) {
        setNotifications(notifData);
        localStorage.setItem('aether_notifs', JSON.stringify(notifData));
      }
      
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

  const addTask = async (columnId: string, content: string, priority: 'High' | 'Medium' | 'Low') => {
    if (!user) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, content, priority, status: columnId, user_id: user.id };
    
    setTasks(prev => {
      const next = { ...prev, [newTaskId]: { id: newTaskId, content, priority } };
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

  const addInvoice = async (client: string, amount: string) => {
    if (!user) return;

    const newInvoice: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      client,
      amount: `₦${amount}`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    setInvoices(prev => {
      const next = [...prev, newInvoice];
      updateStorage('aether_invoices', next);
      return next;
    });
    await supabase.from('invoices').insert([{ ...newInvoice, user_id: user.id }]);
  };

  const updateInvoiceStatus = async (id: string, status: 'Paid' | 'Pending') => {
    setInvoices(prev => {
      const next = prev.map(inv => inv.id === id ? { ...inv, status } : inv);
      updateStorage('aether_invoices', next);
      return next;
    });
    await supabase.from('invoices').update({ status }).eq('id', id);
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
      await supabase.from('tasks').update({ status: newStatus }).eq('id', activeId);
    }
  };

  return (
    <DataContext.Provider value={{ 
      tasks, 
      columns, 
      clients, 
      invoices, 
      notifications,
      user,
      addTask, 
      addClient, 
      addInvoice, 
      updateInvoiceStatus,
      moveTask,
      markNotificationRead,
      addNotification
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
