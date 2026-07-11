"use client";
import React, { useState } from 'react';
import { Check, Star, Lock, ChevronsRight } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

export type NodeState = 'locked' | 'current' | 'completed' | 'legendary' | 'jumpTarget';

interface SkillNodeProps {
  id: number;
  title: string;
  state: NodeState;
  isFocused: boolean;
  onTap: (id: number, state: NodeState) => void;
  onGuidebook?: (id: number) => void;
}

// Real Duo owl SVG mascot
function DuoOwl({ dark = false }: { dark?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <ellipse cx="40" cy="48" rx="22" ry="24" fill={dark ? "#3A4750" : "#58CC02"} />
      {/* Head */}
      <circle cx="40" cy="28" r="20" fill={dark ? "#3A4750" : "#58CC02"} />
      {/* Belly */}
      <ellipse cx="40" cy="52" rx="14" ry="16" fill={dark ? "#2B343B" : "#89E219"} />
      {/* Left eye white */}
      <circle cx="32" cy="26" r="9" fill="white" />
      {/* Right eye white */}
      <circle cx="48" cy="26" r="9" fill="white" />
      {/* Left pupil */}
      <circle cx="32" cy="27" r="5" fill={dark ? "#1a1a1a" : "#1a1a1a"} />
      {/* Right pupil */}
      <circle cx="48" cy="27" r="5" fill={dark ? "#1a1a1a" : "#1a1a1a"} />
      {/* Left eye shine */}
      <circle cx="34" cy="24" r="2" fill="white" />
      {/* Right eye shine */}
      <circle cx="50" cy="24" r="2" fill="white" />
      {/* Beak */}
      <ellipse cx="40" cy="34" rx="5" ry="3.5" fill={dark ? "#6B7280" : "#FF9600"} />
      {/* Left feet */}
      <ellipse cx="31" cy="71" rx="8" ry="4" fill={dark ? "#2B343B" : "#FF9600"} />
      {/* Right feet */}
      <ellipse cx="49" cy="71" rx="8" ry="4" fill={dark ? "#2B343B" : "#FF9600"} />
      {/* Left wing */}
      <ellipse cx="18" cy="50" rx="7" ry="12" fill={dark ? "#2B343B" : "#46A302"} transform="rotate(-15 18 50)" />
      {/* Right wing */}
      <ellipse cx="62" cy="50" rx="7" ry="12" fill={dark ? "#2B343B" : "#46A302"} transform="rotate(15 62 50)" />
      {/* Head feathers */}
      <polygon points="30,10 28,2 34,8" fill={dark ? "#2B343B" : "#46A302"} />
      <polygon points="40,8 40,0 44,7" fill={dark ? "#2B343B" : "#46A302"} />
      <polygon points="50,10 52,2 46,8" fill={dark ? "#2B343B" : "#46A302"} />
    </svg>
  );
}

// Treasure chest SVG
function TreasureChest({ locked = true }: { locked?: boolean }) {
  return (
    <svg viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Chest body bottom */}
      <rect x="4" y="26" width="56" height="26" rx="4" fill={locked ? "#3A4750" : "#8B6914"} />
      {/* Chest body shadow */}
      <rect x="4" y="30" width="56" height="22" rx="4" fill={locked ? "#2B343B" : "#6B4F0A"} />
      {/* Chest lid */}
      <rect x="4" y="8" width="56" height="20" rx="4" fill={locked ? "#4A5568" : "#B8821A"} />
      {/* Chest lid highlight */}
      <rect x="8" y="10" width="48" height="8" rx="2" fill={locked ? "#5A6678" : "#D4A020"} />
      {/* Lock */}
      <rect x="26" y="24" width="12" height="10" rx="2" fill={locked ? "#6B7280" : "#FFD700"} />
      <path d="M29 24 C29 20 35 20 35 24" stroke={locked ? "#6B7280" : "#FFD700"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Metal clasp */}
      <rect x="22" y="20" width="20" height="6" rx="2" fill={locked ? "#4A5568" : "#A0700A"} />
      {/* Side straps */}
      <rect x="4" y="20" width="8" height="32" rx="2" fill={locked ? "#374151" : "#8B6914"} />
      <rect x="52" y="20" width="8" height="32" rx="2" fill={locked ? "#374151" : "#8B6914"} />
    </svg>
  );
}

