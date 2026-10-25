'use client';

import React, { useState, useMemo } from 'react';
import { ModulePage } from '@/components/Layout/ModulePage';
import { 
  FileText, Plus, CheckCircle2, Clock, AlertCircle, 
  ArrowLeft, Trash2, Link as LinkIcon, Download, Sparkles 
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useDirectorInvoices } from '@/lib/useClientData';
import styles from './invoices.module.css';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export default function InvoicesPage() {
  const { clients } = useData();
  const { invoices: directorInvoices, loading: isLoadingInvoices, refetch } = useDirectorInvoices();
  
  // View mode: 'list' | 'create'
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [isLoadingPaystack, setIsLoadingPaystack] = useState(false);
  const [paystackError, setPaystackError] = useState('');

  // Form states for Create Invoice
  const [selectedClient, setSelectedClient] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Creative Direction', qty: 1, rate: 850000 },
  ]);
  const [terms, setTerms] = useState(
    'Payment due within 14 days of invoice date. Please use invoice ID as payment reference.'
  );

  const parseAmount = (amt: string) => parseFloat(amt.replace(/[^0-9.-]+/g, '')) || 0;

  // Send invoice to client
  const handleSendInvoice = async () => {
    if (!selectedClient) {
      alert('Please select a client.');
      return;
    }
    if (lineItems.some(item => !item.description.trim())) {
      alert('Please fill in description for all line items.');
      return;
    }

    setIsLoadingPaystack(true);
    setPaystackError('');

    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const selectedClientRecord = clients.find(client => client.name === selectedClient);

      const response = await fetch('/api/director/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: selectedClient,
          client_email: selectedClientRecord?.email || '',
          invoice_number: invoiceNumber,
          description: `${projectRef ? `Project: ${projectRef} - ` : ''}${lineItems.map(i => i.description).join(', ')}`,
          amount_ngn: Math.round(totalDue),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPaystackError(data.error || 'Failed to send invoice');
        setIsLoadingPaystack(false);
        return;
      }

      // Show success message
      alert(`Invoice #${invoiceNumber} sent to ${selectedClient}!`);
      
      // Reset Form
      setSelectedClient('');
      setProjectRef('');
      setLineItems([{ id: '1', description: 'Creative Direction', qty: 1, rate: 850000 }]);
      setTerms('Payment due within 14 days of invoice date. Please use invoice ID as payment reference.');
      
      // Refetch invoices first, then switch to list view
      await refetch();
      
      // Small delay to ensure state updates
      setTimeout(() => setViewMode('list'), 300);
    } catch (error: any) {
      setPaystackError(error.message || 'An error occurred');
      setIsLoadingPaystack(false);
    } finally {
      setIsLoadingPaystack(false);
    }
  };

  // Add line item row
  const addLineItem = () => {
    const newId = String(Date.now());
    setLineItems([...lineItems, { id: newId, description: '', qty: 1, rate: 0 }]);
  };

  // Remove line item row
  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  // Update line item row field
  const updateLineItem = (id: string, field: keyof LineItem, val: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Calculate invoice values dynamically
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, [lineItems]);

  const vat = useMemo(() => {
    return Math.round(subtotal * 0.075);
  }, [subtotal]);

  const totalDue = subtotal + vat;

  // Save new invoice
  // All invoices are now sent directly to clients via handleSendInvoice
  // No draft saving needed

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Paid': return styles.statusPaid;
      case 'Overdue': return styles.statusOverdue;
      default: return styles.statusPending;
    }
  };

  return (
    <ModulePage 
      title="Invoices" 
      subtitle="Issue professional invoices, track payments, and collect client settlements in Naira." 
      icon={FileText}
    >
      <div className={styles.container}>

        {/* ─── LIST VIEW ─── */}
        {viewMode === 'list' && (
          <>
            <div className={styles.actionRow}>
              <button 
                onClick={() => setViewMode('create')}
                className={styles.generateBtn}
              >
                <Plus size={18} /> New Invoice
              </button>
            </div>

            <div className={styles.invoiceList}>
              {isLoadingInvoices ? (
                <div className={styles.emptyState}>
                  <FileText size={48} className={styles.emptyIcon} />
                  <p>Loading invoices...</p>
                </div>
              ) : directorInvoices.length > 0 ? (
                directorInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <div key={inv.id} className={styles.invoiceItem}>
                      <div className={styles.leftSection}>
                        <div className={styles.iconWrapper}>
                          <FileText size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <div className={styles.clientName}>{inv.client_name}</div>
                          <div className={styles.metaText}>{inv.invoice_number} &bull; Created {new Date(inv.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={styles.rightSection}>
                        <div className={styles.amount}>₦{inv.amount_ngn.toLocaleString()}</div>
                        <div className={`${styles.statusBadge} ${getStatusClass(isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending')}`}>
                          {isPaid ? (
                            <><CheckCircle2 size={12} /> Paid</>
                          ) : isOverdue ? (
                            <><AlertCircle size={12} /> Overdue</>
                          ) : (
                            <><Clock size={12} /> Pending</>
                          )}
                        </div>
                        <button 
                          className={styles.deleteBtn}
                          title="Delete invoice record"
                          disabled
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <FileText size={48} className={styles.emptyIcon} />
                  <p>No invoices created yet. Click &ldquo;New Invoice&rdquo; above to get started.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── CREATE INVOICE VIEW ─── */}
        {viewMode === 'create' && (
          <div className={styles.createLayout}>
            
            {/* Back Button */}
            <div className={styles.backLinkRow}>
              <button onClick={() => setViewMode('list')} className={styles.backBtn}>
                <ArrowLeft size={16} /> Back to Invoices
              </button>
            </div>

            <h2 className={styles.pageHeaderTitle}>Create New Invoice</h2>
            <p className={styles.pageHeaderSub}>INV-{Date.now().toString().slice(-4)} &bull; Draft Mode</p>

            <div className={styles.editorGrid}>
              
              {/* Left Form Area */}
              <div className={styles.editorLeft}>
                
                {/* Client details */}
                <div className={styles.card}>
                  <h3 className={styles.cardSectionTitle}>Client Details</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Client / Agency Partner</label>
                      <select 
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Project Reference</label>
                      <input 
                        type="text"
                        placeholder="e.g. Brand Identity Overhaul"
                        value={projectRef}
                        onChange={(e) => setProjectRef(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardSectionTitle}>Line Items</h3>
                  
                  {/* Items Header */}
                  <div className={styles.lineItemsHeader}>
                    <span className={styles.itemHeaderDesc}>Description</span>
                    <span className={styles.itemHeaderQty}>Qty</span>
                    <span className={styles.itemHeaderRate}>Rate (₦)</span>
                    <span className={styles.itemHeaderAmt}>Amount</span>
                  </div>

                  {/* Line Item List */}
                  <div className={styles.lineItemList}>
                    {lineItems.map((item) => (
                      <div key={item.id} className={styles.lineItemRow}>
                        <div className={styles.itemDescCol}>
                          <input 
                            type="text"
                            placeholder="Service description"
                            className={styles.itemInputDesc}
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          />
                        </div>
                        <div className={styles.itemQtyCol}>
                          <input 
                            type="number"
                            className={styles.itemInputQty}
                            value={item.qty}
                            onChange={(e) => updateLineItem(item.id, 'qty', Number(e.target.value))}
                          />
                        </div>
                        <div className={styles.itemRateCol}>
                          <input 
                            type="number"
                            className={styles.itemInputRate}
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div className={styles.itemTotalCol}>
                          <span className={styles.itemTotalText}>
                            ₦{(item.qty * item.rate).toLocaleString()}
                          </span>
                          <button 
                            type="button"
                            className={styles.itemRemoveBtn}
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            title="Remove row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    className={styles.addLineItemBtn}
                    onClick={addLineItem}
                  >
                    <Plus size={15} /> Add Line Item
                  </button>
                </div>

                {/* Terms and Notes Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardSectionTitle}>Terms &amp; Notes</h3>
                  <textarea 
                    className={styles.textarea}
                    rows={3}
                    placeholder="Enter terms, milestones or payment info..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>

              </div>

              {/* Right Summary Sidebar */}
              <div className={styles.editorRight}>
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryCardTitle}>Summary</h3>
                  
                  <div className={styles.summaryDetailList}>
                    <div className={styles.summaryDetailRow}>
                      <span className={styles.summaryDetailLabel}>Subtotal</span>
                      <span className={styles.summaryDetailValue}>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryDetailRow}>
                      <span className={styles.summaryDetailLabel}>VAT (7.5%)</span>
                      <span className={styles.summaryDetailValue}>₦{vat.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.summaryTotalBlock}>
                    <div className={styles.summaryTotalRow}>
                      <span className={styles.summaryTotalLabel}>Total Due</span>
                      <span className={styles.summaryTotalValue}>₦{totalDue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.summaryActionBlock}>
                    {/* Error message */}
                    {paystackError && (
                      <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: '8px' }}>
                        {paystackError}
                      </div>
                    )}

                    {/* Send Invoice Button */}
                    <button 
                      type="button" 
                      className={styles.paystackBtn}
                      onClick={handleSendInvoice}
                      disabled={isLoadingPaystack}
                      style={{ opacity: isLoadingPaystack ? 0.6 : 1, cursor: isLoadingPaystack ? 'not-allowed' : 'pointer' }}
                    >
                      <LinkIcon size={14} /> {isLoadingPaystack ? 'Sending...' : 'Send Invoice to Client'}
                    </button>
                  </div>

                  {/* Integration Branding Badge */}
                  <div className={styles.poweredByBadge}>
                    <span>Powered by</span>
                    <strong className={styles.paystackLogo}>paystack</strong>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </ModulePage>
  );
}
