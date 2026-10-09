import React, { useState } from 'react';
import { CharacterPower, SummonTemplate, ActiveSummon } from '../game/stage4_data';
import { Zap, Sparkles, Flame, Shield, ArrowUpCircle, X, ShieldAlert, Swords, Heart, Clock } from 'lucide-react';
import { soundManager } from '../game/audio';

interface PowersModalProps {
  powers: CharacterPower[];
  summonTemplates: SummonTemplate[];
  activeSummons: ActiveSummon[];
  playerLevel: number;
  playerExp: number;
  playerGold: number;
  playerStamina: number;
  onUpgradePower: (powerId: string) => void;
  onCastPower: (powerId: string) => void;
  onSummonWarrior: (templateId: string) => void;
  onUpgradeSummon: (templateId: string) => void;
  onClose: () => void;
}

export const PowersModal: React.FC<PowersModalProps> = ({
  powers,
  summonTemplates,
  activeSummons,
  playerLevel,
  playerExp,
  playerGold,
  playerStamina,
  onUpgradePower,
  onCastPower,
  onSummonWarrior,
  onUpgradeSummon,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'powers' | 'summons'>('powers');

  const maxCapacity = Math.min(5, 2 + Math.floor(playerLevel / 3));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-cyan-500/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-cyan-200 tracking-wide">Arcane Powers & Summoning</h2>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                  Hero Lv. {playerLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Unlock, Upgrade & Command Fallen Warriors</p>
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

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('powers');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
              activeTab === 'powers'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-lg font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Character Powers ({powers.filter((p) => p.isUnlocked).length}/{powers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('summons');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
              activeTab === 'summons'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10 rounded-t-lg font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Summon Warriors (Active: {activeSummons.length}/{maxCapacity})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* TAB 1: CHARACTER POWERS */}
          {activeTab === 'powers' && (
            <div className="space-y-3">
              {powers.map((p) => {
                const canAffordUpgrade =
                  playerExp >= p.upgradeCost.exp && playerGold >= p.upgradeCost.gold;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      p.isUnlocked
                        ? 'border-cyan-500/30 bg-slate-950/60'
                        : 'border-white/10 bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-cyan-200">{p.name}</span>
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-400/30">
                            Lv. {p.level}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            [{p.type}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{p.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                          <span className="text-rose-300">💥 Dmg: {p.damage}</span>
                          <span className="text-cyan-300">⚡ Mana: {p.manaCost}</span>
                          <span className="text-amber-300">⏱ CD: {p.cooldown}s</span>
                        </div>
                      </div>

                      {/* Power Actions */}
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        {p.isUnlocked ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playSpellCast();
                                onCastPower(p.id);
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-cyan-400 bg-cyan-500/20 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 active:scale-95"
                            >
                              Cast / Trigger
                            </button>
                            <button
                              type="button"
                              disabled={!canAffordUpgrade}
                              onClick={() => {
                                soundManager.playLevelUp();
                                onUpgradePower(p.id);
                              }}
                              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                canAffordUpgrade
                                  ? 'border border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 active:scale-95'
                                  : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                              title={`Requires ${p.upgradeCost.exp} EXP and ${p.upgradeCost.gold}g`}
                            >
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                              <span>Upgrade ({p.upgradeCost.exp}xp, {p.upgradeCost.gold}g)</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] text-amber-400 italic">
                            🔒 {p.unlockRequirement}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SUMMON WARRIORS */}
          {activeTab === 'summons' && (
            <div className="space-y-4">
              {/* Summon Capacity Banner */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-300">Summoning Capacity</div>
                  <div className="text-[11px] text-slate-400">
                    Max summons increased with Player Level. Currently commanding {activeSummons.length} of {maxCapacity} warriors.
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-indigo-200">
                  {activeSummons.length} / {maxCapacity}
                </div>
              </div>

              {/* Active Summons List (if any) */}
              {activeSummons.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200">Active Vanguard on Battlefield</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSummons.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-indigo-400/40 bg-slate-950/80 p-2.5 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-indigo-200">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            HP: {Math.round(s.hp)}/{s.maxHp} · Atk: {s.attack}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(s.durationLeft)}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summon Templates Catalog */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-200">Summonable Fallen Warriors Catalog</span>
                <div className="space-y-3">
                  {summonTemplates.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        t.isUnlocked
                          ? 'border-indigo-500/30 bg-slate-950/60'
                          : 'border-white/10 bg-slate-950/30 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-200">{t.name}</span>
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                              {t.tier}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Lv. {t.level}</span>
                          </div>
                          <p className="text-xs text-slate-300">Special: {t.specialAbility}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
                            <span className="text-emerald-300">❤️ HP: {t.baseHp}</span>
                            <span className="text-rose-300">⚔️ ATK: {t.baseAttack}</span>
                            <span className="text-cyan-300">🛡️ DEF: {t.baseDefense}</span>
                            <span className="text-indigo-300">⚡ Cost: {t.manaCost} SP</span>
                            <span className="text-amber-300">⏳ Duration: {t.duration}s</span>
                          </div>
                        </div>

                        {/* Summon Buttons */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          {t.isUnlocked ? (
                            <>
                              <button
                                type="button"
                                disabled={activeSummons.length >= maxCapacity || playerStamina < t.manaCost}
                                onClick={() => {
                                  soundManager.playSpellCast();
                                  onSummonWarrior(t.id);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  activeSummons.length < maxCapacity && playerStamina >= t.manaCost
                                    ? 'border border-indigo-400 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 active:scale-95'
                                    : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                Summon ({t.manaCost} SP)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  soundManager.playLevelUp();
                                  onUpgradeSummon(t.id);
                                }}
                                className="px-3 py-1 rounded-lg border border-amber-400/40 bg-amber-500/10 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95"
                              >
                                Upgrade Warrior
                              </button>
                            </>
                          ) : (
                            <div className="text-[10px] text-amber-400 italic">
                              🔒 Defeat enemy to unlock summon
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-5 py-3 text-xs">
          <div className="text-[11px] text-slate-400 font-mono">
            Powers & Summons scale with Hero Level & Experience
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-cyan-400 active:scale-95"
          >
            Close Powers
          </button>
        </div>
      </div>
    </div>
  );
};
