'use client';

import React, { useState } from 'react';
import styles from './payouts.module.css';
import { 
  Landmark, 
  Wallet, 
  Banknote, 
  Send, 
  ReceiptText, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  X,
  History,
  ArrowRight
} from 'lucide-react';

interface Transaction {
  id: string;
  recipient: string;
  reference: string;
  date: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  account: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    recipient: 'Kolawole Studios',
    reference: 'Q3 Campaign Production',
    date: 'Oct 24, 2023 14:30 WAT',
    amount: 350000,
    status: 'SUCCESS',
    account: 'GTBank •••• 4912'
  },
  {
    id: 'tx-2',
    recipient: 'TechTribe Agency',
    reference: 'API Integration Milestone 2',
    date: 'Oct 24, 2023 10:15 WAT',
    amount: 180000,
    status: 'PENDING',
    account: 'Access Bank •••• 8201'
  },
  {
    id: 'tx-3',
    recipient: 'Ngozi & Co',
    reference: 'Invalid Account Number error',
    date: 'Oct 22, 2023 16:45 WAT',
    amount: 150000,
    status: 'FAILED',
    account: 'Zenith Bank •••• 5530'
  },
  {
    id: 'tx-4',
    recipient: 'Freelance Writer Hub',
    reference: 'Blog Posts Sept Batch',
    date: 'Oct 20, 2023 09:00 WAT',
    amount: 75000,
    status: 'SUCCESS',
    account: 'Kuda Bank •••• 1044'
  }
];

