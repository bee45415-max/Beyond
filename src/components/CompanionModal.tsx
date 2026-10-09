import React from 'react';
import { MagicalCatCompanion } from '../game/types';
import { Sparkles, Heart, Fish, Milk, Shield, Zap, Smile, Volume2, X, Footprints, ShieldCheck } from 'lucide-react';
import { soundManager } from '../game/audio';

interface CompanionModalProps {
  cat: MagicalCatCompanion;
  playerGold: number;
  onFeedCat: (foodType: string) => void;
  onPetCat: () => void;
  onTrainCat: () => void;
  onSetAction: (action: 'following' | 'waiting' | 'scouting') => void;
  onClose: () => void;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  cat,
  playerGold,
  onFeedCat,
  onPetCat,
  onTrainCat,
  onSetAction,
  onClose,
}) => {
  const trustPercent = Math.min(100, Math.max(0, cat.trust));

  const getTrustBadge = () => {
    if (cat.trust >= 80) return { label: 'Celestial Guardian ❤️❤️❤️', color: 'text-amber-300 border-amber-400 bg-amber-500/20' };
    if (cat.trust >= 60) return { label: 'Highly Loyal & Friendly ❤️❤️', color: 'text-emerald-300 border-emerald-400 bg-emerald-500/20' };
    if (cat.trust >= 40) return { label: 'Tolerant & Curious ❤️', color: 'text-cyan-300 border-cyan-400 bg-cyan-500/20' };
    if (cat.trust >= 20) return { label: 'Wary & Cautious', color: 'text-yellow-300 border-yellow-400 bg-yellow-500/20' };
    return { label: 'Fearful / Untamed', color: 'text-rose-300 border-rose-400 bg-rose-500/20' };
  };

  const badge = getTrustBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-pink-400/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-500/30 bg-gradient-to-r from-pink-950/60 via-slate-900 to-indigo-950/60 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-400/50 bg-pink-500/20 text-pink-300 shadow-lg relative">
              <Sparkles className="h-6 w-6 text-pink-300 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-black text-slate-950">
                ★
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-pink-200 tracking-wide">{cat.name}</h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-400/30">
                  Lv. {cat.level} Celestial Cat
                </span>
              </div>
              <p className="text-xs text-slate-300">Magical Familiar · Trust & Bond System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Trust Meter Box */}
          <div className="rounded-xl border border-pink-500/30 bg-slate-950/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-200">
                <Heart className="h-4 w-4 text-pink-400 fill-pink-500/50" />
                <span>Animal Trust Meter (0 – 100)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {/* Trust Progress Bar */}
            <div className="h-3.5 w-full overflow-hidden rounded-full border border-pink-400/30 bg-slate-900 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-indigo-400 transition-all duration-300"
                style={{ width: `${trustPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Trust: {cat.trust} / 100</span>
              <span>{trustPercent >= 80 ? 'Loyal Bond Fully Unlocked!' : 'Treat gently to raise loyalty'}</span>
            </div>
          </div>

          {/* Behavior / Orders Selector */}
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-200">Companion Stance</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'following', label: 'Follow Me', icon: Footprints, desc: 'Travels with hero' },
                { id: 'waiting', label: 'Wait Here', icon: ShieldCheck, desc: 'Rests in position' },
                { id: 'scouting', label: 'Protect Village', icon: Shield, desc: 'Defends borders' },
              ].map((act) => {
                const Icon = act.icon;
                const isSelected = cat.currentAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onSetAction(act.id as any);
                    }}
                    className={`rounded-lg border p-2 text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'border-pink-400 bg-pink-500/20 text-pink-200 font-bold shadow'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div>{act.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{act.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Care & Interaction Actions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200">Interact with Starlight</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Petting */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playPurr();
                  onPetCat();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-pink-400/30 bg-slate-950/60 hover:bg-pink-500/10 active:scale-95 transition-all"
              >
                <Smile className="h-5 w-5 text-pink-400 mb-1" />
                <span className="text-xs font-bold text-pink-200">Pet & Scritch</span>
                <span className="text-[10px] text-pink-300/80 mt-0.5">+8 Trust ❤️</span>
              </button>

              {/* Feed Fish */}
              <button
                type="button"
                disabled={playerGold < 15}
                onClick={() => {
                  soundManager.playHarvest();
                  onFeedCat('fish');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  playerGold >= 15
                    ? 'border-cyan-400/30 bg-slate-950/60 hover:bg-cyan-500/10 active:scale-95'
                    : 'border-white/10 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Fish className="h-5 w-5 text-cyan-400 mb-1" />
                <span className="text-xs font-bold text-cyan-200">Feed Fish Treat</span>
                <span className="text-[10px] text-cyan-300/80 mt-0.5">+20 Trust (15g)</span>
              </button>

              {/* Train Magic */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playSpellCast();
                  onTrainCat();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-400/30 bg-slate-950/60 hover:bg-indigo-500/10 active:scale-95 transition-all"
              >
                <Zap className="h-5 w-5 text-indigo-400 mb-1" />
                <span className="text-xs font-bold text-indigo-200">Resonant Training</span>
                <span className="text-[10px] text-indigo-300/80 mt-0.5">+15 Trust & EXP</span>
              </button>
            </div>
          </div>

          {/* Magical Abilities Unlocked */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200">Celestial Magical Abilities</span>
            <div className="space-y-2">
              {(
                cat.specialAbilities || [
                  { id: 'ab_purr', name: 'Purr of Serenity', desc: 'Gradually restores player energy & stamina.', unlocked: cat.trust >= 25, reqTrust: 25 },
                  { id: 'ab_heal', name: 'Healing Starlight', desc: 'Auto-casts restorative starlight healing 35 HP in battle.', unlocked: cat.trust >= 50, reqTrust: 50 },
                  { id: 'ab_speed', name: 'Swift Paws Blessing', desc: 'Amplifies player movement speed by +25%.', unlocked: cat.trust >= 70, reqTrust: 70 },
                  { id: 'ab_shield', name: 'Celestial Ward Shield', desc: 'Conjures an astral barrier absorbing damage.', unlocked: cat.trust >= 85, reqTrust: 85 },
                  { id: 'ab_strike', name: 'Starlight Claws Barrage', desc: 'Leaps into the air striking down bats and flying witches.', unlocked: cat.trust >= 95, reqTrust: 95 },
                ]
              ).map((ab) => (
                <div
                  key={ab.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    ab.unlocked
                      ? 'border-pink-400/40 bg-pink-950/20'
                      : 'border-white/10 bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-pink-200">{ab.name}</span>
                      {ab.unlocked ? (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-400/30">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                          Trust {ab.reqTrust}+
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{ab.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-5 py-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-pink-300/80 font-mono">
            <Volume2 className="h-3.5 w-3.5 text-pink-400" />
            <span>Starlight is purring contentedly</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="rounded-lg bg-pink-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-pink-400 active:scale-95"
          >
            Close Companion
          </button>
        </div>
      </div>
    </div>
  );
};
