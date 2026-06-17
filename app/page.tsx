'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Bot, Zap, Shield, ChevronRight, Globe, Layers, BarChart3,
  CheckCircle, Users, FileText, TrendingUp, Star, ArrowRight,
  Clock, DollarSign, Briefcase, MessageSquare
} from 'lucide-react';
import { VisualElement3D } from '@/components/Visuals/VisualElement3D';
import { Logo } from '@/components/Logo/Logo';
import styles from './page.module.css';

/* ─── Count-up hook ────────────────────────────────────────────
   Counts from 0 → target over `duration` ms once `trigger` is true
──────────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, trigger = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo feel
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);
      setCount(current);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return count;
}

/* ─── Animated stat item ───────────────────────────────────────
   prefix  e.g. "₦"
   target  the raw number  e.g. 2000
   suffix  e.g. "B+"  or "+"  or " hrs"
──────────────────────────────────────────────────────────────── */
function CountUpStat({
  icon: Icon, prefix = '', target, suffix = '', label, inView
}: {
  icon: React.ElementType; prefix?: string; target: number;
  suffix?: string; label: string; inView: boolean;
}) {
  const count = useCountUp(target, 1800, inView);
  return (
    <div className={styles.proofItem}>
      <Icon size={20} className={styles.proofIcon} />
      <div className={styles.proofStat}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className={styles.proofLabel}>{label}</div>
    </div>
  );
}

/* ─── Social Proof Bar ────────────────────────────────────────
   Extracted as its own component so hooks work correctly
──────────────────────────────────────────────────────────────── */
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
      <CountUpStat icon={Users}      target={500}   suffix="+"    label="Agencies Onboard" inView={inView} />
      <CountUpStat icon={DollarSign} prefix="₦"     target={2}    suffix="B+"   label="Revenue Tracked"  inView={inView} />
      <CountUpStat icon={FileText}   target={10000} suffix="+"    label="Invoices Sent"     inView={inView} />
      <CountUpStat icon={Clock}      target={5}     suffix=" hrs" label="Saved Per Week"    inView={inView} />
    </motion.div>
  );
}

/* ─── Reusable Feature Card ───────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, href, color = 'blue' }: any) => {
  const card = (
    <motion.div
      whileHover={{ y: -4 }}
      className={styles.featureCard}
      style={{ cursor: href ? 'pointer' : 'default' }}
    >
      <div className={`${styles.featureIcon} ${styles[`icon_${color}`]}`}>
        <Icon size={22} />
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureText}>{desc}</p>
    </motion.div>
  );
  return href
    ? <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>{card}</Link>
    : card;
};

/* ─── Step Card (How it works) ────────────────────────────────── */
const StepCard = ({ num, title, desc }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={styles.stepCard}
  >
    <div className={styles.stepNum}>{num}</div>
    <h3 className={styles.stepTitle}>{title}</h3>
    <p className={styles.stepDesc}>{desc}</p>
  </motion.div>
);

/* ─── Testimonial Card ────────────────────────────────────────── */
const TestimonialCard = ({ quote, name, role, stars = 5 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={styles.testimonialCard}
  >
    <div className={styles.stars}>
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
      ))}
    </div>
    <p className={styles.testimonialQuote}>"{quote}"</p>
    <div className={styles.testimonialAuthor}>
      <div className={styles.authorAvatar}>{name[0]}</div>
      <div>
        <div className={styles.authorName}>{name}</div>
        <div className={styles.authorRole}>{role}</div>
      </div>
    </div>
  </motion.div>
);

