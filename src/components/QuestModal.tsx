import React from 'react';
import { Quest } from '../game/types';
import { X, Scroll, Award, CheckCircle2, Circle } from 'lucide-react';
import { soundManager } from '../game/audio';

interface QuestModalProps {
  quests: Quest[];
  onTurnInQuest: (questId: string) => void;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  quests,
  onTurnInQuest,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm select-none safe-pad-left safe-pad-right">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-amber-500/40 bg-slate-950/95 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Scroll className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200">
                Village Quest Journal
              </h2>
              <p className="text-xs text-slate-400">Aid the villagers of Oakhaven to earn Gold & EXP</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[420px]">
          {quests.map((q) => {
            const isCompleted = q.status === 'completed';
            const allObjectivesMet = q.objectives.every((o) => o.current >= o.required);

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/20 opacity-80'
                    : allObjectivesMet
                    ? 'border-amber-400/60 bg-amber-950/30 shadow-lg shadow-amber-950/40'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-amber-200">{q.title}</h4>
                      <span className="text-[10px] text-slate-400">· {q.giver}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{q.description}</p>
                  </div>

                  {isCompleted && (
                    <span className="shrink-0 flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>

                {/* Objectives */}
                <div className="mt-3 space-y-1.5 border-t border-white/5 pt-2.5">
                  {q.objectives.map((obj) => (
                    <div key={obj.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        {obj.isDone || isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        )}
                        <span>{obj.description}</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-amber-300 ml-2">
                        {isCompleted ? obj.required : obj.current} / {obj.required}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rewards & Turn In */}
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Reward:</span>
                    <span className="font-bold text-amber-300 font-mono">+{q.reward.gold} Gold</span>
                    <span>·</span>
                    <span className="font-bold text-cyan-300 font-mono">+{q.reward.exp} EXP</span>
                    {q.reward.itemReward && (
                      <>
                        <span>·</span>
                        <span className="text-slate-200 font-semibold">{q.reward.itemReward.name}</span>
                      </>
                    )}
                  </div>

                  {!isCompleted && (
                    <button
                      type="button"
                      disabled={!allObjectivesMet}
                      onClick={() => {
                        soundManager.playClick();
                        onTurnInQuest(q.id);
                      }}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        allObjectivesMet
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-950/60'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {allObjectivesMet ? 'Turn In Quest' : 'In Progress'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
