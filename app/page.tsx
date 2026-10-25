'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Users, FileText, TrendingUp, Star, ArrowRight,
  Clock, DollarSign, CheckCircle, Sun, Moon,
  Landmark, Brain, LayoutGrid, Check, ChevronRight,
  Sparkles, Shield, Zap,
} from 'lucide-react';
import { Logo } from '@/components/Logo/Logo';
import { useData } from '@/context/DataContext';
import styles from './page.module.css';

/* ─── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return count;
}

/* ─── Animated Stat Item ────────────────────────────────────── */
function CountUpStat({
  icon: Icon, prefix = '', target, suffix = '', label, inView
}: {
  icon: any; prefix?: string; target: number;
  suffix?: string; label: string; inView: boolean;
}) {
  const count = useCountUp(target, 1800, inView);
  return (
    <div className={styles.proofItem}>
      <Icon size={20} className={styles.proofIcon} />
      <div className={styles.proofStat}>{prefix}{count.toLocaleString()}{suffix}</div>
      <div className={styles.proofLabel}>{label}</div>
    </div>
  );
}

/* ─── Social Proof Bar ──────────────────────────────────────── */
function ProofBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={styles.proofInner}
    >
      <CountUpStat icon={Users}      target={500}   suffix="+"    label="Businesses using Aether" inView={inView} />
      <CountUpStat icon={DollarSign} prefix="₦"     target={2}    suffix="B+"   label="Revenue tracked so far"  inView={inView} />
      <CountUpStat icon={FileText}   target={10000} suffix="+"    label="Invoices sent"           inView={inView} />
      <CountUpStat icon={Clock}      target={5}     suffix=" hrs" label="Saved every week"        inView={inView} />
    </motion.div>
  );
}

