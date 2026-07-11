"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronLeft, Star, ArrowRight, ChevronDown, ChevronUp,
  Languages, GraduationCap, Layers, Zap
} from 'lucide-react';
import { fetchUnitGuidebook } from '@/lib/api';
import { Guidebook, GuidebookSkill, GuidebookExercise } from '@/lib/types';

function extractVocab(exercises: GuidebookExercise[]): { en: string; es: string }[] {
  const seen = new Set<string>();
  const vocab: { en: string; es: string }[] = [];
  for (const ex of exercises) {
    if (ex.type === 'multiple_choice' || ex.type === 'type_answer') {
      const match = ex.prompt.match(/['"]([^'"]+)['"]/);
      if (!match) continue;
      const english = match[1];
      const correct = ex.options.find(o => o.is_correct);
      if (!correct) continue;
      const key = english.toLowerCase();
      if (!seen.has(key)) { seen.add(key); vocab.push({ en: english, es: correct.content }); }
    }
  }
  return vocab;
}

function extractPairs(exercises: GuidebookExercise[]): { en: string; es: string }[] {
  const seen = new Set<string>();
  const pairs: { en: string; es: string }[] = [];
  for (const ex of exercises) {
    if (ex.type !== 'match_pairs') continue;
    const byKey: Record<string, string[]> = {};
    for (const opt of ex.options) {
      if (!opt.pair_key) continue;
      if (!byKey[opt.pair_key]) byKey[opt.pair_key] = [];
      byKey[opt.pair_key].push(opt.content);
    }
    for (const [key, words] of Object.entries(byKey)) {
      if (words.length === 2 && !seen.has(key)) {
        seen.add(key);
        const [a, b] = words;
        const aLooksSpanish = /[áéíóúüñ¿¡]/i.test(a);
        pairs.push(aLooksSpanish ? { en: b, es: a } : { en: a, es: b });
      }
    }
  }
  return pairs;
}

function extractSentences(exercises: GuidebookExercise[]): { en: string; es: string }[] {
  const seen = new Set<string>();
  const result: { en: string; es: string }[] = [];
  for (const ex of exercises) {
    if (ex.type !== 'translate') continue;
    const match = ex.prompt.match(/Translate:\s*"([^"]+)"/i);
    if (!match) continue;
    const english = match[1];
    if (seen.has(english.toLowerCase())) continue;
    seen.add(english.toLowerCase());
    const correctWords = ex.options
      .filter(o => o.is_correct)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(o => o.content).join(' ');
    if (correctWords) result.push({ en: english, es: correctWords });
  }
  return result;
}

const SKILL_EMOJIS: Record<string, string> = {
  Intro: '⭐', Greetings: '👋', Travel: '✈️', Restaurant: '🍽️',
  Family: '👨‍👩‍👧‍👦', Shopping: '🛍️', School: '📚', People: '👥', Time: '🕐',
};

const SKILL_COLORS: Record<string, { from: string; to: string; text: string }> = {
  Intro:      { from: '#58CC02', to: '#3DA800', text: '#58CC02' },
  Greetings:  { from: '#CE82FF', to: '#A05EDB', text: '#CE82FF' },
  Travel:     { from: '#FF9600', to: '#E07800', text: '#FF9600' },
  Restaurant: { from: '#FF4B4B', to: '#CC2B2B', text: '#FF4B4B' },
  Family:     { from: '#1CB0F6', to: '#0B8BC6', text: '#1CB0F6' },
  Shopping:   { from: '#FFC800', to: '#D9A800', text: '#FFC800' },
  School:     { from: '#58CC02', to: '#3DA800', text: '#58CC02' },
  People:     { from: '#CE82FF', to: '#A05EDB', text: '#CE82FF' },
  Time:       { from: '#FF9600', to: '#E07800', text: '#FF9600' },
};

