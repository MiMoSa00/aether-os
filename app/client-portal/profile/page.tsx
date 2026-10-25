'use client';

import React, { useState, useEffect } from 'react';
import styles from '../dashboard/dashboard.module.css';
import { Users, CheckCircle2, Shield, Building, Globe, Users2, MapPin, Phone, Briefcase, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useClientProfile } from '@/lib/useClientData';

export default function ClientProfilePage() {
  const { profile, loading, error, updateProfile } = useClientProfile();
  const [formData, setFormData] = useState({
    company_name: '',
    primary_contact_name: '',
    primary_contact_email: '',
    phone_number: '',
    industry: '',
    company_size: '',
    location: '',
    website: '',
    services_description: '',
    billing_address: '',
    company_logo_url: '',
    company_registration: '',
    tax_id: '',
    bank_name: '',
    bank_account_number: '',
    bank_sort_code: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        primary_contact_name: profile.primary_contact_name || '',
        primary_contact_email: profile.primary_contact_email || '',
        phone_number: profile.phone_number || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        location: profile.location || '',
        website: profile.website || '',
        services_description: profile.services_description || '',
        billing_address: profile.billing_address || '',
        company_logo_url: profile.company_logo_url || '',
        company_registration: profile.company_registration || '',
        tax_id: profile.tax_id || '',
        bank_name: profile.bank_name || '',
        bank_account_number: profile.bank_account_number || '',
        bank_sort_code: profile.bank_sort_code || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.headerSection}>
          <span className={styles.clientPortalBadge}>CLIENT PORTAL / PROFILE</span>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Company Profile</h1>
            <Link href="/client-portal/dashboard" className={styles.projectHubBtn}>
              Back to Overview
            </Link>
          </div>
        </header>

        {saved && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} />
            <span>Company profile updated successfully.</span>
          </div>
        )}

        {loading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Basic Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Basic Information</h2>
                <Building size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Company Name
                    </label>
                    <input 
                      type="text" 
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="Your Company"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Industry
                    </label>
                    <input 
                      type="text" 
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="e.g., Technology, Finance, Healthcare"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Company Size
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Select size</option>
                      <option value="startup">Startup (1-10)</option>
                      <option value="small">Small (11-50)</option>
                      <option value="medium">Medium (51-500)</option>
                      <option value="enterprise">Enterprise (500+)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Location
                    </label>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Company Website
                  </label>
                  <input 
                    type="url" 
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Basic Info'}
                </button>
              </form>
            </div>

            {/* Contact Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Contact Information</h2>
                <Phone size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Primary Representative
                    </label>
                    <input 
                      type="text" 
                      name="primary_contact_name"
                      value={formData.primary_contact_name}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Email
                    </label>
                    <input 
                      type="email" 
                      name="primary_contact_email"
                      value={formData.primary_contact_email}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="email@company.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </form>
            </div>

            {/* Services Description Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Services & Description</h2>
                <Briefcase size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Services Description
                  </label>
                  <textarea 
                    name="services_description"
                    value={formData.services_description}
                    onChange={handleChange}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface-low)',
                      color: 'var(--text-primary)',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Tell us about your services, specialties, and what makes your company unique..."
                  />
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Services Info'}
                </button>
              </form>
            </div>

            {/* Billing Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Billing Address</h2>
                <MapPin size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Full Billing Address
                  </label>
                  <textarea 
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleChange}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface-low)',
                      color: 'var(--text-primary)',
                      minHeight: '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Street Address&#10;City, State/Province&#10;Postal Code&#10;Country"
                  />
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Billing Address'}
                </button>
              </form>
            </div>

            {/* Company Registration & Tax Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Company Registration</h2>
                <Shield size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Company Registration Number
                    </label>
                    <input 
                      type="text" 
                      name="company_registration"
                      value={formData.company_registration}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="e.g., RC 123456"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Tax ID / TIN
                    </label>
                    <input 
                      type="text" 
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="e.g., 12-3456789"
                    />
                  </div>
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Registration Info'}
                </button>
              </form>
            </div>

            {/* Banking Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Banking Information</h2>
                <CreditCard size={20} className={styles.timelineIcon} />
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Bank Name
                  </label>
                  <input 
                    type="text" 
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                    placeholder="e.g., First Bank of Nigeria"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Account Number
                    </label>
                    <input 
                      type="text" 
                      name="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="Account Number"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Sort Code / Routing
                    </label>
                    <input 
                      type="text" 
                      name="bank_sort_code"
                      value={formData.bank_sort_code}
                      onChange={handleChange}
                      style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-low)', color: 'var(--text-primary)' }}
                      placeholder="Sort Code / Routing"
                    />
                  </div>
                </div>

                <button type="submit" className={styles.payOutstandingBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Banking Info'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