/* ─── Scroll Reveal Wrapper ─────────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Main Landing Page ─────────────────────────────────────── */
export default function LandingPage() {
  const { theme, toggleTheme } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Do I need to be tech-savvy to use Aether?',
      a: 'Not at all. If you can use WhatsApp or send an email, you can use Aether. Everything is designed to be simple and straightforward — no manuals needed.',
    },
    {
      q: 'Can I manage multiple clients at once?',
      a: 'Yes. You can add as many clients as you need, track their projects, send invoices, and manage everything from a single, clean dashboard.',
    },
    {
      q: 'What does the AI assistant actually do for me?',
      a: 'It helps you write professional proposals, summarise your week, follow up on unpaid invoices, answer business questions, and much more — saving you hours of work.',
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely. All your data is stored with bank-level encryption. We will never sell or share your information with anyone.',
    },
    {
      q: 'Can I cancel at any time?',
      a: 'Yes — no contracts, no hidden fees. Cancel whenever you want. Your data stays accessible for 30 days after you leave.',
    },
  ];

  const features = [
    {
      icon: Landmark,
      title: 'Get Paid in Naira',
      desc: 'Send invoices and collect payments directly in Naira (₦) — no currency conversion, no friction. Connected to Paystack.',
      color: '#fed65b',
    },
    {
      icon: Brain,
      title: 'Built-in AI Assistant',
      desc: 'Ask it anything. Write proposals, draft emails, or get a summary of your week. It works like a smart business partner.',
      color: '#a78bfa',
    },
    {
      icon: LayoutGrid,
      title: 'Task Board',
      desc: 'Drag tasks from "To Do" → "Working On" → "Done". Track who is doing what and when it needs to be finished.',
      color: '#60a5fa',
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      desc: 'Log the hours you work on each project with one click. Automatically calculate what to charge your clients.',
      color: '#34d399',
    },
    {
      icon: FileText,
      title: 'Professional Proposals',
      desc: 'Create polished proposals in minutes. Send them to clients and track whether they have been accepted or not.',
      color: '#f472b6',
    },
    {
      icon: TrendingUp,
      title: 'Financial Reports',
      desc: 'See exactly how much you earned, spent, and are owed — all in one place, always up to date.',
      color: '#fb923c',
    },
  ];

  return (
    <main className={styles.main}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logoArea}>
            <Logo href="/" iconSize={32} showSlogan={false} />
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
          </div>
          <div className={styles.navActions}>
            <button
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className={styles.signInLink}>Log In</Link>
            <Link href="/signup" className={styles.highValueBtn}>Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className={styles.heroContent}
        >
          <div className={styles.heroBadge}>
            <Sparkles size={13} /> Built for African Businesses
          </div>

          <h1 className={styles.title}>
            Run Your Business Smarter — All in One Place.
          </h1>

          <p className={styles.description}>
            Send invoices in Naira, manage your clients and tasks, track your time, and let AI help you with the hard stuff.
            Simple enough for anyone. Powerful enough for serious agencies.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/signup" className={styles.primaryBtn}>
              Get Started Free <ArrowRight size={17} />
            </Link>
            <a href="#features" className={styles.secondaryBtn}>
              See How It Works
            </a>
          </div>

          <div className={styles.heroTrust}>
            <CheckCircle size={14} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>No credit card required · Cancel anytime · Free to start</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={styles.visualContainer}
        >
          <motion.div
            className={styles.bigPhone}
            whileHover={{ rotate: 2, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Big phone notch */}
            <div className={styles.bigPhoneNotch} />
            {/* Teal bg + white diagonal inside big phone */}
            <div className={styles.bigPhoneBg} />
            <div className={styles.bigPhoneDiagonal} />

            {/* Small phone sitting inside, tilted */}
            <div className={styles.smallPhone}>
              <div className={styles.smallPhoneInner}>
                {/* Status bar */}
                <div className={styles.spStatusBar}>
                  <span>9:41</span>
                  <div className={styles.spStatusRight}>
                    <div className={styles.spSignal}><span /><span /><span /><span /></div>
                    <div className={styles.spBattery} />
                  </div>
                </div>
                {/* Header */}
                <div className={styles.spHeader}>
                  <span className={styles.spGreeting}>Good morning ☀️</span>
                  <span className={styles.spName}>Oluwamomi</span>
                </div>
                {/* Revenue */}
                <div className={styles.spRevenue}>
                  <span className={styles.spRevLabel}>THIS MONTH</span>
                  <span className={styles.spRevAmount}>₦2,450,000</span>
                  <div className={styles.spRevBar}><div className={styles.spRevFill} /></div>
                </div>
                {/* Stats */}
                <div className={styles.spStats}>
                  <div className={styles.spStatItem}>
                    <span className={styles.spStatNum}>12</span>
                    <span className={styles.spStatLabel}>PROJECTS</span>
                  </div>
                  <div className={styles.spStatItem}>
                    <span className={styles.spStatNum}>5</span>
                    <span className={styles.spStatLabel}>PENDING</span>
                  </div>
                  <div className={styles.spStatItem}>
                    <span className={styles.spStatNum}>98%</span>
                    <span className={styles.spStatLabel}>ON TIME</span>
                  </div>
                </div>
                {/* Chart */}
                <div className={styles.spChart}>
                  <span className={styles.spChartTitle}>WEEKLY OVERVIEW</span>
                  <div className={styles.spBars}>
                    <div className={styles.spBar} style={{ height: '40%' }} />
                    <div className={styles.spBar} style={{ height: '65%' }} />
                    <div className={styles.spBar} style={{ height: '50%' }} />
                    <div className={styles.spBar} style={{ height: '80%' }} />
                    <div className={styles.spBar} style={{ height: '55%' }} />
                    <div className={styles.spBar} style={{ height: '90%' }} />
                    <div className={styles.spBar} style={{ height: '70%' }} />
                  </div>
                </div>
                {/* Nav dots */}
                <div className={styles.spNav}>
                  <span className={styles.spDotActive} />
                  <span className={styles.spDot} />
                  <span className={styles.spDot} />
                  <span className={styles.spDot} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────── */}
      <section className={styles.proofBar}>
        <ProofBar />
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section id="features" className={styles.featuresSection}>
        <FadeUp>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Everything You Need</span>
            <h2 className={styles.sectionTitle}>All Your Business Tools in One App.</h2>
            <p className={styles.sectionDesc}>
              No more jumping between apps. Aether handles your clients, invoices, tasks, time, proposals, and more.
            </p>
          </div>
        </FadeUp>

        <div className={styles.featuresGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeUp key={i} delay={i * 0.06}>
                <div className={`${styles.featureCard} glow-card`}>
                  <div className={styles.featureIcon} style={{ background: `${f.color}14`, color: f.color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Big bento cards below the grid */}
        <div className={styles.featuresBento}>
          <FadeUp delay={0.05}>
            <div className={`${styles.nairaCard} glow-card`}>
              <div className={styles.nairaCardContent}>
                <div className={styles.nairaCardIcon}><Landmark size={24} /></div>
                <h3 className={styles.nairaCardTitle}>Get Paid Instantly in Naira</h3>
                <p className={styles.nairaCardDesc}>
                  Create and send professional invoices in seconds. Your clients pay directly with Paystack — money lands in your account, no middleman.
                </p>
              </div>
              <div
                className={styles.nairaCardBg}
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZLyJZh9Gluw06xU6MGNmcUq864JBOX3BQya4L3J9se6yxW-JarDdqg0I8aFjMvmDf94n-mqrL3Te1PUeBIxlDEmTpQscQup1npuep7lwML307HAnkP8V-KqObTTFTavuHs91C3005mV88UiS21KXMPbgm0Ba4mRVrA-doG1NfAHStb5Z8rgz0XOCNnTWu6tSFqnJQa5WgQ5pF0ucUH2jpXKokJTmygzHlY_3kW1NjPCsUg4bRpLi8Oi2I2kO6q_tq1QZUn1ycdp5O')`,
                }}
              />
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className={`${styles.aiCard} glow-card`}>
              <div className={styles.aiCardContent}>
                <div className={styles.aiCardIcon}><Brain size={24} /></div>
                <h3 className={styles.aiCardTitle}>Your AI Business Partner</h3>
                <p className={styles.aiCardDesc}>
                  Ask it to write a proposal, follow up on an invoice, or explain your finances — in plain English, no jargon.
                </p>
              </div>
              <div className={styles.aiCardPattern} />
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className={`${styles.kanbanCard} glow-card`}>
              <div className={styles.kanbanCardText}>
                <div className={styles.kanbanCardIcon}><LayoutGrid size={24} /></div>
                <h3 className={styles.kanbanCardTitle}>See Every Task at a Glance</h3>
                <p className={styles.kanbanCardDesc}>
                  Drag tasks from &ldquo;Waiting to Start&rdquo; to &ldquo;Working On&rdquo; to &ldquo;Done&rdquo;. Know exactly what&rsquo;s happening on every project.
                </p>
              </div>
              <div className={styles.kanbanCardMock}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWsfb0rAbJjzccym9_NYkWskQFGiwZXcGdad205eJDfsRpBu3YqOKq9ywOLWsG4wE3W6RMeFI7oiuaTTnKqxRUl7OZFDX7UBa7vstY4rTkxM50-ey38drrNzSgP_uUiSKRqEQuRKjoHq9V69c9nkiAK1zXmI20-BK_iPBE50wx-IT37ohBkcnD0bl4npOeEtSzLFFOlShaK6pmNCNvajPhYpS-3YIrLwNlnsrruyPEvaYMfc96Czk5hO2HPtGcaN7dX0Ud5UFHGtAn"
                  alt="Kanban task board preview"
                  className={styles.kanbanImage}
                />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className={styles.pricing}>
        <FadeUp>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Pricing</span>
            <h2 className={styles.sectionTitle}>Pick a Plan That Fits Your Business.</h2>
            <p className={styles.sectionDesc}>
              Start free. Upgrade only when you need more. No hidden fees, ever.
            </p>
          </div>
        </FadeUp>

        <div className={styles.pricingGrid}>
          {/* Starter */}
          <FadeUp delay={0}>
            <div className={`${styles.pricingCard} glow-card`} style={{ height: '100%' }}>
              <div className={styles.planName}>Starter</div>
              <div className={styles.planPrice}>
                ₦0<span className={styles.planPer}>/month</span>
              </div>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Up to 3 projects</span></li>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Basic invoicing</span></li>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Community support</span></li>
              </ul>
              <Link href="/signup" className={styles.planBtn}>Start for Free</Link>
            </div>
          </FadeUp>

          {/* Pro */}
          <FadeUp delay={0.08}>
            <div className={`${styles.pricingCardFeatured} glow-card`} style={{ height: '100%' }}>
              <div className={styles.featuredRibbon}>Most Popular</div>
              <div className={styles.planName}>Pro</div>
              <div className={styles.planPrice}>
                ₦25k<span className={styles.planPer}>/month</span>
              </div>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}><Check size={15} /><span>Unlimited projects</span></li>
                <li className={styles.planFeature}><Check size={15} /><span>Paystack payment collection</span></li>
                <li className={styles.planFeature}><Check size={15} /><span>AI assistant access</span></li>
              </ul>
              <Link href="/signup" className={styles.planBtn}>Upgrade to Pro</Link>
            </div>
          </FadeUp>

          {/* Enterprise */}
          <FadeUp delay={0.16}>
            <div className={`${styles.pricingCard} glow-card`} style={{ height: '100%' }}>
              <div className={styles.planName}>Enterprise</div>
              <div className={styles.planPrice}>Custom</div>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Your own branded domain</span></li>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Client-facing portal</span></li>
                <li className={styles.planFeature}><Check size={15} color="#735c00" /><span>Priority support</span></li>
              </ul>
              <Link href="/signup" className={styles.planBtn}>Contact Sales</Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className={styles.faq}>
        <FadeUp>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>FAQ</span>
            <h2 className={styles.sectionTitle}>Got Questions? We&apos;ve Got Answers.</h2>
          </div>
        </FadeUp>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div className={`${styles.faqItem} glow-card`}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={styles.faqQuestionText}>{faq.q}</span>
                  <ChevronRight
                    size={18}
                    className={styles.faqChevron}
                    style={{ transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={styles.faqAnswer}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <FadeUp>
        <footer className={styles.footer}>
          <div className={styles.footerLogoArea}>
            <Logo href="/" iconSize={32} showSlogan={false} />
            <span className={styles.copyright}>
              &copy; 2026 Aether OS. Built for African businesses. 🇳🇬
            </span>
          </div>
        </footer>
      </FadeUp>

    </main>
  );
}