export default function BankPayoutsPage() {
  const [balance, setBalance] = useState<number>(1250000);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Form State
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [showFundModal, setShowFundModal] = useState<boolean>(false);
  const [fundAmount, setFundAmount] = useState<string>('500000');
  const [showAddRecipientModal, setShowAddRecipientModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Recipient Form
  const [newRecipName, setNewRecipName] = useState('');
  const [newBank, setNewBank] = useState('Guaranty Trust Bank (GTBank)');
  const [newAccountNum, setNewAccountNum] = useState('');

  const [savedRecipients, setSavedRecipients] = useState([
    { name: 'Kolawole Studios', bank: 'GTBank', account: '•••• 4912' },
    { name: 'TechTribe Agency', bank: 'Access Bank', account: '•••• 8201' },
    { name: 'Ngozi & Co', bank: 'Zenith Bank', account: '•••• 5530' },
    { name: 'Freelance Writer Hub', bank: 'Kuda Bank', account: '•••• 1044' }
  ]);

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const payoutFee = numAmount > 0 ? 50 : 0;

  const handleAuthorizePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || numAmount <= 0) return;

    if (numAmount + payoutFee > balance) {
      alert('Insufficient wallet balance to authorize this disbursement.');
      return;
    }

    const recipObj = savedRecipients.find(r => r.name === selectedRecipient);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      recipient: selectedRecipient,
      reference: reference.trim() || 'Subcontractor Disbursement',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT',
      amount: numAmount,
      status: 'SUCCESS',
      account: recipObj ? `${recipObj.bank} ${recipObj.account}` : 'Direct Transfer'
    };

    setBalance(prev => prev - (numAmount + payoutFee));
    setTransactions([newTx, ...transactions]);
    setAmount('');
    setReference('');
    setSelectedRecipient('');
    setNotification(`Successfully authorized ₦${numAmount.toLocaleString()} to ${selectedRecipient}`);

    setTimeout(() => setNotification(null), 4500);
  };

  const handleFundWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const fundNum = parseFloat(fundAmount) || 0;
    if (fundNum > 0) {
      setBalance(prev => prev + fundNum);
      setShowFundModal(false);
      setNotification(`Wallet funded with ₦${fundNum.toLocaleString()} via Paystack!`);
      setTimeout(() => setNotification(null), 4500);
    }
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newAccountNum.trim()) return;

    const newEntry = {
      name: newRecipName,
      bank: newBank,
      account: `•••• ${newAccountNum.slice(-4)}`
    };

    setSavedRecipients([...savedRecipients, newEntry]);
    setSelectedRecipient(newRecipName);
    setNewRecipName('');
    setNewAccountNum('');
    setShowAddRecipientModal(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Header */}
        <header className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Bank Payouts</h1>
          <p className={styles.pageSubtitle}>
            Manage subcontractor payments and vendor disbursements directly via Paystack integration.
          </p>
        </header>

        {/* Notification Toast */}
        {notification && (
          <div className={styles.notificationToast}>
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Card 1: Wallet Balance */}
        <div className={styles.walletCard}>
          <div className={styles.walletTop}>
            <div className={styles.walletLabelBox}>
              <Landmark size={18} className={styles.walletIcon} />
              <span className={styles.walletLabel}>WALLET BALANCE</span>
            </div>
            <div className={styles.watermarkWrapper}>
              <Wallet size={80} className={styles.walletWatermark} />
            </div>
          </div>

          <div className={styles.walletAmountSection}>
            <div className={styles.bigAmount}>
              ₦{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={styles.updatedIndicator}>
              <span className={styles.greenArrow}>↑</span> Updated just now
            </div>
          </div>

          <div className={styles.walletDivider} />

          <div className={styles.walletActions}>
            <button className={styles.walletBtn} onClick={() => setShowFundModal(true)}>
              <Plus size={16} /> FUND WALLET
            </button>
            <button className={styles.walletBtn} onClick={() => {
              const el = document.getElementById('recent-tx-card');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <History size={16} /> VIEW LEDGER
            </button>
          </div>
        </div>

        {/* Card 2: New Payout */}
        <div className={styles.payoutCard}>
          <div className={styles.cardHeader}>
            <div className={styles.payoutHeaderLeft}>
              <Banknote size={20} className={styles.cardHeaderIcon} />
              <h2 className={styles.cardTitle}>New Payout</h2>
            </div>
          </div>

          <form onSubmit={handleAuthorizePayout} className={styles.payoutForm}>
            {/* Field 1: Recipient */}
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.fieldLabel}>SELECT VENDOR / SUBCONTRACTOR</label>
                <button 
                  type="button" 
                  className={styles.addRecipLink}
                  onClick={() => setShowAddRecipientModal(true)}
                >
                  + Add Recipient
                </button>
              </div>
              <select 
                value={selectedRecipient} 
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setShowAddRecipientModal(true);
                  } else {
                    setSelectedRecipient(e.target.value);
                  }
                }}
                className={styles.selectInput}
                required
              >
                <option value="">Select a saved recipient...</option>
                {savedRecipients.map((r, i) => (
                  <option key={i} value={r.name}>
                    {r.name} ({r.bank} {r.account})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Amount */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>AMOUNT (₦)</label>
              <div className={styles.currencyInputWrapper}>
                <span className={styles.nairaPrefix}>₦</span>
                <input 
                  type="text" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setAmount(val);
                  }}
                  className={styles.amountInput}
                  required
                />
              </div>
              <div className={styles.amountMetaRow}>
                <span className={styles.metaFee}>Fee: ₦50.00</span>
                <span className={styles.metaAvailable}>
                  Available: ₦{balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Field 3: Reference */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>PAYMENT REFERENCE</label>
              <input 
                type="text" 
                placeholder="e.g. Q3 Campaign Assets"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className={styles.textInput}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={styles.authorizeBtn}
              disabled={!selectedRecipient || numAmount <= 0}
            >
              <Send size={18} />
              AUTHORIZE PAYOUT
            </button>
          </form>
        </div>

        {/* Card 3: Recent Transactions */}
        <div className={styles.transactionsCard} id="recent-tx-card">
          <div className={styles.txHeader}>
            <div className={styles.txHeaderLeft}>
              <ReceiptText size={20} className={styles.cardHeaderIcon} />
              <h2 className={styles.cardTitle}>Recent Transactions</h2>
            </div>
            <button className={styles.filterBtn} title="Filter Transactions">
              <Filter size={18} />
            </button>
          </div>

          <div className={styles.txTable}>
            <div className={styles.txTableHead}>
              <span className={styles.thRecipient}>RECIPIENT / REF</span>
              <span className={styles.thDate}>DATE</span>
              <span className={styles.thAmount}>AMOUNT</span>
              <span className={styles.thStatus}>STATUS</span>
            </div>

            <div className={styles.txList}>
              {transactions.map((tx) => (
                <div key={tx.id} className={styles.txRow}>
                  <div className={styles.recipientCell}>
                    <span className={styles.recipName}>{tx.recipient}</span>
                    <span className={styles.recipRef}>{tx.reference}</span>
                  </div>

                  <div className={styles.dateCell}>
                    {tx.date}
                  </div>

                  <div className={styles.amountCell}>
                    ₦{tx.amount.toLocaleString()}
                  </div>

                  <div className={styles.statusCell}>
                    <span className={`${styles.statusBadge} ${styles[tx.status.toLowerCase()]}`}>
                      {tx.status === 'SUCCESS' && <CheckCircle2 size={12} />}
                      {tx.status === 'PENDING' && <Clock size={12} />}
                      {tx.status === 'FAILED' && <AlertCircle size={12} />}
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.viewAllFooter}>
            <button className={styles.viewAllBtn} onClick={() => alert('Full settlement ledger downloaded.')}>
              VIEW ALL TRANSACTIONS <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFundModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Fund Studio Wallet</h3>
                <p className={styles.modalSub}>Instant top-up via Paystack virtual account or debit card</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowFundModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFundWallet} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Amount to Deposit (₦)</label>
                <input 
                  type="number" 
                  value={fundAmount} 
                  onChange={(e) => setFundAmount(e.target.value)}
                  className={styles.textInput}
                  min="1000"
                  required
                />
              </div>

              <div className={styles.paystackNotice}>
                <span>🔒 Secured with 256-bit Paystack Gateway</span>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowFundModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Proceed with Paystack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      {showAddRecipientModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddRecipientModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add Saved Subcontractor</h3>
                <p className={styles.modalSub}>Verified Nigerian bank account for instant payouts</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowAddRecipientModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Recipient Name / Business</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kolawole Creative Studio"
                  value={newRecipName}
                  onChange={(e) => setNewRecipName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Destination Bank</label>
                <select 
                  value={newBank} 
                  onChange={(e) => setNewBank(e.target.value)}
                  className={styles.selectInput}
                >
                  <option>Guaranty Trust Bank (GTBank)</option>
                  <option>Access Bank Plc</option>
                  <option>Zenith Bank Plc</option>
                  <option>United Bank for Africa (UBA)</option>
                  <option>First Bank of Nigeria</option>
                  <option>Kuda Microfinance Bank</option>
                  <option>Opay Digital Services</option>
                  <option>Moniepoint MFB</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>10-Digit NUBAN Account Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  placeholder="0123456789"
                  value={newAccountNum}
                  onChange={(e) => setNewAccountNum(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setShowAddRecipientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmit}>
                  Save & Select Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
