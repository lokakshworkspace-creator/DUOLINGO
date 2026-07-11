"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { fetchShopItems, purchaseItem } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const { user, refreshUser } = useUser();
  const isFull = user?.hearts_current === user?.hearts_max;

  useEffect(() => {
    fetchShopItems().then(data => setItems(data));
  }, []);

  const handlePurchase = async (itemId: number, cost: number) => {
    if (!user) return;
    if (user.gems < cost) {
      toast.error('Not enough gems!');
      return;
    }
    try {
      const res = await purchaseItem(itemId);
      toast.success(res.message);
      await refreshUser();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex gap-0 min-h-full">
      {/* Main column */}
      <div className="flex-1 px-8 py-8 pb-28 md:pb-8 max-w-2xl mx-auto">
        {/* Super Banner */}
        <div className="rounded-2xl p-6 mb-10 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1a1060 0%, #4B2FC0 50%, #7F3FC8 100%)' }}>
          <div className="flex-1">
            <div className="bg-white text-duo-purple text-xs font-extrabold px-2 py-0.5 rounded-full w-fit mb-3 tracking-widest">SUPER</div>
            <h2 className="font-extrabold text-white text-xl mb-4 leading-tight">Start a 1 week free trial to enjoy exclusive Super benefits</h2>
            <button className="bg-white text-duo-purple font-extrabold uppercase tracking-wider rounded-2xl border-b-4 border-gray-200 px-6 py-3 hover:brightness-105 active:translate-y-[2px] active:border-b-2 transition-all text-sm">
              START MY FREE 7 DAYS
            </button>
          </div>
          <div className="text-7xl ml-4 select-none">🦉</div>
        </div>

        {/* Hearts section */}
        <h3 className="font-extrabold text-white text-xl mb-4">Hearts</h3>
        <div className="border-t border-duo-border pt-4 mb-4">
          <div className="flex items-center py-4 border-b border-duo-border">
            <div className="text-5xl mr-4">❤️</div>
            <div className="flex-1">
              <div className="font-extrabold text-white text-base">Unlimited Hearts</div>
              <p className="text-duo-text-muted text-sm mt-1">Never run out of hearts with Super!</p>
            </div>
            <button className="ml-4 font-extrabold uppercase tracking-wider rounded-xl border-2 border-duo-purple text-duo-purple-light px-5 py-2 text-sm hover:bg-duo-purple/10 transition-all">
              FREE TRIAL
            </button>
          </div>
        </div>

        {/* Power-Ups section */}
        <h3 className="font-extrabold text-white text-xl mb-4 mt-2">Power-Ups</h3>
        <div className="border-t border-duo-border pt-4">
          {items.map(item => {
            const isRefill = item.type === 'refill_hearts';
            const disabled = (isRefill && isFull) || ((user?.gems ?? 0) < item.cost_gems);
            return (
              <div key={item.id} className="flex items-center py-4 border-b border-duo-border">
                <div className="text-5xl mr-4">{item.icon}</div>
                <div className="flex-1">
                  <div className="font-extrabold text-white text-base">{item.name}</div>
                  <p className="text-duo-text-muted text-sm mt-1">{item.description}</p>
                </div>
                {isRefill && isFull ? (
                  <button disabled className="ml-4 font-extrabold uppercase tracking-wider rounded-xl border-2 border-duo-border text-duo-text-muted cursor-default px-5 py-2 text-sm">FULL</button>
                ) : (
                  <button onClick={() => handlePurchase(item.id, item.cost_gems)} disabled={disabled} className={`ml-4 font-extrabold uppercase tracking-wider rounded-xl border-2 px-5 py-2 text-sm transition-all flex items-center gap-2 ${disabled ? 'border-duo-border text-duo-text-muted cursor-not-allowed' : 'border-duo-gold text-duo-gold hover:bg-duo-gold/10 cursor-pointer'}`}>
                    <span>GET FOR</span>
                    <span className="flex items-center gap-1">💎 {item.cost_gems}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-[340px] shrink-0 py-8 pr-8 pl-4">
        <div className="duo-card p-5 mb-4">
          <div className="font-extrabold text-white text-base mb-2">Unlock Leaderboards!</div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <p className="text-duo-text-muted text-sm leading-relaxed">Complete 2 more lessons to start competing</p>
          </div>
        </div>

        <div className="duo-card p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-extrabold text-white">Daily Quests</span>
            <span className="text-duo-blue text-sm font-bold cursor-pointer hover:underline">VIEW ALL</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="text-white font-bold text-sm mb-1">Earn 10 XP</div>
              <div className="w-full bg-duo-bg-card2 rounded-full h-3">
                <div className="h-full rounded-full bg-duo-gold" style={{ width: '100%' }} />
              </div>
            </div>
            <span className="text-xl">🎒</span>
          </div>
        </div>

        <div className="duo-card p-5 overflow-hidden">
          <div className="font-extrabold text-white text-2xl mb-1">Learn Python</div>
          <p className="text-duo-text-muted text-sm">Start your career in data analysis—enroll for free today.</p>
          <button className="mt-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">›</button>
        </div>
      </aside>
    </div>
  );
}
