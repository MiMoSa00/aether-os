'use client';

import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { TopBar } from '../TopBar/TopBar';
import styles from './MainLayout.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/proposals/view');

  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay: sits above sidebar (z-index 1001) so clicking it closes the sidebar */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={styles.main}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.content}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
