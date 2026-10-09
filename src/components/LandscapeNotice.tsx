import React from 'react';
import { RotateCw, Play } from 'lucide-react';

interface LandscapeNoticeProps {
  onDismiss: () => void;
}

export const LandscapeNotice: React.FC<LandscapeNoticeProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-slate-100 backdrop-blur-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/10 text-amber-400 animate-pulse">
        <RotateCw className="h-8 w-8" />
      </div>

      <h3 className="mt-4 font-serif text-xl font-bold text-amber-200">
        Rotate Device to Landscape
      </h3>

      <p className="mt-2 max-w-xs text-xs sm:text-sm leading-relaxed text-slate-400">
        Stage 1 of Chronicles of Alden is designed for landscape mobile action gameplay.
        Rotate your phone horizontally for optimal controls and wide-world view.
      </p>

      <button
        type="button"
        onClick={onDismiss}
        className="mt-6 flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-200 active:scale-95"
      >
        <Play className="h-3.5 w-3.5" />
        <span>Continue Anyway</span>
      </button>
    </div>
  );
};
