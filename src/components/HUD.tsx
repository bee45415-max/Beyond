import React from 'react';
import { PlayerState, NPC, InteractiveProp, CaptainBossState, InteractiveTarget } from '../game/types';
import { Minimap } from './Minimap';
import { Settings, Maximize, Minimize, Swords, Package, Scroll, Coins, Sun, Moon, Sunset, Crown, Sparkles, Zap, Compass } from 'lucide-react';
import playerPortraitImg from '../assets/images/rpg_player_portrait_1791309080713.jpg';

interface HUDProps {
  player: PlayerState;
  npcs: NPC[];
  props: InteractiveProp[];
  onOpenSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  hoveredInteractive: InteractiveTarget | null;
  notificationText: string | null;
  boss?: CaptainBossState | null;
  isDuelActive?: boolean;
  onOpenInventory?: () => void;
  onOpenQuestLog?: () => void;
  onOpenKingAudience?: () => void;
  onOpenCompanion?: () => void;
  onOpenPowers?: () => void;
  onOpenWorldPortals?: () => void;
  gameTimeInfo?: { timeString: string; phase: 'morning' | 'noon' | 'sunset' | 'night' };
}

export const HUD: React.FC<HUDProps> = ({
  player,
  npcs,
  props,
  onOpenSettings,
  isFullscreen,
  onToggleFullscreen,
  hoveredInteractive,
  notificationText,
  boss,
  isDuelActive,
  onOpenInventory,
  onOpenQuestLog,
  onOpenKingAudience,
  onOpenCompanion,
  onOpenPowers,
  onOpenWorldPortals,
  gameTimeInfo,
}) => {
  const { stats } = player;
  const hpRatio = Math.max(0, Math.min(1, stats.hp / stats.maxHp));
  const staminaRatio = Math.max(0, Math.min(1, stats.stamina / stats.maxStamina));
  const expRatio = Math.max(0, Math.min(1, stats.exp / stats.maxExp));

  const activeQuestsCount = player.quests.filter((q) => q.status === 'active' || q.status === 'available').length;
  const readyQuestsCount = player.quests.filter((q) => q.status === 'active' && q.objectives.every(o => o.current >= o.required)).length;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Top Bar HUD inside notch Safe Areas */}
      <div className="flex w-full items-start justify-between safe-pad-top safe-pad-left safe-pad-right">
        {/* Top-Left: Player Stats Panel */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/75 p-2 shadow-2xl backdrop-blur-md">
          {/* Portrait with Level badge */}
          <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-amber-400/40 bg-slate-800 shadow-md">
            <img
              src={playerPortraitImg}
              alt="Kaelen Avatar"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Level Tag */}
            <div className="absolute bottom-0 right-0 rounded-tl-md bg-amber-500 px-1 py-0.2 text-[9px] font-black leading-tight text-slate-950 shadow">
              Lv.{stats.level}
            </div>
          </div>

          {/* Name & Vital Bars */}
          <div className="flex min-w-[130px] sm:min-w-[160px] flex-col gap-1.5 pr-1">
            <div className="flex items-center justify-between text-xs font-semibold leading-none">
              <span className="font-serif tracking-wider text-amber-200">{stats.name}</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-300">
                <Coins className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="tabular-nums">{player.gold}g</span>
              </div>
            </div>

            {/* HP Bar */}
            <div className="relative flex flex-col">
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-red-500/30 bg-slate-900/90">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-200"
                  style={{ width: `${hpRatio * 100}%` }}
                />
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[9px] font-medium leading-none text-red-200">
                <span>HP</span>
                <span className="tabular-nums font-mono">
                  {Math.round(stats.hp)} / {stats.maxHp}
                </span>
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="relative flex flex-col">
              <div className="h-1.5 w-full overflow-hidden rounded-full border border-emerald-500/30 bg-slate-900/90">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-150"
                  style={{ width: `${staminaRatio * 100}%` }}
                />
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[8px] font-medium leading-none text-emerald-300">
                <span>SP</span>
                <span className="tabular-nums font-mono">
                  {Math.round(stats.stamina)} / {stats.maxStamina}
                </span>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="relative flex flex-col">
              <div className="h-1 w-full overflow-hidden rounded-full border border-cyan-500/30 bg-slate-900/90">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-300"
                  style={{ width: `${expRatio * 100}%` }}
                />
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[8px] font-medium leading-none text-cyan-300">
                <span>EXP</span>
                <span className="tabular-nums font-mono">
                  {stats.exp} / {stats.maxExp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Minimap & Quick Actions */}
        <div className="pointer-events-auto flex items-start gap-2">
          {/* Day / Night clock badge */}
          {gameTimeInfo && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-md shadow">
              {gameTimeInfo.phase === 'night' ? (
                <Moon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              ) : gameTimeInfo.phase === 'sunset' ? (
                <Sunset className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              )}
              <span className="font-mono tabular-nums">{gameTimeInfo.timeString}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 capitalize">{gameTimeInfo.phase}</span>
            </div>
          )}

          {/* Minimap */}
          <Minimap player={player} npcs={npcs} props={props} />

          {/* Action icon buttons cluster */}
          <div className="flex flex-col gap-1.5">
            {/* King / Living Kingdom Audience button */}
            {onOpenKingAudience && (
              <button
                type="button"
                onClick={onOpenKingAudience}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/50 bg-slate-950/80 text-amber-300 shadow backdrop-blur-md transition-all hover:bg-amber-500/20 active:scale-95"
                aria-label="King & Kingdom (K)"
                title="King Alden IV & Living Kingdom"
              >
                <Crown className="h-4 w-4" />
              </button>
            )}

            {/* Magical Cat Companion button */}
            {onOpenCompanion && (
              <button
                type="button"
                onClick={onOpenCompanion}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-pink-400/50 bg-slate-950/80 text-pink-300 shadow backdrop-blur-md transition-all hover:bg-pink-500/20 active:scale-95"
                aria-label="Companion (C)"
                title="Starlight · Magical Cat Companion"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}

            {/* Character Powers & Summons button */}
            {onOpenPowers && (
              <button
                type="button"
                onClick={onOpenPowers}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/50 bg-slate-950/80 text-cyan-300 shadow backdrop-blur-md transition-all hover:bg-cyan-500/20 active:scale-95"
                aria-label="Powers & Summons (P)"
                title="Arcane Powers & Summon Warriors"
              >
                <Zap className="h-4 w-4" />
              </button>
            )}

            {/* Worlds & Magical Portals button */}
            {onOpenWorldPortals && (
              <button
                type="button"
                onClick={onOpenWorldPortals}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/50 bg-slate-950/80 text-indigo-300 shadow backdrop-blur-md transition-all hover:bg-indigo-500/20 active:scale-95"
                aria-label="Worlds & Portals (M)"
                title="Magical Portals & Worlds Map"
              >
                <Compass className="h-4 w-4" />
              </button>
            )}

            {/* Inventory / Backpack button */}
            {onOpenInventory && (
              <button
                type="button"
                onClick={onOpenInventory}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/40 bg-slate-950/80 text-amber-200 shadow backdrop-blur-md transition-all hover:bg-amber-500/20 active:scale-95"
                aria-label="Inventory (I / B)"
                title="Inventory & Gear"
              >
                <Package className="h-4 w-4" />
                {player.inventory.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold text-slate-950">
                    {player.inventory.length}
                  </span>
                )}
              </button>
            )}

            {/* Quests button */}
            {onOpenQuestLog && (
              <button
                type="button"
                onClick={onOpenQuestLog}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-slate-950/80 text-cyan-200 shadow backdrop-blur-md transition-all hover:bg-cyan-500/20 active:scale-95"
                aria-label="Quests (Q)"
                title="Quest Journal"
              >
                <Scroll className="h-4 w-4" />
                {readyQuestsCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-extrabold text-slate-950 animate-pulse">
                    !
                  </span>
                ) : activeQuestsCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-extrabold text-slate-950">
                    {activeQuestsCount}
                  </span>
                ) : null}
              </button>
            )}

            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-slate-950/75 text-slate-300 shadow backdrop-blur-md transition-colors hover:text-white active:scale-95"
              aria-label="Toggle Fullscreen"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-slate-950/75 text-slate-300 shadow backdrop-blur-md transition-colors hover:text-white active:scale-95"
              aria-label="Settings (Esc)"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Center: Guard Captain Roderick Boss Health Bar */}
      {isDuelActive && boss && boss.isActive && (
        <div className="pointer-events-none fixed top-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm sm:max-w-md px-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col rounded-xl border border-rose-500/60 bg-slate-950/92 px-4 py-2 shadow-2xl backdrop-blur-md">
            <div className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-rose-300">
                <Swords className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="font-serif tracking-wide truncate">{boss.name}</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono tabular-nums shrink-0 ml-2">
                {Math.round(boss.hp)} / {boss.maxHp} HP
              </span>
            </div>

            {/* Boss Health Bar */}
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border border-rose-400/40 bg-slate-900/90 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(1, boss.hp / boss.maxHp)) * 100}%` }}
              />
            </div>

            <div className="mt-0.5 flex w-full items-center justify-between text-[8px] text-slate-400">
              <span className="truncate">{boss.title}</span>
              <span className="text-amber-400 font-semibold uppercase tracking-wider shrink-0 ml-1">
                {boss.state === 'windup'
                  ? '⚡ CHARGING HEAVY CLEAVE'
                  : boss.state === 'attack'
                  ? '⚔ CLEAVE STRIKE'
                  : boss.state === 'defeated'
                  ? '🏆 TRIAL COMPLETE'
                  : 'MINE ENTRANCE TRIAL'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Banner */}
      {notificationText && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 transition-all">
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-slate-950/90 px-4 py-2 text-xs font-medium text-amber-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{notificationText}</span>
          </div>
        </div>
      )}

      {/* Contextual Proximity Hint at Bottom Center */}
      {hoveredInteractive && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/50 bg-slate-950/85 px-4 py-1.5 text-xs text-white shadow-xl backdrop-blur-md">
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
              E / TAP
            </span>
            <span>
              Interact with{' '}
              <strong className="text-cyan-200">
                {'isSovereign' in hoveredInteractive
                  ? '👑 King Alden IV (Royal Audience)'
                  : 'isMagicalCat' in hoveredInteractive
                  ? '🐱 Starlight (Celestial Familiar)'
                  : 'profession' in hoveredInteractive
                  ? `🧑 ${hoveredInteractive.name} (${(hoveredInteractive as any).profession})`
                  : 'targetZone' in hoveredInteractive
                  ? `🌀 ${hoveredInteractive.name} (Magical Portal)`
                  : 'species' in hoveredInteractive
                  ? `🐾 ${hoveredInteractive.name} (Animal Trust)`
                  : 'speedBonus' in hoveredInteractive
                  ? `🐎 ${hoveredInteractive.name} (Mount)`
                  : 'name' in hoveredInteractive
                  ? hoveredInteractive.name
                  : 'cropType' in hoveredInteractive
                  ? `Ripe ${hoveredInteractive.cropType.charAt(0).toUpperCase() + hoveredInteractive.cropType.slice(1)} Crop`
                  : 'Object'}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
