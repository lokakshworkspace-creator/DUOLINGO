"use client";
import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { user } = useUser();
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then(data => { setLeaders(data); setLoading(false); });
  }, []);

  return (
    <div className="flex gap-0 min-h-full">
      {/* Main column */}
      <div className="flex-1 min-w-0 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col gap-2 mt-8 animate-fade-in">
             <div className="h-8 w-48 bg-duo-bg-card rounded animate-pulse mb-6" />
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="flex items-center gap-4 p-4 duo-card opacity-50 animate-pulse">
                 <div className={`w-8 h-8 rounded bg-duo-text-muted`} />
                 <div className={`w-10 h-10 rounded-full bg-duo-text-muted`} />
                 <div className="flex-1 h-4 rounded bg-duo-text-muted" />
                 <div className="w-16 h-4 rounded bg-duo-text-muted" />
               </div>
             ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className="font-extrabold text-white text-3xl mb-8">Leaderboard</h1>
            <div className="flex flex-col gap-2">
              {leaders.map((leader, idx) => {
                const isMe = user?.id === leader.id;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={leader.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                      ${isMe ? 'border-duo-blue bg-[#1a3545]' : 'border-transparent hover:bg-duo-bg-card'}`}>
                    <span className="text-xl w-8 text-center font-extrabold text-duo-text-muted">
                      {idx < 3 ? medals[idx] : idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-duo-blue flex items-center justify-center font-extrabold text-white text-lg uppercase">
                      {leader.display_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-extrabold text-white text-sm">{leader.display_name}{isMe ? ' (You)' : ''}</div>
                    </div>
                    <div className="font-extrabold text-duo-text-muted text-sm">{leader.xp_total} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-[340px] shrink-0 py-8 pr-8 pl-4">
        <div className="duo-card p-5">
          <div className="text-duo-text-muted text-xs font-extrabold uppercase tracking-widest mb-2">WHAT ARE LEADERBOARDS?</div>
          <div className="font-extrabold text-white text-lg mb-2">Do lessons. Earn XP. Compete.</div>
          <div className="flex items-start gap-3">
            <p className="text-duo-text-muted text-sm leading-relaxed flex-1">Earn XP through lessons, then compete with players in a weekly leaderboard</p>
            <div className="text-4xl">🦉</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
