"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchQuests, claimQuest } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/Toast';

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [claimingIds, setClaimingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuests().then(data => { setQuests(data); setLoading(false); });
  }, []);

  const handleClaim = async (questId: number) => {
    if (claimingIds.has(questId)) return;
    
    setClaimingIds(prev => new Set(prev).add(questId));
    try {
      const res = await claimQuest(questId);
      toast.success(`Claimed! +${res.xp_gained} XP, +${res.gems_gained} Gems`);
      await refreshUser();
      // Refresh quests locally to show it as claimed
      const updated = await fetchQuests();
      setQuests(updated);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setClaimingIds(prev => {
        const next = new Set(prev);
        next.delete(questId);
        return next;
      });
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-duo-text-muted font-bold">Loading...</div>;

  return (
    <div className="flex gap-0 min-h-full">
      {/* Main column */}
      <div className="flex-1 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 mb-8 flex items-center justify-between" style={{ background: '#9B59B6' }}>
          <div>
            <h2 className="font-extrabold text-white text-2xl mb-1">Welcome!</h2>
            <p className="text-white/80 text-sm leading-relaxed">Complete quests to earn rewards! Quests refresh every day.</p>
          </div>
          <div className="text-6xl select-none">🦉</div>
        </div>

        {/* Daily Quests */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-white text-xl">Daily Quests</h3>
          <span className="text-duo-text-muted text-sm font-bold flex items-center gap-1">⏰ 1 HOUR</span>
        </div>

        {quests.map(q => {
          const isComplete = q.progress >= q.target_value;
          return (
            <div key={q.id} className={`duo-card p-5 mb-3 ${q.claimed ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{q.icon}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-white text-base mb-2">{q.title}</div>
                  <div className="w-full bg-duo-bg-card2 rounded-full h-4 overflow-hidden relative">
                    <div className="h-full rounded-full bg-duo-gold" style={{ width: `${Math.min(100, (q.progress / q.target_value) * 100)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-white">
                      {q.progress} / {q.target_value}
                    </span>
                  </div>
                </div>
                {isComplete && !q.claimed ? (
                  <button onClick={() => handleClaim(q.id)} disabled={claimingIds.has(q.id)} className="btn-duo py-2 px-4 text-xs disabled:opacity-50">CLAIM</button>
                ) : (
                  <span className="text-3xl opacity-60">🎒</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-[340px] shrink-0 py-8 pr-8 pl-4">
        <div className="duo-card p-5 mb-4">
          <div className="font-extrabold text-white text-base mb-1">Monthly challenges unlock soon!</div>
          <div className="flex items-start gap-3">
            <p className="text-duo-text-muted text-sm leading-relaxed flex-1">Complete each month&#39;s challenge to earn exclusive badges</p>
            <div className="text-4xl shrink-0">🏅</div>
          </div>
          <Link href="/" className="btn-outline w-full mt-4 py-2.5 text-sm block text-center">START A LESSON</Link>
        </div>

        <div className="text-center text-duo-text-muted text-xs mt-4 space-x-2">
          <span className="hover:underline cursor-pointer">ABOUT</span>
          <span className="hover:underline cursor-pointer">BLOG</span>
          <span className="hover:underline cursor-pointer">STORE</span>
          <span className="hover:underline cursor-pointer">PRIVACY</span>
        </div>
      </aside>
    </div>
  );
}
