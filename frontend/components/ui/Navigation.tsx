"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

// SVG Icon components to match Duolingo exactly
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <rect x="4" y="10" width="16" height="11" rx="2" fill="#FFC800" />
    <rect x="12" y="10" width="8" height="11" rx="2" fill="#D9A800" />
    <polygon points="12,2 2,11 22,11" fill="#FF4B4B" />
    <polygon points="12,2 22,11 12,11" fill="#CC2B2B" />
    <circle cx="12" cy="15.5" r="2.5" fill="#D9A800" />
    <circle cx="12" cy="15.5" r="2.5" fill="#B8821A" clipPath="url(#halfRightHome)" />
    <defs>
      <clipPath id="halfRightHome"><rect x="12" y="0" width="12" height="24" /></clipPath>
    </defs>
  </svg>
);
const LeaderboardIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <path d="M4 4h16v7c0 6-3.5 11-8 11.5C7.5 22 4 17 4 11V4z" fill="#FFC800" />
    <path d="M12 4h8v7c0 6-3.5 11-8 11.5V4z" fill="#D9A800" />
  </svg>
);
const QuestIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <path d="M3 11h18v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2z" fill="#FFC800" />
    <rect x="3" y="12" width="18" height="8" rx="1" fill="#FFC800" />
    <rect x="3" y="16" width="18" height="4" rx="1" fill="#D9A800" />
    <rect x="5" y="5" width="3" height="15" fill="#B8821A" />
    <rect x="16" y="5" width="3" height="15" fill="#B8821A" />
    <rect x="10" y="9" width="4" height="6" rx="1" fill="#FFC800" />
    <circle cx="12" cy="12" r="1.5" fill="#B8821A" />
  </svg>
);
const ShopIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <rect x="3" y="12" width="18" height="9" fill="#D9A800" />
    <rect x="3" y="12" width="18" height="9" fill="#B8821A" clipPath="url(#halfRightShop)" />
    <rect x="6" y="15" width="4" height="4" rx="0.5" fill="#ffffff" />
    <rect x="14" y="15" width="4" height="4" rx="0.5" fill="#ffffff" />
    <path d="M2 12l1-7h18l1 7v1H2v-1z" fill="#FF4B4B" />
    <path d="M7 12l1-7h4l-1 7H7zm8 0l-1-7h4l1 7h-4z" fill="#ffffff" />
    <defs>
      <clipPath id="halfRightShop"><rect x="12" y="0" width="12" height="24" /></clipPath>
    </defs>
  </svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <circle cx="12" cy="12" r="10" stroke="#4A6475" strokeWidth="2.5" strokeDasharray="4 3" fill="none" />
    <circle cx="12" cy="12" r="6" fill="#2a3f4d" />
    <text x="12" y="15.5" fill="#8BABB8" fontSize="10" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">L</text>
  </svg>
);
const MoreIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${!active ? 'opacity-80 grayscale-[0.2]' : ''}`}>
    <circle cx="12" cy="12" r="10" fill="#CE82FF" />
    <circle cx="7" cy="12" r="1.5" fill="#ffffff" />
    <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
    <circle cx="17" cy="12" r="1.5" fill="#ffffff" />
  </svg>
);

const navItems = [
  { name: 'LEARN', href: '/', Icon: HomeIcon, activeColor: '#1CB0F6' },
  { name: 'LEADERBOARDS', href: '/leaderboard', Icon: LeaderboardIcon, activeColor: '#FFD900' },
  { name: 'QUESTS', href: '/quests', Icon: QuestIcon, activeColor: '#FF9600' },
  { name: 'SHOP', href: '/shop', Icon: ShopIcon, activeColor: '#FF4B4B' },
  { name: 'PROFILE', href: '/profile', Icon: ProfileIcon, activeColor: '#CE82FF' },
  { name: 'MORE', href: '/more', Icon: MoreIcon, activeColor: '#58CC02' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useUser();
  
  if (pathname.startsWith('/lesson') || pathname === '/login' || pathname === '/signup') return null;

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col md:w-[88px] xl:w-[245px] shrink-0 h-full border-r border-duo-border pt-6 pb-4 md:px-2 xl:px-4 transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center md:justify-center xl:justify-start xl:px-4 mb-8">
          <svg viewBox="0 0 160 40" className="hidden xl:block w-[160px] h-[40px]">
            <text 
              x="0" 
              y="32" 
              fontFamily="Nunito, sans-serif" 
              fontWeight="900" 
              fontSize="34" 
              fill="#58CC02" 
              letterSpacing="-1.5"
            >
              duolingo
            </text>
          </svg>
          {/* Collapsed Logo */}
          <div className="xl:hidden w-10 h-10 bg-duo-green rounded-xl flex items-center justify-center text-white font-extrabold text-2xl tracking-tighter">
            D
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ name, href, Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-4 px-4 py-3 rounded-2xl group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 bg-duo-bg-card border border-duo-border rounded-2xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-duo-bg-card/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-0" />

                <motion.div 
                  className="relative z-10 flex items-center gap-4 w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon active={isActive} />
                  </motion.div>
                  <span className={`hidden xl:block font-extrabold text-sm tracking-widest transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-duo-text-muted group-hover:text-white'}`}>
                    {name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto mb-4 px-4">
            <button 
                onClick={logout}
                className="w-full relative flex items-center justify-center gap-4 xl:px-4 py-3 rounded-2xl group outline-none hover:bg-duo-bg-card/60 transition-colors"
            >
                <div className="md:hidden xl:block">
                  <span className="font-extrabold text-sm tracking-widest text-duo-text-muted group-hover:text-white transition-colors duration-200">
                      LOGOUT
                  </span>
                </div>
                <div className="hidden md:flex xl:hidden items-center justify-center text-duo-text-muted group-hover:text-white w-8 h-8">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
            </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-duo-bg border-t border-duo-border z-50 flex justify-around py-2 px-1">
        {navItems.slice(0, 5).map(({ name, href, Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center py-2 px-3 rounded-xl w-16">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-duo-bg-card/50 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div 
                className="relative z-10 flex flex-col items-center w-full"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div animate={isActive ? { scale: [1, 1.15, 1], y: [-2, 0] } : {}} transition={{ duration: 0.3 }}>
                  <Icon active={isActive} />
                </motion.div>
                <span className={`text-[9px] font-extrabold tracking-widest mt-1 transition-colors duration-200 ${isActive ? 'text-white' : 'text-duo-text-muted'}`}>
                  {name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
