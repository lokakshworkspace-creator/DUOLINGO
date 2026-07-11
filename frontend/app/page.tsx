"use client";
import { useEffect, useState } from 'react';
import { fetchPath, fetchQuests, jumpToSkill, fetchLeaderboard } from '@/lib/api';
import { Unit, Quest, Skill } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import SkillNode, { NodeState } from '@/components/path/SkillNode';
import LegendaryStartModal from '@/components/overlay/LegendaryStartModal';

// ─── Treasure Chest ───────────────────────────────────────────────────────────
function TreasureChestNode({ locked = true }: { locked?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 my-2">
      <svg viewBox="0 0 72 58" fill="none" xmlns="http://www.w3.org/2000/svg" width={72} height={58}>
        <rect x="4" y="28" width="64" height="26" rx="5" fill={locked ? "#2a3f4d" : "#7a5a10"} />
        <rect x="4" y="32" width="64" height="22" rx="5" fill={locked ? "#1e303b" : "#5c4008"} />
        <rect x="4" y="8" width="64" height="22" rx="5" fill={locked ? "#3a5060" : "#a0720e"} />
        <rect x="8" y="11" width="56" height="9" rx="3" fill={locked ? "#4a6070" : "#c8921a"} />
        <rect x="23" y="26" width="26" height="12" rx="3" fill={locked ? "#6b7f8a" : "#FFD700"} />
        <path d="M30 26 C30 21 42 21 42 26" stroke={locked ? "#6b7f8a" : "#FFD700"} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="2" y="22" width="10" height="36" rx="3" fill={locked ? "#2a3f4d" : "#7a5a10"} />
        <rect x="60" y="22" width="10" height="36" rx="3" fill={locked ? "#2a3f4d" : "#7a5a10"} />
      </svg>
    </div>
  );
}

// ─── Trophy Node ──────────────────────────────────────────────────────────────
function TrophyNode({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center my-4">
      <div
        className="w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`,
          boxShadow: `0 6px 0 rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.06)`,
        }}
      >
        <svg viewBox="0 0 48 48" width={40} height={40} fill="none">
          <path d="M24 6 L28 18 L40 18 L30 26 L34 38 L24 30 L14 38 L18 26 L8 18 L20 18 Z"
            fill="rgba(255,255,255,0.9)" />
          <rect x="18" y="38" width="12" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
          <rect x="14" y="42" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>
      <span className="mt-2 text-xs font-extrabold tracking-widest uppercase" style={{ color: '#4A6475' }}>Finish</span>
    </div>
  );
}

