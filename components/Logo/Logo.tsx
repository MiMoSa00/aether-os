'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LogoProps {
  href?: string;
  iconSize?: number;
  showSlogan?: boolean;
  centered?: boolean;
}

export function Logo({ href = '/', iconSize = 64, showSlogan = true, centered = false }: LogoProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start',
          gap: '0.3rem',
        }}
      >
        {/* Row: circle logo + Aether OS text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

          {/* The image itself is clipped to a circle — no box, no background */}
          <div
            style={{
              width: iconSize,
              height: iconSize,
              position: 'relative',
              flexShrink: 0,
              clipPath: 'circle(50% at 50% 50%)',
            }}
          >
            <Image
              src="/images/cover.png"
              alt="Aether OS Logo"
              fill
              sizes={`${iconSize}px`}
              style={{
                objectFit: 'contain',
                objectPosition: 'center center',
                transform: 'scale(1.75)',
                transformOrigin: 'center center',
              }}
              priority
              unoptimized
            />
          </div>

          {/* Sparkly italic "Aether OS" text */}
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span
              style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.85rem)',
                fontWeight: 800,
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
                backgroundImage: 'var(--logo-text-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'var(--logo-text-shadow)',
                whiteSpace: 'nowrap',
              }}
            >
              Aether OS
            </span>

            {/* Sparkle star SVG */}
            <motion.svg
              viewBox="0 0 24 24"
              width={Math.max(14, iconSize * 0.22)}
              height={Math.max(14, iconSize * 0.22)}
              animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.15, 0.95, 1], opacity: [0.7, 1, 0.75, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{ flexShrink: 0 }}
            >
              <defs>
                <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--logo-sparkle-1)" />
                  <stop offset="50%" stopColor="var(--logo-sparkle-2)" />
                  <stop offset="100%" stopColor="var(--logo-sparkle-3)" />
                </linearGradient>
              </defs>
              <path fill="url(#sparkleGrad)" d="M12 2l2.09 4.26L18.5 8l-4.41 1.74L12 14l-2.09-4.26L5.5 8l4.41-1.74L12 2z" />
              <path fill="url(#sparkleGrad)" style={{ opacity: 'var(--logo-sparkle-opacity-1)' }} d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
              <path fill="url(#sparkleGrad)" style={{ opacity: 'var(--logo-sparkle-opacity-2)' }} d="M5 3l.7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3z" />
            </motion.svg>
          </span>
        </div>

        {/* Slogan below the full row */}
        {showSlogan && (
          <span
            style={{
              fontSize: 'clamp(0.48rem, 1vw, 0.6rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--logo-slogan-color)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              paddingLeft: centered ? '0' : '4px',
              textAlign: centered ? 'center' : 'left',
            }}
          >
            Your Agency&apos;s Neural Core
          </span>
        )}
      </motion.div>
    </Link>
  );
}
