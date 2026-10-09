import React from 'react';
import { KingdomVillager } from '../game/types';
import { Briefcase, Home, Clock, Smile, Wheat, Gift, MessageSquare, ShoppingBag, X } from 'lucide-react';
import { soundManager } from '../game/audio';

interface VillagerModalProps {
  villager: KingdomVillager;
  playerGold: number;
  onTrade: () => void;
  onGiftRation: () => void;
  onClose: () => void;
}

export const VillagerModal: React.FC<VillagerModalProps> = ({
  villager,
  playerGold,
  onTrade,
  onGiftRation,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl border border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400 bg-amber-500/20 text-amber-300 shadow">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-amber-200 tracking-wide">{villager.name}</h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30 capitalize">
                  {villager.profession}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Resident Citizen of Oakhaven</p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Dialogue Box */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Current Words</span>
            </div>
            <p className="text-xs italic text-amber-100 font-serif leading-relaxed">
              &ldquo;{villager.dialogue}&rdquo;
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Currently performing: <strong className="text-amber-200 capitalize">{villager.currentTask}</strong>
            </div>
          </div>

          {/* Citizen Vitals & Contribution Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Smile className="h-3.5 w-3.5" />
                <span>Morale & Happiness</span>
              </div>
              <div className="text-base font-bold text-emerald-200">{villager.happiness}%</div>
              <div className="text-[10px] text-slate-400">Well-fed and content</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Wheat className="h-3.5 w-3.5" />
                <span>Daily Contribution</span>
              </div>
              <div className="text-base font-bold text-amber-200">{villager.dailyContribution}</div>
              <div className="text-[10px] text-slate-400">Yields to King&apos;s economy</div>
            </div>
          </div>

          {/* Home & Schedule Info */}
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Home className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Home: <strong className="text-slate-100">{villager.home}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Briefcase className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Workplace: <strong className="text-slate-100">{villager.workplace}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Daily Routine: <strong className="text-slate-100">{villager.schedule}</strong></span>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playCoinSound();
                onTrade();
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold active:scale-95 transition-all shadow"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Trade & Purchase Goods</span>
            </button>

            <button
              type="button"
              disabled={playerGold < 10}
              onClick={() => {
                soundManager.playHarvest();
                onGiftRation();
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                playerGold >= 10
                  ? 'border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 active:scale-95 shadow'
                  : 'border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Gift className="h-4 w-4" />
              <span>Gift Rations (+Happiness)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-5 py-3 text-xs">
          <div className="text-[11px] text-slate-400 font-mono">
            Every profession contributes to Oakhaven&apos;s living economy
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="rounded-lg bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 active:scale-95"
          >
            Goodbye
          </button>
        </div>
      </div>
    </div>
  );
};