function PathConnector({ fromX, toX, color, completed }: { fromX: number; toX: number; color: string; completed: boolean }) {
  const startX = 110 + fromX;
  const endX = 110 + toX;
  const pathD = `M${startX} 4 C${startX} 28, ${endX} 28, ${endX} 52`;

  return (
    <div className="relative w-full flex justify-center" style={{ height: 56 }}>
      <svg width="220" height="56" viewBox="0 0 220 56" fill="none" className="overflow-visible">
        <path
          d={pathD}
          stroke={completed ? color : '#1e3040'}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={completed ? "none" : "10 6"}
          opacity={completed ? 0.8 : 0.6}
        />
        {!completed && (
          <path
            d={pathD}
            stroke="#0d1f28"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity={0.4}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Unit Banner ─────────────────────────────────────────────────────────────
function UnitHeader({ unit, onGuidebook }: { unit: Unit; onGuidebook: (id: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl px-6 py-5 flex items-center justify-between mb-10 shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${unit.color_theme}ee, ${unit.color_theme}99)`,
        boxShadow: `0 6px 0 rgba(0,0,0,0.25)`,
      }}
    >
      <div>
        <div className="text-white/70 text-xs font-extrabold uppercase tracking-[0.15em] mb-1">
          SECTION 1, UNIT {unit.order_index}
        </div>
        <div className="text-white font-extrabold text-2xl">{unit.title}</div>
      </div>
      <button
        onClick={() => onGuidebook(unit.id)}
        className="flex items-center gap-2.5 bg-black/20 hover:bg-black/30 border border-white/20 hover:border-white/40 transition-all rounded-2xl px-5 py-3"
      >
        <span className="text-xl">📖</span>
        <span className="text-white font-extrabold text-sm tracking-widest">GUIDEBOOK</span>
      </button>
    </motion.div>
  );
}

// ─── Zigzag offsets (realistic Duolingo pattern) ──────────────────────────────
const ZIGZAG_X = [0, -45, -75, -45, 0, 45, 75, 45];

// ─── Learning path for one unit ──────────────────────────────────────────────
function LearningPath({
  unit,
  onStart,
  onJump,
  onGuidebook,
  jumpTargetId,
  setJumpTargetId,
}: {
  unit: Unit;
  onStart: (id: number) => void;
  onJump: (id: number) => void;
  onGuidebook: (id: number) => void;
  jumpTargetId: number | null;
  setJumpTargetId: (id: number | null) => void;
}) {
  const handleNodeTap = (id: number, state: NodeState) => {
    if (state === 'current') {
      onStart(id);
    } else if (state === 'completed' || state === 'legendary') {
      // Instead of restarting normal lesson, show legendary modal
      if (typeof window !== 'undefined') {
          const event = new CustomEvent('openLegendaryModal', { detail: id });
          window.dispatchEvent(event);
      }
    } else if (state === 'jumpTarget') {
      onJump(id);
    } else if (state === 'locked') {
      const skill = unit.skills.find(s => s.id === id);
      if (skill && skill.order_index === 1) setJumpTargetId(id);
      else setJumpTargetId(null);
    }
  };

  return (
    <section className="mb-20 w-full">
      <UnitHeader unit={unit} onGuidebook={onGuidebook} />

      <div className="relative flex flex-col items-center w-full" style={{ paddingBottom: 24 }}>
        {unit.skills.map((skill, idx) => {
          let state: NodeState = 'locked';
          if (skill.is_legendary) state = 'legendary';
          else if (skill.status === 'completed') state = 'completed';
          else if (skill.status === 'available') state = 'current';
          else if (jumpTargetId === skill.id) state = 'jumpTarget';

          const isFocused =
            jumpTargetId === skill.id ||
            (jumpTargetId === null && state === 'current');

          const xOffset = ZIGZAG_X[idx % ZIGZAG_X.length];

          return (
            <div key={skill.id} className="flex flex-col items-center w-full">
              {/* Winding connector before node (except first) */}
              {idx > 0 && (
                <PathConnector
                  fromX={ZIGZAG_X[(idx - 1) % ZIGZAG_X.length]}
                  toX={xOffset}
                  color={unit.color_theme}
                  completed={state === 'completed' || state === 'current'}
                />
              )}

              {/* Skill node */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: xOffset }}
                animate={{ opacity: 1, scale: 1, x: xOffset }}
                transition={{ delay: 0.05 * idx, type: 'spring', stiffness: 200, damping: 18 }}
              >
                <SkillNode
                  id={skill.id}
                  title={skill.title}
                  state={state}
                  isFocused={isFocused}
                  onTap={handleNodeTap}
                  onGuidebook={onGuidebook}
                />
              </motion.div>

              {/* Treasure chest after every 2nd skill */}
              {(idx + 1) % 2 === 0 && idx < unit.skills.length - 1 && (
                <div style={{ transform: `translateX(${xOffset * 0.4}px)` }}>
                  <TreasureChestNode locked={state === 'locked'} />
                </div>
              )}
            </div>
          );
        })}

        {/* Trophy at end of unit */}
        <PathConnector
          fromX={ZIGZAG_X[(unit.skills.length - 1) % ZIGZAG_X.length]}
          toX={0}
          color={unit.color_theme}
          completed={unit.skills.every(s => s.status === 'completed')}
        />
        <TrophyNode color={unit.color_theme} />
      </div>
    </section>
  );
}

// ─── Right Sidebar Widgets ────────────────────────────────────────────────────
function SuperWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl overflow-hidden mb-4 shrink-0"
      style={{
        background: 'linear-gradient(135deg, #1f3239, #162830)',
        border: '1px solid #2a4255',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <div className="inline-flex items-center gap-1.5 bg-[#9B59B6] rounded-full px-3 py-1 mb-3">
              <span className="text-white text-xs font-extrabold tracking-[0.12em]">SUPER</span>
            </div>
            <h3 className="text-white font-extrabold text-xl leading-tight mb-2">Try Super for free</h3>
            <p className="text-[#6b8fa3] text-sm leading-relaxed">
              No ads, unlimited hearts, personalized practice, and more!
            </p>
          </div>
          <div className="text-6xl shrink-0 mt-1 drop-shadow-lg">🦉</div>
        </div>
        <button className="btn-duo w-full py-3.5 text-sm font-extrabold tracking-widest">
          TRY 2 WEEKS FREE
        </button>
      </div>
    </motion.div>
  );
}

function LeaderboardWidget() {
  const router = useRouter();
  const { user } = useUser();
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchLeaderboard().then(leaders => {
        const index = leaders.findIndex(l => l.id === user.id);
        if (index !== -1) setRank(index + 1);
      }).catch(() => {});
    }
  }, [user]);

  const tiers = [
    { name: 'Bronze', icon: '🥉', color: '#CD7F32', active: true },
    { name: 'Silver', icon: '🥈', color: '#9B9B9B', active: false },
    { name: 'Gold', icon: '🥇', color: '#FFD700', active: false },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl mb-4 overflow-hidden shrink-0"
      style={{ background: '#1f3239', border: '1px solid #2a4255', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-extrabold text-xl">Leaderboard</h3>
          <button
            onClick={() => router.push('/leaderboard')}
            className="text-[#1CB0F6] text-sm font-extrabold hover:text-[#5CCFFF] transition-colors tracking-widest"
          >
            VIEW ALL
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          {tiers.map(t => (
            <div
              key={t.name}
              className="flex-1 flex flex-col items-center py-3 rounded-xl"
              style={{
                background: t.active ? `${t.color}22` : '#172631',
                border: t.active ? `2px solid ${t.color}66` : '2px solid transparent',
              }}
            >
              <span className="text-2xl mb-1">{t.icon}</span>
              <span className="text-xs font-extrabold" style={{ color: t.active ? t.color : '#4A6475' }}>{t.name}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border-2 border-[#2a4255] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow-md">🏆</div>
              <div>
                <div className="text-white font-extrabold text-sm">Bronze League</div>
                <div className="text-[#1CB0F6] text-xs font-bold mt-1">Top 10 advance to Silver</div>
              </div>
            </div>
              <div className="text-right">
              <div className="text-white font-extrabold text-lg">{rank ? `#${rank}` : '-'}</div>
              <div className="text-[#6b8fa3] text-xs font-bold mt-0.5">{user?.xp_total || 0} XP</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuestWidget({ quests }: { quests: Quest[] }) {
  const router = useRouter();
  const activeQuests = quests.filter(q => !q.completed).slice(0, 3);
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl overflow-hidden shrink-0"
      style={{ background: '#1f3239', border: '1px solid #2a4255', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-extrabold text-xl">Daily Quests</h3>
          <button
            onClick={() => router.push('/quests')}
            className="text-[#1CB0F6] text-sm font-extrabold hover:text-[#5CCFFF] transition-colors tracking-widest"
          >
            VIEW ALL
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {activeQuests.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-[#6b8fa3] text-sm font-bold">All quests complete!</p>
            </div>
          ) : (
            activeQuests.map((q) => {
              const pct = Math.min(100, Math.round((q.progress / q.target_value) * 100));
              return (
                <div key={q.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#172631] flex items-center justify-center text-2xl shrink-0">
                    {q.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white font-bold text-sm truncate">{q.title}</span>
                      <span className="text-[#6b8fa3] text-xs font-bold ml-2 shrink-0">{q.progress}/{q.target_value}</span>
                    </div>
                    <div className="w-full h-3.5 bg-[#172631] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
                        className="h-full rounded-full relative"
                        style={{ background: 'linear-gradient(90deg, #58CC02, #89E219)' }}
                      >
                        <div className="absolute inset-x-2 top-1 h-1 bg-white/25 rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {activeQuests.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#2a4255] flex items-center gap-2">
            <span className="text-[#FFD900] text-sm">⚡</span>
            <span className="text-[#6b8fa3] text-xs font-bold">Earn bonus XP by completing all quests</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jumpTargetId, setJumpTargetId] = useState<number | null>(null);
  const [legendaryModalId, setLegendaryModalId] = useState<number | null>(null);

  useEffect(() => {
      const handleOpenModal = (e: any) => setLegendaryModalId(e.detail);
      window.addEventListener('openLegendaryModal', handleOpenModal);
      return () => window.removeEventListener('openLegendaryModal', handleOpenModal);
  }, []);

  const loadData = () => {
    Promise.all([fetchPath(), fetchQuests()])
      .then(([pathData, questsData]) => {
        setUnits(pathData.units);
        setQuests(questsData);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const handleStart = (skillId: number) => { window.location.href = `/lesson/${skillId}`; };
  const handleGuidebook = (unitId: number) => { window.location.href = `/guidebook/${unitId}`; };
  const handleJump = async (skillId: number) => {
    try {
      await jumpToSkill(skillId);
      setJumpTargetId(null);
      setLoading(true);
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  if (error) return (
    <div className="flex h-full items-center justify-center text-duo-red font-bold">{error}</div>
  );

  return (
    <div className="flex gap-0 min-h-full">
      {/* ── Path column ── */}
      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hide pb-32 md:pb-10">
        <div className="max-w-lg mx-auto px-4 pt-8">
          {loading ? (
            <div className="flex flex-col gap-8 items-center mt-20">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[100px] h-[100px] rounded-full bg-duo-bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            units.map(unit => (
              <LearningPath
                key={unit.id}
                unit={unit}
                onStart={handleStart}
                onJump={handleJump}
                onGuidebook={handleGuidebook}
                jumpTargetId={jumpTargetId}
                setJumpTargetId={setJumpTargetId}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <aside className="hidden xl:flex flex-col w-[460px] shrink-0 py-8 pr-8 pl-4 overflow-y-auto scrollbar-hide">
        <SuperWidget />
        <LeaderboardWidget />
        <QuestWidget quests={quests} />
      </aside>

      {/* Overlays */}
      {legendaryModalId !== null && (
          <LegendaryStartModal skillId={legendaryModalId} onClose={() => setLegendaryModalId(null)} />
      )}
    </div>
  );
}