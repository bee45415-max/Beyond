import React from 'react';
import { Scroll, X } from 'lucide-react';

interface SignpostModalProps {
  text: string;
  onClose: () => void;
}

export const SignpostModal: React.FC<SignpostModalProps> = ({ text, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/50 bg-stone-900/95 p-6 shadow-2xl text-stone-100">
        <div className="flex items-center justify-between border-b border-stone-700 pb-3">
          <div className="flex items-center gap-2">
            <Scroll className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold tracking-wide text-amber-200">
              Notice / Inscription
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 rounded-lg border border-amber-900/40 bg-stone-950/70 p-4 font-serif text-sm leading-relaxed text-amber-100/90 sm:text-base">
          {text}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-500 active:scale-95"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
