import React from 'react';
import { NPC } from '../game/types';
import { MessageSquare, ArrowRight, X, Swords, ShoppingBag, Hammer, Scroll, Briefcase } from 'lucide-react';
import { soundManager } from '../game/audio';

interface DialogueModalProps {
  npc: NPC;
  onClose: () => void;
  onStartDuel?: () => void;
  onOpenShop?: (npc: NPC) => void;
  onOpenQuests?: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  onClose,
  onStartDuel,
  onOpenShop,
  onOpenQuests,
}) => {
  const [lineIndex, setLineIndex] = React.useState(0);

  const handleNext = () => {
    soundManager.playClick();
    if (lineIndex < npc.dialogue.length - 1) {
      setLineIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const currentText = npc.dialogue[lineIndex] || '';
  const isLastLine = lineIndex >= npc.dialogue.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 safe-pad-bottom safe-pad-left safe-pad-right select-none bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-400/40 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-lg">
        {/* Header with NPC Badge and Job/Activity info */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 shadow-lg text-white"
              style={{ backgroundColor: npc.avatarColor }}
            >
              {npc.canDuel ? (
                <Swords className="h-6 w-6 text-amber-200" />
              ) : npc.isBlacksmith ? (
                <Hammer className="h-6 w-6 text-amber-200" />
              ) : npc.isMerchant ? (
                <ShoppingBag className="h-6 w-6 text-amber-200" />
              ) : (
                <MessageSquare className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200">
                  {npc.name}
                </h3>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                  {npc.job || npc.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <Briefcase className="h-3 w-3 text-slate-400" />
                  {npc.dailyActivity || npc.role}
                </span>
                {npc.personality && (
                  <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                    · {npc.personality}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close conversation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dialogue Body */}
        <div className="my-4 min-h-[64px] text-sm leading-relaxed text-slate-200 sm:text-base bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
          “{currentText}”
        </div>

        {/* Footer with Dialogue Progression, Shop/Forge, Quest, & Duel Triggers */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {lineIndex + 1} / {npc.dialogue.length}
            </span>

            {/* Merchant / Blacksmith Quick Action Button */}
            {(npc.isMerchant || npc.isBlacksmith) && onOpenShop && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onOpenShop(npc);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-500/20 px-3 py-1.5 font-bold text-amber-200 hover:bg-amber-500/30 active:scale-95 transition-all shadow"
              >
                {npc.isBlacksmith ? (
                  <>
                    <Hammer className="h-3.5 w-3.5 text-amber-300" />
                    <span>Open Forge & Smithy</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-300" />
                    <span>Trade & Market Stall</span>
                  </>
                )}
              </button>
            )}

            {/* Quest Giver button */}
            {npc.questId && onOpenQuests && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onOpenQuests();
                }}
                className="flex items-center gap-1 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1.5 font-bold text-cyan-200 hover:bg-cyan-500/30 active:scale-95 transition-all shadow"
              >
                <Scroll className="h-3.5 w-3.5" />
                <span>View Quests</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {npc.canDuel && onStartDuel && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onStartDuel();
                }}
                className="flex items-center gap-2 rounded-xl border border-rose-400/80 bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2 font-bold text-white shadow-lg shadow-red-950/60 hover:brightness-110 active:scale-95"
              >
                <Swords className="h-4 w-4" />
                <span>Accept Combat Duel</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2 font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 active:scale-95"
            >
              <span>{isLastLine ? 'Step Back' : 'Continue'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