/* ─── Main Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Do I need any technical skills to use Aether OS?',
      a: 'No. Aether OS is built for agency owners and freelancers, not developers. If you can use email, you can use Aether OS — everything is guided and simple.'
    },
    {
      q: 'Can I manage multiple clients at the same time?',
      a: 'Yes. You can add unlimited clients, track their projects, generate invoices, and manage communication — all from one dashboard.'
    },
    {
      q: 'What does the AI assistant actually do?',
      a: 'The built-in AI (powered by Claude) helps you draft proposals, summarise client notes, forecast revenue, answer business questions, and save hours of manual work every week.'
    },
    {
      q: 'Is my data safe?',
      a: 'Absolutely. All your data is stored securely with enterprise-grade encryption. We never sell or share your information with third parties.'
    },
    {
      q: 'Can I cancel at any time?',
      a: 'Yes, cancel anytime with no penalties or hidden fees. Your data remains accessible for 30 days after cancellation.'
    },
  ];

  return (
    <main className={styles.main}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.logoArea}>
          <Logo href="/" iconSize={46} centered={true} />
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <Link href="/login" className={styles.signInBtn}>Sign In</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.badge}>
            <Zap size={14} />
            <span>Built for modern agencies &amp; freelancers</span>
          </div>

          <h1 className={styles.title}>
            Your Agency's{' '}
            <span className={styles.gradientText}>Neural</span> Core
          </h1>

          <p className={styles.description}>
            Aether OS brings your clients, projects, invoices, and AI assistant together in a single, beautifully designed workspace — so you can focus on growing your business, not managing it.
          </p>

          <div className={styles.heroBullets}>
            {[
              'Track clients & projects in real time',
              'Send professional invoices in seconds',
              'Get AI-powered business insights',
            ].map((b, i) => (
              <div key={i} className={styles.heroBullet}>
                <CheckCircle size={16} color="#22c55e" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className={styles.ctaGroup}>
            <Link href="/signup" className={styles.primaryBtn}>
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Sign In
            </Link>
          </div>

          <p className={styles.heroNote}>No credit card required · Set up in under 2 minutes</p>
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

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────── */}
      <section className={styles.proofBar}>
        <ProofBar />
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className={styles.features}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <span className={styles.sectionBadge}>Everything you need</span>
          <h2 className={styles.sectionTitle}>All Your Agency Tools, Finally Together</h2>
          <p className={styles.sectionDesc}>
            Stop juggling between spreadsheets, WhatsApp, and separate apps. Aether OS gives you everything in one clean workspace.
          </p>
        </motion.div>

        <div className={styles.featureGrid}>
          {[
            {
              icon: Bot,
              title: 'AI Business Assistant',
              desc: 'Ask anything — draft a proposal, get revenue insights, summarise client notes. Your personal AI handles the busywork so you can focus on what matters.',
              href: '/agent',
              color: 'purple',
            },
            {
              icon: BarChart3,
              title: 'Revenue Tracking',
              desc: 'See exactly how much you\'re earning, what\'s pending, and where your growth is coming from — updated in real time.',
              href: '/finance',
              color: 'blue',
            },
            {
              icon: Layers,
              title: 'Project Management',
              desc: 'Organise tasks with a drag-and-drop board. Know what\'s in progress, what\'s done, and what needs attention at a glance.',
              href: '/tasks',
              color: 'green',
            },
            {
              icon: FileText,
              title: 'Invoice Management',
              desc: 'Create and send professional invoices in seconds. Track payment status and never lose track of who owes you money.',
              href: '/invoices',
              color: 'orange',
            },
            {
              icon: Users,
              title: 'Client Directory',
              desc: 'Keep all your client contacts, history, and project details organised and easy to find — no more searching through emails.',
              href: '/clients',
              color: 'pink',
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              desc: 'Your business data stays yours. Enterprise-grade security with role-based access so only the right people see the right things.',
              color: 'blue',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <FeatureCard {...f} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className={styles.howItWorks}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <span className={styles.sectionBadge}>Simple setup</span>
          <h2 className={styles.sectionTitle}>Up and Running in Minutes</h2>
          <p className={styles.sectionDesc}>No complicated setup. No IT team needed. Just sign up and go.</p>
        </motion.div>

        <div className={styles.stepsGrid}>
          <StepCard
            num="1"
            title="Create Your Account"
            desc="Sign up with your email in under 60 seconds. No credit card, no contracts, no hassle."
          />
          <StepCard
            num="2"
            title="Add Your Clients & Projects"
            desc="Import or manually add your clients, create projects, and assign tasks — it's as easy as filling a form."
          />
          <StepCard
            num="3"
            title="Send Invoices & Track Money"
            desc="Generate professional invoices and track exactly what's paid, pending, or overdue — all in one place."
          />
          <StepCard
            num="4"
            title="Let AI Do the Heavy Lifting"
            desc="Ask your built-in AI assistant for help with proposals, summaries, business advice, and more — available 24/7."
          />
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className={styles.testimonials}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <span className={styles.sectionBadge}>Real feedback</span>
          <h2 className={styles.sectionTitle}>Agencies Love Aether OS</h2>
          <p className={styles.sectionDesc}>Join hundreds of agency owners who run their business smarter every day.</p>
        </motion.div>

        <div className={styles.testimonialsGrid}>
          <TestimonialCard
            quote="I used to spend half my Monday morning chasing invoices and updating spreadsheets. Now it takes me 10 minutes. Aether OS is genuinely a game changer."
            name="Chisom A."
            role="Creative Director, Lagos"
          />
          <TestimonialCard
            quote="The AI assistant alone is worth the subscription. It helped me write a full client proposal in under 5 minutes — something that used to take me hours."
            name="David O."
            role="Digital Marketing Agency Owner"
          />
          <TestimonialCard
            quote="Finally a tool that actually makes sense for African agencies. The invoice tracking and client management is exactly what we needed."
            name="Funke B."
            role="Brand Consultant, Abuja"
          />
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className={styles.pricing}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <span className={styles.sectionBadge}>Pricing</span>
          <h2 className={styles.sectionTitle}>Simple, Honest Pricing</h2>
          <p className={styles.sectionDesc}>No hidden fees. No long-term contracts. Cancel anytime.</p>
        </motion.div>

        <div className={styles.pricingGrid}>
          {/* Solo Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.pricingCard}
          >
            <div className={styles.planName}>Solo</div>
            <div className={styles.planDesc}>Perfect for freelancers and solo agency owners</div>
            <div className={styles.planPrice}>
              ₦45,000
              <span className={styles.planPer}>/month</span>
            </div>
            <ul className={styles.planFeatures}>
              {[
                'Unlimited clients & projects',
                'Invoice creation & tracking',
                'AI business assistant',
                'Task management board',
                'Revenue dashboard',
                'Email support',
              ].map((f, i) => (
                <li key={i} className={styles.planFeature}>
                  <CheckCircle size={15} color="#22c55e" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
              Get Started <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Team Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}
          >
            <div className={styles.featuredBadge}>Most Popular</div>
            <div className={styles.planName}>Team</div>
            <div className={styles.planDesc}>For growing agencies with a team</div>
            <div className={styles.planPrice}>
              ₦120,000
              <span className={styles.planPer}>/month</span>
            </div>
            <ul className={styles.planFeatures}>
              {[
                'Everything in Solo',
                'Up to 10 team members',
                'Role-based access control',
                'Priority AI assistant',
                'Advanced revenue reports',
                'Client portal access',
                'Priority support',
              ].map((f, i) => (
                <li key={i} className={styles.planFeature}>
                  <CheckCircle size={15} color="#22c55e" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
              Get Started <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className={styles.faq}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.sectionHeader}
        >
          <span className={styles.sectionBadge}>FAQ</span>
          <h2 className={styles.sectionTitle}>Questions? We've Got Answers</h2>
        </motion.div>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={styles.faqItem}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
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
                  exit={{ opacity: 0, height: 0 }}
                  className={styles.faqAnswer}
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className={styles.finalCta}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.finalCtaInner}
        >
          <h2 className={styles.finalCtaTitle}>Ready to Run a Smarter Agency?</h2>
          <p className={styles.finalCtaDesc}>
            Join hundreds of agency owners who save time, earn more, and stress less with Aether OS.
          </p>
          <Link href="/signup" className={styles.primaryBtn}>
            Start for Free Today <ChevronRight size={18} />
          </Link>
          <p className={styles.heroNote}>No credit card required · Cancel anytime</p>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={styles.logoArea}
        >
          <Logo href="/" iconSize={36} showSlogan={false} />
          <span>&copy; 2026 Aether OS. All rights reserved.</span>
        </motion.div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.navLink}>Privacy Policy</a>
          <a href="#" className={styles.navLink}>Terms of Use</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </div>
      </footer>

    </main>
  );
}