export default function SkillNode({ id, title, state, isFocused, onTap, onGuidebook }: SkillNodeProps) {
  let topColor = '#3A4750';
  let baseColor = '#2B343B';
  let Icon = Lock;
  let iconColor = 'rgba(255,255,255,0.3)';
  let tooltipLabel = '';
  let tooltipBg = '';
  let idleAnim = {};

  if (state === 'current') {
    topColor = '#58CC02';
    baseColor = '#3EA800';
    Icon = Star;
    iconColor = 'white';
    tooltipLabel = 'START';
    tooltipBg = '#58CC02';
    idleAnim = { y: [0, -4, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } };
  } else if (state === 'completed') {
    topColor = '#FFC800';
    baseColor = '#E09000';
    Icon = Check;
    iconColor = 'white';
  } else if (state === 'legendary') {
    topColor = '#FFD900';
    baseColor = '#DCA300';
    Icon = Star; 
    iconColor = 'white';
    tooltipLabel = 'PRACTICE';
    tooltipBg = '#FFD900';
    idleAnim = { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } };
  } else if (state === 'jumpTarget') {
    topColor = '#CE82FF';
    baseColor = '#9040CC';
    Icon = ChevronsRight;
    iconColor = 'white';
    tooltipLabel = 'JUMP HERE?';
    tooltipBg = '#CE82FF';
  }

  const controls = useAnimation();
  const handleTap = async () => {
    if (state === 'locked') {
      await controls.start({ x: [-6, 6, -4, 4, 0], transition: { duration: 0.35 } });
    }
    onTap(id, state);
  };

  const NODE_SIZE = 100;
  const BASE_OFFSET = 10;

  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: NODE_SIZE + 32, minHeight: NODE_SIZE + BASE_OFFSET + 40 }}>
      {/* Tooltip */}
      <AnimatePresence>
        {isFocused && tooltipLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute z-30 flex flex-col items-center pointer-events-none"
            style={{ bottom: NODE_SIZE + BASE_OFFSET + 14 }}
          >
            <div
              className="px-5 py-2 rounded-2xl font-extrabold text-white text-sm tracking-widest uppercase shadow-xl"
              style={{ background: tooltipBg, boxShadow: `0 4px 0 rgba(0,0,0,0.3)` }}
            >
              {tooltipLabel}
            </div>
            <div className="w-0 h-0 mt-0" style={{
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: `9px solid ${tooltipBg}`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Button Node */}
      <motion.button
        animate={controls}
        onClick={handleTap}
        whileTap={state !== 'locked' ? { scale: 0.93, y: BASE_OFFSET } : {}}
        className="relative outline-none cursor-pointer"
        style={{ width: NODE_SIZE, height: NODE_SIZE + BASE_OFFSET }}
      >
        {/* Progress arc for current */}
        {(state === 'current' || state === 'legendary') && (
          <svg
            className="absolute -inset-2 pointer-events-none"
            style={{ width: NODE_SIZE + 16, height: NODE_SIZE + 16, top: -8, left: -8 }}
            viewBox="0 0 116 116"
          >
            <circle cx="58" cy="58" r="52" fill="none" stroke={state === 'legendary' ? 'rgba(255,217,0,0.25)' : 'rgba(88,204,2,0.25)'} strokeWidth="6" />
            <circle
              cx="58" cy="58" r="52"
              fill="none"
              stroke={state === 'legendary' ? '#FFD900' : '#7FDB3E'}
              strokeWidth="6"
              strokeDasharray="326"
              strokeDashoffset={state === 'legendary' ? "0" : "230"}
              strokeLinecap="round"
              transform="rotate(-90 58 58)"
            />
          </svg>
        )}
        {/* 3D Extrude Base */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            height: NODE_SIZE,
            width: NODE_SIZE,
            backgroundColor: baseColor,
          }}
        />
        {/* Top face */}
        <motion.div
          animate={(state === 'current' || state === 'legendary') ? idleAnim : {}}
          className="absolute top-0 left-0 rounded-full flex items-center justify-center"
          style={{
            height: NODE_SIZE,
            width: NODE_SIZE,
            backgroundColor: topColor,
            boxShadow: state === 'current'
              ? `0 0 0 4px rgba(88,204,2,0.3), inset 0 3px 0 rgba(255,255,255,0.2)`
              : state === 'legendary'
                ? `0 0 0 4px rgba(255,217,0,0.4), inset 0 3px 0 rgba(255,255,255,0.4)`
                : `inset 0 3px 0 rgba(255,255,255,0.12)`,
          }}
        >
          {/* Inner highlight ring for active states */}
          {state !== 'locked' && (
            <div
              className="absolute inset-3 rounded-full border-2"
              style={{ borderColor: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}
            />
          )}
          {Icon === Star ? (
            <Star className="w-12 h-12" fill="white" stroke="none" />
          ) : Icon === Check ? (
            <Check className="w-12 h-12" strokeWidth={3} color="white" />
          ) : Icon === Lock ? (
            <Lock className="w-10 h-10" style={{ color: iconColor }} />
          ) : (
            <ChevronsRight className="w-11 h-11" color="white" />
          )}
        </motion.div>
      </motion.button>

      {/* Title label */}
      <span
        className="mt-3 font-extrabold text-[13px] tracking-wide text-center"
        style={{ color: state === 'locked' ? '#4A6475' : '#8BABB8', maxWidth: 110 }}
      >
        {title}
      </span>

      {/* Duo Owl mascot */}
      {(state === 'current' || state === 'jumpTarget') && (
        <motion.div
          animate={state === 'current' ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute pointer-events-none"
          style={{ right: -72, top: -4, width: 64, height: 64 }}
        >
          <DuoOwl dark={state === 'jumpTarget'} />
        </motion.div>
      )}
    </div>
  );
}