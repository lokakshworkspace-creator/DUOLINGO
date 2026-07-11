"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('duo_token');
        if (!token) return;
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1';
        const res = await fetch(`${API_BASE}/achievements`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAchievements(data);
        }
      } catch (err) {
        console.error("Error fetching achievements", err);
      }
    };
    fetchAchievements();
  }, []);

  if (!user) return (
    <div className="flex h-full items-center justify-center text-duo-text-muted font-bold">Loading...</div>
  );

  return (
    <div className="flex gap-0 min-h-full">
      {/* Main column */}
      <div className="flex-1 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
        {/* Avatar banner */}
        <div className="duo-card overflow-hidden mb-6 relative">
          <div className="h-36 flex items-center justify-center bg-[#1a3545]">
            <div className="w-28 h-28 rounded-full bg-duo-blue/30 border-4 border-duo-blue flex items-center justify-center text-6xl text-duo-text-muted">
              👤
            </div>
          </div>
          <button className="absolute top-3 right-3 w-8 h-8 bg-duo-bg-card rounded-full flex items-center justify-center text-duo-text-muted hover:text-white transition-colors">
            ✏️
          </button>
        </div>

        {/* Name & info */}
        <div className="mb-2">
          <h1 className="font-extrabold text-white text-2xl">{user.display_name}</h1>
          <p className="text-duo-text-muted text-sm mt-0.5">@{user.username}</p>
          <p className="text-duo-text-muted text-sm">Joined July 2026</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold mb-1">
          <span className="text-duo-blue cursor-pointer hover:underline">0 Following</span>
          <span className="text-duo-blue cursor-pointer hover:underline">0 Followers</span>
        </div>
        <div className="text-2xl mt-1 mb-6">🇩🇪</div>

        <div className="border-t border-duo-border pt-6 mb-2">
          <h2 className="font-extrabold text-white text-xl mb-4">Statistics</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="duo-card p-4 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="font-extrabold text-white text-2xl">{user.streak_current}</div>
              <div className="text-duo-text-muted text-xs font-bold">Day streak</div>
            </div>
          </div>
          <div className="duo-card p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-extrabold text-white text-2xl">{user.xp_total ?? '—'}</div>
              <div className="text-duo-text-muted text-xs font-bold">Total XP</div>
            </div>
          </div>
          <div className="duo-card p-4 flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-extrabold text-white text-lg">{user.completed_lessons}</div>
              <div className="text-duo-text-muted text-xs font-bold">Lessons Completed</div>
            </div>
          </div>
          <div className="duo-card p-4 flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-extrabold text-white text-2xl">{user.completed_skills}</div>
              <div className="text-duo-text-muted text-xs font-bold">Skills Mastered</div>
            </div>
          </div>
        </div>

        <h2 className="font-extrabold text-white text-xl mb-4">Achievements</h2>
        <div className="flex flex-col gap-3">
          {achievements.length > 0 ? (
            achievements.map((ach) => {
              const progressPercent = ach.criteria_value > 0 ? Math.min(100, (ach.current_progress / ach.criteria_value) * 100) : 100;
              return (
                <div key={ach.id} className={`duo-card p-4 flex flex-col md:flex-row items-start md:items-center gap-4 ${!ach.unlocked ? 'opacity-60 grayscale' : ''}`}>
                  <div className={`w-16 h-16 shrink-0 bg-duo-bg flex items-center justify-center text-4xl rounded-full border-4 ${ach.unlocked ? 'border-duo-gold' : 'border-duo-border'}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-white text-lg">{ach.title}</div>
                    <div className="text-duo-text-muted text-sm">{ach.description}</div>
                    {!ach.unlocked && (
                      <div className="w-full bg-duo-bg-card2 rounded-full h-3 overflow-hidden mt-3 relative">
                        <div className="bg-duo-gold h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                          {ach.current_progress} / {ach.criteria_value}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 md:self-auto">
                    {ach.unlocked ? (
                      <div className="text-duo-gold font-bold text-sm whitespace-nowrap">
                         Unlocked
                      </div>
                    ) : (
                      <div className="text-duo-text-muted font-bold text-xs">
                        Reward: {ach.xp_reward} XP | {ach.gem_reward} 💎
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="duo-card p-6 text-center text-duo-text-muted font-bold">
              Loading achievements...
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-[340px] shrink-0 py-8 pr-8 pl-4">
        {/* Following / Followers tabs */}
        <div className="duo-card overflow-hidden mb-4">
          <div className="flex border-b border-duo-border">
            <button className="flex-1 py-3 font-extrabold text-sm text-white border-b-2 border-duo-blue text-center">FOLLOWING</button>
            <button className="flex-1 py-3 font-extrabold text-sm text-duo-text-muted text-center">FOLLOWERS</button>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
            <p className="text-duo-text-muted text-sm text-center leading-relaxed">
              Learning is more fun and effective when you connect with others.
            </p>
          </div>
        </div>

        {/* Add friends */}
        <div className="duo-card p-5">
          <div className="font-extrabold text-white text-base mb-4">Add friends</div>
          <Link href="#" className="flex items-center gap-3 py-3 border-b border-duo-border hover:bg-duo-bg-card2 -mx-5 px-5 transition-colors">
            <span className="text-xl">🔍</span>
            <span className="font-bold text-white flex-1">Find friends</span>
            <span className="text-duo-text-muted">›</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 py-3 hover:bg-duo-bg-card2 -mx-5 px-5 mt-1 transition-colors rounded-b-2xl">
            <span className="text-xl">✉️</span>
            <span className="font-bold text-white flex-1">Invite friends</span>
            <span className="text-duo-text-muted">›</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
