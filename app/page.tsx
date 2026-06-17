'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bot, Zap, Shield, ChevronRight, Globe, Layers, BarChart3 } from 'lucide-react';
import { VisualElement3D } from '@/components/Visuals/VisualElement3D';
import { Logo } from '@/components/Logo/Logo';
import styles from './page.module.css';

const FeatureCard = ({ icon: Icon, title, desc, href }: any) => {
  const content = (
    <motion.div 
      whileHover={{ y: -5 }}
      className={styles.featureCard}
      style={{ height: '100%', cursor: href ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}
    >
      <div className={styles.featureIcon}>
        <Icon size={24} />
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureText} style={{ flexGrow: 1 }}>{desc}</p>
    </motion.div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%', color: 'inherit' }}>
      {content}
    </Link>
  ) : content;
};

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.logoArea}>
          {/* use shared Logo component for consistent styling */}
          <Logo href="/" iconSize={50} centered={true} />
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#solutions" className={styles.navLink}>Solutions</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <Link href="/login" className={styles.signInBtn}>Sign In</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* <div className={styles.badge}>
            <Sparkles size={16} />
            <span>The Future of Agency Management</span>
          </div> */}
          <h1 className={styles.title}>
            Your Agency's <span className={styles.gradientText}>Neural</span> Core
          </h1>
          <p className={styles.description}>
            Aether OS is the first neural-linked workspace designed to automate agency operations, optimize revenue, and scale strategy with local AI intelligence.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/signup" className={styles.primaryBtn}>
              Start Your Agency <ChevronRight size={18} />
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Access Dashboard
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className={styles.visualContainer}
        >
          <div className={styles.glow} />
          <VisualElement3D />
        </motion.div>
      </section>

      <section id="features" className={styles.features}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={styles.sectionHeader}
        >
          <h2 className={styles.sectionTitle}>Neural Infrastructure</h2>
          <p className={styles.sectionDesc}>Everything you need to run a high-performance modern agency.</p>
        </motion.div>
        <div className={styles.featureGrid}>
          {[
            { icon: Bot, title: "Claude AI Intelligence", desc: "Claude-powered models analyze your data with industry-leading accuracy, speed, and reasoning.", href: "/agent" },
            { icon: BarChart3, title: "Revenue Projection", desc: "Neural forecasts analyze your pipeline and predict growth with high-fidelity accuracy.", href: "/finance" },
            { icon: Layers, title: "Dynamic Kanban", desc: "Fluid project nodes that move with your agency's velocity and priority.", href: "/tasks" },
            { icon: Shield, title: "Secure Ledger", desc: "Enterprise-grade invoice and contract management with military-level encryption.", href: "/invoices" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ height: '100%' }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="solutions" className={styles.features}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <h2 className={styles.sectionTitle}>Strategic Solutions</h2>
          <p className={styles.sectionDesc}>Tailored neural paths for every agency scale.</p>
        </motion.div>
        <div className={styles.featureGrid}>
          <FeatureCard 
            icon={Globe} 
            title="Global Delivery" 
            desc="Scale your agency footprint across any border with localized AI nodes." 
            href="/global-delivery"
          />
          <FeatureCard 
            icon={Zap} 
            title="Rapid Onboarding" 
            desc="Initialize new client nodes in seconds with automated contract generation." 
            href="/onboarding"
          />
        </div>
      </section>

      <section id="pricing" className={styles.features}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <h2 className={styles.sectionTitle}>Neural Investment</h2>
          <p className={styles.sectionDesc}>Simple pricing for infinite agency growth.</p>
        </motion.div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard} style={{ border: '2px solid var(--accent-blue)', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={styles.badge} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', margin: 0 }}>PRO</div>
            <h3 className={styles.featureTitle}>Founder Node</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>₦45,000<span style={{ fontSize: '1rem', opacity: 0.5 }}>/mo</span></div>
            <p className={styles.featureText} style={{ flexGrow: 1, marginBottom: '2rem' }}>Everything you need to launch and automate your solo agency.</p>
            <Link href="/signup" className={styles.primaryBtn} style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>Initialize Node</Link>
          </div>
          <div className={styles.featureCard} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className={styles.featureTitle}>Agency Network</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>₦120,000<span style={{ fontSize: '1rem', opacity: 0.5 }}>/mo</span></div>
            <p className={styles.featureText} style={{ flexGrow: 1, marginBottom: '2rem' }}>Connect up to 10 team members and unlimited client neural links.</p>
            <Link href="/signup" className={styles.secondaryBtn} style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>Sync Network</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={styles.logoArea}
        >
          <Logo href="/" iconSize={38} showSlogan={false} />
          <span>&copy; 2026 Aether Intelligence Systems. All nodes operational.</span>
        </motion.div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.navLink}>Neural Policy</a>
          <a href="#" className={styles.navLink}>Terminals</a>
          <a href="#" className={styles.navLink}>Link Core</a>
        </div>
      </footer>
    </main>
  );
}
