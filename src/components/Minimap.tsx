import React from 'react';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../game/constants';
import { PlayerState, NPC, InteractiveProp } from '../game/types';
import { Compass } from 'lucide-react';

interface MinimapProps {
  player: PlayerState;
  npcs: NPC[];
  props: InteractiveProp[];
}

export const Minimap: React.FC<MinimapProps> = ({ player, npcs, props }) => {
  // Minimap dimensions: 110x75
  const mapW = 110;
  const mapH = 75;

  // Convert world (0..3200, 0..2200) to minimap percentage
  const px = (player.x / WORLD_WIDTH) * mapW;
  const py = (player.y / WORLD_HEIGHT) * mapH;

  return (
    <div className="relative flex flex-col items-end">
      <div className="relative h-[75px] w-[110px] overflow-hidden rounded-lg border border-white/20 bg-slate-950/80 shadow-lg backdrop-blur-md">
        {/* Terrain zones representation */}
        {/* Village area */}
        <div
          className="absolute rounded bg-amber-900/40 border border-amber-700/30"
          style={{
            left: `${(750 / WORLD_WIDTH) * 100}%`,
            top: `${(650 / WORLD_HEIGHT) * 100}%`,
            width: `${(1150 / WORLD_WIDTH) * 100}%`,
            height: `${(950 / WORLD_HEIGHT) * 100}%`,
          }}
        />

        {/* Forest area */}
        <div
          className="absolute rounded bg-emerald-950/70 border border-emerald-800/30"
          style={{
            left: `${(1950 / WORLD_WIDTH) * 100}%`,
            top: `${(300 / WORLD_HEIGHT) * 100}%`,
            width: `${(1200 / WORLD_WIDTH) * 100}%`,
            height: `${(1750 / WORLD_HEIGHT) * 100}%`,
          }}
        />

        {/* Mine area */}
        <div
          className="absolute rounded bg-slate-700/50 border border-slate-500/30"
          style={{
            left: `${(1650 / WORLD_WIDTH) * 100}%`,
            top: `${(100 / WORLD_HEIGHT) * 100}%`,
            width: `${(600 / WORLD_WIDTH) * 100}%`,
            height: `${(350 / WORLD_HEIGHT) * 100}%`,
          }}
        />

        {/* Road line indicator */}
        <div
          className="absolute h-[1.5px] bg-amber-200/40"
          style={{
            left: `${(700 / WORLD_WIDTH) * 100}%`,
            top: `${(1120 / WORLD_HEIGHT) * 100}%`,
            width: `${(1400 / WORLD_WIDTH) * 100}%`,
          }}
        />

        {/* NPC markers */}
        {npcs.map((npc) => {
          const nx = (npc.x / WORLD_WIDTH) * mapW;
          const ny = (npc.y / WORLD_HEIGHT) * mapH;
          return (
            <div
              key={npc.id}
              className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 ring-1 ring-cyan-200"
              style={{ left: `${nx}px`, top: `${ny}px` }}
              title={npc.name}
            />
          );
        })}

        {/* Dummy marker */}
        {props
          .filter((p) => p.type === 'dummy')
          .map((p) => {
            const dx = (p.x / WORLD_WIDTH) * mapW;
            const dy = (p.y / WORLD_HEIGHT) * mapH;
            return (
              <div
                key={p.id}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 ring-1 ring-rose-200"
                style={{ left: `${dx}px`, top: `${dy}px` }}
                title="Training Dummy"
              />
            );
          })}

        {/* Player marker with pulse ring */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${px}px`, top: `${py}px` }}
        >
          <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] ring-2 ring-white" />
          <div className="absolute -inset-1 animate-ping rounded-full bg-amber-400 opacity-60" />
        </div>

        {/* North Indicator */}
        <div className="absolute right-1 top-1 flex items-center gap-0.5 text-[8px] font-bold text-white/50">
          <Compass className="h-2.5 w-2.5" />
          <span>N</span>
        </div>

        {/* Zone label */}
        <div className="absolute bottom-1 left-1.5 text-[8px] font-semibold tracking-wider text-white/60">
          {player.x > 1950 ? 'Forest' : player.y < 550 ? 'Mine' : 'Village'}
        </div>
      </div>
      <span className="mt-0.5 text-[8px] tracking-wide text-white/40">Radar · 3.2km²</span>
    </div>
  );
};
