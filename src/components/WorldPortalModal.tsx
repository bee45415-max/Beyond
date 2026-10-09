import React from 'react';
import { Portal, WorldZone } from '../game/types';
import { WORLD_DIMENSIONS } from '../game/stage3_data';
import { Compass, Sparkles, MapPin, ArrowRight, Lock, X, Globe, Mountain, Cpu, Wand2 } from 'lucide-react';
import { soundManager } from '../game/audio';

interface WorldPortalModalProps {
  portals: Portal[];
  currentZone: WorldZone;
  onWarpToPortal: (portalId: string) => void;
  onClose: () => void;
}

export const WorldPortalModal: React.FC<WorldPortalModalProps> = ({
  portals,
  currentZone,
  onWarpToPortal,
  onClose,
}) => {
  const worlds: { zone: WorldZone; icon: any; color: string; desc: string; danger: string }[] = [
    {
      zone: 'overworld',
      icon: Mountain,
      color: '#84cc16',
      desc: 'The Sovereign Living Kingdom of Oakhaven. Fertile farms, village workshops, royal castle keep.',
      danger: 'Peaceful / Moderate',
    },
    {
      zone: 'modern_city',
      icon: Cpu,
      color: '#06b6d4',
      desc: 'Neo-Veridia Tech Metropolis. Towering neon skyscrapers, hover-vehicles, advanced robotics.',
      danger: 'High Security Tech Zone',
    },
    {
      zone: 'magic_realm',
      icon: Wand2,
      color: '#a855f7',
      desc: 'Aetheria High Arcane Realm. Floating islands, mana waterfalls, ancient spellweavers.',
      danger: 'Arcane Anomalies / Elite',
    },
    {
      zone: 'ancient_ruins',
      icon: Globe,
      color: '#f59e0b',
      desc: 'Precursor Nexus. Mysterious stone monoliths, dormant titan automatons, cosmic relics.',
      danger: 'Extreme Danger / Bosses',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-indigo-500/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-indigo-200 tracking-wide">Magical Portals & Worlds</h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-400/30">
                  Exploration Network
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Cross-Dimensional Gateway Translocation</p>
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
          {/* Worlds Overview Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200">Connected Realms of Alden</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {worlds.map((w) => {
                const Icon = w.icon;
                const info = WORLD_DIMENSIONS[w.zone];
                const isCurrent = currentZone === w.zone;

                return (
                  <div
                    key={w.zone}
                    className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                      isCurrent
                        ? 'border-indigo-400/60 bg-indigo-500/10 shadow'
                        : 'border-white/10 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg border"
                          style={{ borderColor: w.color, backgroundColor: `${w.color}20`, color: w.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{info?.name || w.zone}</div>
                          <div className="text-[10px] font-mono text-slate-400">{info?.climate}</div>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-400/30">
                          Current Location
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{w.desc}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400">
                      <span>Threat: {w.danger}</span>
                      <span>Civilization: {info?.civilization}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portals List */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-200">Discovered Magical Portals</span>
            <div className="space-y-2.5">
              {portals.map((p) => {
                const targetInfo = WORLD_DIMENSIONS[p.targetZone];
                const sourceInfo = WORLD_DIMENSIONS[p.sourceZone];

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      p.discovered
                        ? 'border-indigo-500/30 bg-slate-950/60'
                        : 'border-white/10 bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" style={{ color: p.color }} />
                        <span className="text-xs font-bold text-slate-200">{p.name}</span>
                        {p.discovered ? (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300 border border-emerald-400/30">
                            Mapped
                          </span>
                        ) : (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-mono text-rose-300 border border-rose-400/30">
                            Undiscovered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{sourceInfo?.name}</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="font-bold text-indigo-200">{targetInfo?.name}</span>
                      </div>
                      {p.isLocked && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Lock className="h-3 w-3" />
                          <span>{p.unlockRequirement || 'Locked by arcane seal'}</span>
                        </div>
                      )}
                    </div>

                    {/* Warp Button */}
                    <button
                      type="button"
                      disabled={!p.discovered || p.isLocked}
                      onClick={() => {
                        soundManager.playLevelUp();
                        onWarpToPortal(p.id);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                        p.discovered && !p.isLocked
                          ? 'border border-indigo-400 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110 active:scale-95 shadow'
                          : 'border border-white/10 bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Step Through Portal</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/70 px-5 py-3 text-xs">
          <div className="text-[11px] text-slate-400 font-mono">
            Explore deep forests, caves, and ruins to uncover rare portals
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 font-bold text-white hover:bg-indigo-400 active:scale-95"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