function VocabTable({ vocab }: { vocab: { en: string; es: string }[] }) {
  if (vocab.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
      <div className="grid grid-cols-2 bg-white/5 text-xs font-extrabold uppercase tracking-widest text-duo-text-muted px-4 py-2">
        <span>English</span><span>Spanish</span>
      </div>
      {vocab.map((v, i) => (
        <div key={i} className={`grid grid-cols-2 px-4 py-2.5 text-sm border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
          <span className="text-duo-text-muted font-medium">{v.en}</span>
          <span className="text-white font-bold">{v.es}</span>
        </div>
      ))}
    </div>
  );
}

function PairsGrid({ pairs }: { pairs: { en: string; es: string }[] }) {
  if (pairs.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {pairs.map((p, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-duo-text-muted text-xs font-semibold truncate">{p.en}</span>
          <span className="text-[10px] text-duo-text-muted/40 shrink-0">→</span>
          <span className="text-white text-sm font-bold truncate text-right">{p.es}</span>
        </div>
      ))}
    </div>
  );
}

function SentencesList({ sentences }: { sentences: { en: string; es: string }[] }) {
  if (sentences.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {sentences.map((s, i) => (
        <div key={i} className="rounded-xl border px-4 py-3" style={{ background: 'rgba(88,204,2,0.06)', borderColor: 'rgba(88,204,2,0.18)' }}>
          <p className="text-[#58CC02] font-bold text-sm italic">{s.es}</p>
          <p className="text-duo-text-muted text-xs mt-0.5">{s.en}</p>
        </div>
      ))}
    </div>
  );
}

function SkillLessonCard({ skill, defaultOpen }: { skill: GuidebookSkill; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const color = SKILL_COLORS[skill.title] ?? SKILL_COLORS['Intro'];
  const emoji = SKILL_EMOJIS[skill.title] ?? '📖';
  const allExercises = skill.lessons.flatMap(l => l.exercises);
  const vocab = extractVocab(allExercises);
  const pairs = extractPairs(allExercises);
  const sentences = extractSentences(allExercises);
  const pairEn = new Set(pairs.map(p => p.en.toLowerCase()));
  const uniqueVocab = vocab.filter(v => !pairEn.has(v.en.toLowerCase()));

  return (
    <motion.div layout className="duo-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-5 py-4 text-left group">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-extrabold text-base">{skill.title}</div>
          <div className="text-duo-text-muted text-xs mt-0.5">
            {skill.lessons.length} lesson{skill.lessons.length !== 1 ? 's' : ''} · {uniqueVocab.length + pairs.length} vocab words · {sentences.length} phrases
          </div>
        </div>
        <div className="text-duo-text-muted group-hover:text-white transition-colors shrink-0">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/8">
              {uniqueVocab.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-4 h-4" style={{ color: color.text }} />
                    <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: color.text }}>Vocabulary</span>
                  </div>
                  <VocabTable vocab={uniqueVocab} />
                </div>
              )}
              {pairs.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4" style={{ color: color.text }} />
                    <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: color.text }}>Word Pairs</span>
                  </div>
                  <PairsGrid pairs={pairs} />
                </div>
              )}
              {sentences.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4" style={{ color: color.text }} />
                    <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: color.text }}>Sample Sentences</span>
                  </div>
                  <SentencesList sentences={sentences} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GuidebookPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = Number(params.unitId);
  const [guidebook, setGuidebook] = useState<Guidebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'vocab'>('notes');

  useEffect(() => {
    if (!unitId) return;
    fetchUnitGuidebook(unitId)
      .then((data) => { setGuidebook(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [unitId]);

  const handleStartLesson = async () => {
    if (starting) return;
    setStarting(true);
    try { router.push(`/`); } catch { setStarting(false); }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col gap-4 items-center w-full max-w-md px-4">
          {[...Array(4)].map((_, i) => (<div key={i} className="w-full h-24 rounded-2xl bg-duo-bg-card animate-pulse" />))}
        </div>
      </div>
    );
  }

  if (error || !guidebook) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <span className="text-4xl">📖</span>
        <p className="text-duo-text-muted font-bold text-lg">No guidebook found for this unit yet.</p>
        <button onClick={() => router.back()} className="btn-duo px-6 py-2">Go Back</button>
      </div>
    );
  }

  const hasSkills = guidebook.skills && guidebook.skills.length > 0;

  return (
    <div className="min-h-full pb-28 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => router.back()} className="flex items-center gap-2 text-duo-text-muted font-bold mb-6 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />Back to Path
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="duo-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #58CC02, #4BA002)' }}>
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-duo-text-muted text-xs font-extrabold uppercase tracking-widest mb-1">Unit Guidebook</div>
              <h1 className="text-white font-extrabold text-2xl leading-tight mb-2">{guidebook.title}</h1>
              <p className="text-duo-text-muted text-sm leading-relaxed">{guidebook.summary}</p>
            </div>
          </div>
          {hasSkills && (
            <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-white font-extrabold text-lg">{guidebook.sections.length}</span>
                <span className="text-duo-text-muted text-xs">Grammar Notes</span>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1 flex flex-col items-center">
                <span className="text-white font-extrabold text-lg">{guidebook.skills.length}</span>
                <span className="text-duo-text-muted text-xs">Skills</span>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1 flex flex-col items-center">
                <span className="text-white font-extrabold text-lg">{guidebook.skills.reduce((sum, sk) => sum + sk.lessons.length, 0)}</span>
                <span className="text-duo-text-muted text-xs">Lessons</span>
              </div>
            </div>
          )}
        </motion.div>

        {hasSkills && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-5 p-1 rounded-xl bg-duo-bg-card">
            <button onClick={() => setActiveTab('notes')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-extrabold transition-all ${activeTab === 'notes' ? 'bg-[#58CC02] text-white shadow-lg' : 'text-duo-text-muted hover:text-white'}`}>
              <GraduationCap className="w-4 h-4" />Grammar Notes
            </button>
            <button onClick={() => setActiveTab('vocab')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-extrabold transition-all ${activeTab === 'vocab' ? 'bg-[#CE82FF] text-white shadow-lg' : 'text-duo-text-muted hover:text-white'}`}>
              <Languages className="w-4 h-4" />Vocabulary
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4 mb-8">
              {guidebook.sections.map((section, idx) => (
                <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + idx * 0.06 }} className="duo-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0" style={{ background: 'linear-gradient(135deg, #CE82FF, #A05EDB)' }}>
                      {idx + 1}
                    </div>
                    <h2 className="text-white font-extrabold text-base">{section.heading}</h2>
                  </div>
                  <p className="text-duo-text-muted text-sm leading-relaxed mb-4">{section.body_text}</p>
                  {section.example_sentence && (
                    <div className="rounded-xl p-3 border" style={{ background: 'rgba(88,204,2,0.07)', borderColor: 'rgba(88,204,2,0.2)' }}>
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-[#58CC02] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#58CC02] font-bold text-sm italic">{section.example_sentence}</p>
                          {section.example_translation && (<p className="text-duo-text-muted text-xs mt-1">{section.example_translation}</p>)}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'vocab' && hasSkills && (
            <motion.div key="vocab" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-3 mb-8">
              <p className="text-duo-text-muted text-sm mb-1">All vocabulary and phrases covered in this unit — organised by skill. Click a skill to expand.</p>
              {guidebook.skills.map((skill, idx) => (
                <motion.div key={skill.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * idx }}>
                  <SkillLessonCard skill={skill} defaultOpen={idx === 0} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button id="guidebook-start-lesson-btn" onClick={handleStartLesson} disabled={starting} className="btn-duo w-full py-4 text-base font-extrabold tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
            {starting ? 'Starting…' : 'START LESSON'}
            {!starting && <ArrowRight className="w-5 h-5" />}
          </button>
          <p className="text-center text-duo-text-muted text-xs mt-3">This guidebook is available anytime from the Path screen.</p>
        </motion.div>

      </div>
    </div>
  );
}