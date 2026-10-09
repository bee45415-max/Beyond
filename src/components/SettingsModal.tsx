import React from 'react';
import { GameSettings } from '../game/types';
import { soundManager } from '../game/audio';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  Save,
  Home,
  X,
  Keyboard,
  Maximize,
  Minimize,
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onSaveGame: () => void;
  onReturnToMenu: () => void;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onSaveGame,
  onReturnToMenu,
  onClose,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none safe-pad-left safe-pad-right">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/20 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wider text-amber-200">
              Game Settings & System
            </h2>
            <p className="text-xs text-slate-400">Stage 1: Frontier Realm Engine</p>
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

        <div className="space-y-5 py-4">
          {/* Audio Controls */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-amber-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-slate-500" />
                )}
                <div>
                  <span className="text-sm font-semibold">Sound FX & Audio</span>
                  <p className="text-[11px] text-slate-400">Combat hits, footsteps, voice chimes</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !settings.soundEnabled;
                  onUpdateSettings({ soundEnabled: next });
                  soundManager.setMuted(!next);
                  if (next) soundManager.playClick();
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  settings.soundEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {settings.soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-slate-400">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    onUpdateSettings({ volume: vol });
                    soundManager.setVolume(vol);
                  }}
                  className="h-1.5 w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="w-8 text-right font-mono text-xs text-slate-300">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Virtual Touch Controls */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-5 w-5 text-sky-400" />
                <div>
                  <span className="text-sm font-semibold">Virtual On-Screen Controls</span>
                  <p className="text-[11px] text-slate-400">Joystick & Action buttons for mobile landscape</p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['auto', 'always', 'hidden'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ virtualControls: mode });
                    soundManager.playClick();
                  }}
                  className={`rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                    settings.virtualControls === mode
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                      : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Smoothness */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="h-5 w-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-semibold">Camera Tracking Mode</span>
                  <p className="text-[11px] text-slate-400">Expandable 2D tracking system</p>
                </div>
              </div>

              <div className="flex gap-2">
                {(['smooth', 'snappy'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ cameraSmoothness: mode });
                      soundManager.playClick();
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      settings.cameraSmoothness === mode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Cheatsheet */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Keyboard className="h-4 w-4" />
              <span>Control Scheme</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5 rounded-lg bg-black/30 p-2.5">
                <div className="font-semibold text-amber-200">PC Browser:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Movement:</span>
                  <span className="font-mono text-white">WASD / Arrows</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Jump:</span>
                  <span className="font-mono text-white">Space</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Attack / Strike:</span>
                  <span className="font-mono text-white">J / Left Click</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Interact:</span>
                  <span className="font-mono text-white">E</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sprint:</span>
                  <span className="font-mono text-white">Left Shift</span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg bg-black/30 p-2.5">
                <div className="font-semibold text-sky-200">Android / Mobile:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Movement:</span>
                  <span className="text-white">Virtual Thumb Joystick</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Jump:</span>
                  <span className="text-white">Blue [Jump] Button</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Attack Combo:</span>
                  <span className="text-white">Red [Strike] Button</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Interact:</span>
                  <span className="text-white">Gold [Interact] Button</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4" />
                  <span>Enter Fullscreen</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onSaveGame();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Save Progress</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onReturnToMenu();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Main Menu</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95"
            >
              Resume Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
