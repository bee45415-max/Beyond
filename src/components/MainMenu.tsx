import React, { useState } from 'react';
import titleBgImg from '../assets/images/rpg_title_bg_1791309069010.jpg';
import { Play, RotateCcw, Settings, ShieldAlert, Sparkles } from 'lucide-react';
import { soundManager } from '../game/audio';

interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => boolean;
  onOpenSettings: () => void;
  hasSave: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
  hasSave,
}) => {
  const [continueError, setContinueError] = useState<string | null>(null);

  const handleContinue = () => {
    soundManager.playClick();
    const success = onContinueGame();
    if (!success) {
      setContinueError('No saved adventure found. Start a New Game to begin Stage 1!');
      setTimeout(() => setContinueError(null), 4000);
    }
  };

  const handleNewGame = () => {
    soundManager.playClick();
    onStartNewGame();
  };

  const handleSettings = () => {
    soundManager.playClick();
    onOpenSettings();
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-slate-950 font-sans">
      {/* Cinematic Background Image with rich gradient overlay */}
      <img
        src={titleBgImg}
        alt="Chronicles of Alden"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-90 contrast-105"
        referrerPolicy="no-referrer"
      />

      {/* Atmospheric overlays: vignettes and bottom fog */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/80" />

      {/* Title & Menu Container inside Safe Areas */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 safe-pad-top safe-pad-bottom safe-pad-left safe-pad-right">
        {/* Top Header info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300">
              Stage 1 Foundation · Mobile & PC
            </span>
          </div>

          <div className="text-right text-[11px] font-medium text-slate-400">
            Open-World Action RPG & Fighting Engine
          </div>
        </div>

        {/* Center / Left Title Brand */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Original 2D RPG Adventure</span>
          </div>

          <h1 className="mt-1 font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            CHRONICLES <span className="text-amber-400">OF ALDEN</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-200/90 drop-shadow">
            Explore the starting village of Oakhaven, venture into the Whispering Forest,
            and inspect the sealed mountain mine. Master combat rhythm and combos with Kaelen.
          </p>

          {/* Continue Warning message if no save file exists */}
          {continueError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/50 bg-rose-950/90 p-2.5 text-xs text-rose-200 shadow-lg animate-in fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{continueError}</span>
            </div>
          )}
        </div>

        {/* Bottom Menu Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* New Game Button */}
          <button
            type="button"
            onClick={handleNewGame}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold tracking-wider uppercase text-slate-950 shadow-xl shadow-amber-950/60 transition-all hover:brightness-110 active:scale-95"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>New Game</span>
          </button>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className={`flex items-center justify-center gap-2.5 rounded-xl border px-6 py-3.5 text-sm font-bold tracking-wider uppercase backdrop-blur-md transition-all active:scale-95 ${
              hasSave
                ? 'border-sky-400/60 bg-sky-950/70 text-sky-200 hover:bg-sky-900/80 shadow-lg shadow-sky-950/50'
                : 'border-white/15 bg-slate-900/60 text-slate-300 hover:bg-slate-850/80'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Continue</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={handleSettings}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-slate-950/60 px-5 py-3.5 text-sm font-semibold tracking-wider text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
