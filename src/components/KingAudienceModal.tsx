import React, { useState } from 'react';
import { KingState, KingdomState } from '../game/types';
import { Crown, Shield, Coins, Wheat, Users, Award, CheckCircle2, ChevronRight, Sparkles, X, HeartHandshake } from 'lucide-react';
import { soundManager } from '../game/audio';

interface KingAudienceModalProps {
  king: KingState;
  kingdom: KingdomState;
  playerGold: number;
  playerLevel: number;
  onToggleDecree: (decreeId: string) => void;
  onSetTaxPolicy: (policy: 'low' | 'moderate' | 'high') => void;
  onPromoteKnight: () => void;
  onDonateTreasury: (amount: number) => void;
  onDonateGranary: (amount: number) => void;
  onClose: () => void;
}

export const KingAudienceModal: React.FC<KingAudienceModalProps> = ({
  king,
  kingdom,
  playerGold,
  playerLevel,
  onToggleDecree,
  onSetTaxPolicy,
  onPromoteKnight,
  onDonateTreasury,
  onDonateGranary,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'decrees' | 'knighthood' | 'treasury'>('overview');

  const knightTitles = [
    { rank: 'squire', title: 'Squire of Oakhaven', minLevel: 1, bonus: '+5 HP & Village Respect' },
    { rank: 'knight', title: 'Knight of the Realm', minLevel: 3, bonus: '+15 HP, +4 ATK, Royal Salutes' },
    { rank: 'knight_captain', title: 'Knight-Captain of Oakhaven', minLevel: 6, bonus: '+35 HP, +8 ATK, Guard Command' },
    { rank: 'royal_champion', title: 'Royal Champion of the Crown', minLevel: 9, bonus: '+60 HP, +15 ATK, Kingdom Hero' },
    { rank: 'paladin_commander', title: 'Paladin Commander of Alden', minLevel: 12, bonus: '+100 HP, +25 ATK, Sovereign Ward' },
  ];

  const currentRankIdx = knightTitles.findIndex((k) => k.rank === king.knightRank);
  const nextRank = currentRankIdx < knightTitles.length - 1 ? knightTitles[currentRankIdx + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400 bg-amber-500/20 text-amber-300 shadow">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-amber-200 tracking-wide">{king.name}</h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                  Royal Audience
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-mono">{king.title}</p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Kingdom Status', icon: Crown },
            { id: 'decrees', label: 'Royal Decrees', icon: Sparkles },
            { id: 'knighthood', label: 'Knight Honors', icon: Award },
            { id: 'treasury', label: 'Treasury & Grain', icon: Coins },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Sovereign Welcome Box */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
                <p className="text-xs italic text-amber-200/90 leading-relaxed font-serif">
                  &ldquo;Welcome, Kaelen, defender of Oakhaven. Our realm flourishes through the sweat of honest
                  villagers, the strength of our walls, and the valour of our champions. Speak your counsel or inspect
                  the health of our living kingdom.&rdquo;
                </p>
                <p className="mt-2 text-[10px] font-mono text-amber-400/70 text-right">— King Alden IV</p>
              </div>

              {/* Kingdom Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-amber-500/30 bg-slate-950/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold">
                    <Coins className="h-3.5 w-3.5" /> Treasury
                  </div>
                  <div className="mt-1 text-lg font-mono font-bold text-amber-200">{king.treasury} Gold</div>
                  <div className="text-[10px] text-slate-400">+{kingdom.dailyTaxGold}g / day tax</div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-slate-950/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold">
                    <Wheat className="h-3.5 w-3.5" /> Granary
                  </div>
                  <div className="mt-1 text-lg font-mono font-bold text-emerald-200">{king.foodReserves} Bushels</div>
                  <div className="text-[10px] text-slate-400">Harvest yields plentiful</div>
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-slate-950/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-semibold">
                    <Users className="h-3.5 w-3.5" /> Population
                  </div>
                  <div className="mt-1 text-lg font-mono font-bold text-cyan-200">{kingdom.population} Citizens</div>
                  <div className="text-[10px] text-slate-400">Settlement growing</div>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-slate-950/60 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-semibold">
                    <Shield className="h-3.5 w-3.5" /> Security
                  </div>
                  <div className="mt-1 text-lg font-mono font-bold text-rose-200">{king.securityMorale}% Morale</div>
                  <div className="text-[10px] text-slate-400">Guards at high vigilance</div>
                </div>
              </div>

              {/* Tax Policy Selector */}
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Royal Tax Policy</span>
                  <span className="text-[10px] text-slate-400 font-mono">Current: {king.taxPolicy.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'moderate', 'high'] as const).map((policy) => {
                    const isSelected = king.taxPolicy === policy;
                    return (
                      <button
                        key={policy}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          onSetTaxPolicy(policy);
                        }}
                        className={`rounded-lg border p-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold shadow'
                            : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="capitalize">{policy}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {policy === 'low'
                            ? '+Happiness, +10g'
                            : policy === 'moderate'
                            ? 'Balanced, +20g'
                            : 'Maximum, +35g'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DECREES */}
          {activeTab === 'decrees' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Ratify sovereign decrees to shape the living economy, village happiness, and military defense:
              </p>
              {king.decrees.map((decree) => {
                return (
                  <div
                    key={decree.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      decree.isActive
                        ? 'border-amber-400/60 bg-amber-500/10 shadow-md'
                        : 'border-white/10 bg-slate-950/50'
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-200">{decree.name}</span>
                        {decree.isActive && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                            <CheckCircle2 className="h-3 w-3 text-amber-400" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300">{decree.description}</p>
                      <div className="text-[10px] font-mono text-emerald-400">Bonus: {decree.benefit}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onToggleDecree(decree.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
                        decree.isActive
                          ? 'border border-amber-500 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                          : 'border border-white/20 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {decree.isActive ? 'Revoke' : 'Enact'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: KNIGHTHOOD HONORS */}
          {activeTab === 'knighthood' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Current Knighthood</div>
                  <div className="text-base font-serif font-bold text-amber-200">
                    {knightTitles[currentRankIdx]?.title || 'Squire of Oakhaven'}
                  </div>
                  <div className="text-xs text-emerald-300">
                    Active Royal Blessing: {knightTitles[currentRankIdx]?.bonus}
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400 bg-amber-500/20 text-amber-300 shadow-lg">
                  <Award className="h-7 w-7" />
                </div>
              </div>

              {nextRank ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Next Knighthood Rank</div>
                      <div className="text-sm font-serif font-bold text-amber-300">{nextRank.title}</div>
                      <div className="text-[11px] text-cyan-300 mt-0.5">Benefit: {nextRank.bonus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Requirement</div>
                      <div
                        className={`text-xs font-mono font-bold ${
                          playerLevel >= nextRank.minLevel ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        Hero Lv. {nextRank.minLevel} (You: Lv. {playerLevel})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={playerLevel < nextRank.minLevel}
                    onClick={() => {
                      soundManager.playLevelUp();
                      onPromoteKnight();
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow ${
                      playerLevel >= nextRank.minLevel
                        ? 'border border-amber-400 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 hover:brightness-110 active:scale-98'
                        : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Award className="h-4 w-4" />
                    <span>Petition King Alden IV for Knight Promotion</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-center">
                  <div className="text-emerald-300 font-bold text-sm">Highest Honor Attained!</div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    You hold the supreme rank of Paladin Commander. The kingdom sings songs of your deeds!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TREASURY & GRANARY */}
          {activeTab === 'treasury' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Directly contribute to King Alden&apos;s Royal Granaries and Treasury to safeguard against famines,
                attract immigrant artisans, and expand the town:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Donate Gold */}
                <div className="rounded-xl border border-amber-500/30 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Coins className="h-4 w-4" /> Royal Treasury Endowment
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Donate 50 Gold from your personal coin purse. Funds public roads, lamps, and city walls.
                  </p>
                  <button
                    type="button"
                    disabled={playerGold < 50}
                    onClick={() => {
                      soundManager.playCoinSound();
                      onDonateTreasury(50);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      playerGold >= 50
                        ? 'border border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 active:scale-95'
                        : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Donate 50 Gold (Have: {playerGold}g)
                  </button>
                </div>

                {/* Donate Grain */}
                <div className="rounded-xl border border-emerald-500/30 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Wheat className="h-4 w-4" /> Granary Food Relief
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Provide 20 bushels of food to prevent starvation and accelerate settlement population growth.
                  </p>
                  <button
                    type="button"
                    disabled={playerGold < 25}
                    onClick={() => {
                      soundManager.playHarvest();
                      onDonateGranary(20);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      playerGold >= 25
                        ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 active:scale-95'
                        : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Provision 20 Bushels (25 Gold)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-5 py-3 text-xs">
          <div className="text-[11px] text-amber-300/80 font-mono">
            King Alden IV · Sovereign Palace · Oakhaven
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="rounded-lg bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 active:scale-95"
          >
            Leave Royal Audience
          </button>
        </div>
      </div>
    </div>
  );
};
