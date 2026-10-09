import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronUp, Zap, MessageSquare, Package, Scroll } from 'lucide-react';

interface VirtualControlsProps {
  onMoveChange: (x: number, y: number) => void;
  onJump: () => void;
  onAttack: () => void;
  onInteract: () => void;
  canInteract: boolean;
  interactLabel?: string;
  onOpenInventory?: () => void;
  onOpenQuests?: () => void;
  inventoryCount?: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveChange,
  onJump,
  onAttack,
  onInteract,
  canInteract,
  interactLabel = 'Interact',
  onOpenInventory,
  onOpenQuests,
  inventoryCount = 0,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeTouchId, setActiveTouchId] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const maxRadius = rect.width / 2 - 12;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });
    setActiveTouchId(e.pointerId);

    const normX = knobX / maxRadius;
    const normY = knobY / maxRadius;
    onMoveChange(normX, normY);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (activeTouchId === null || e.pointerId !== activeTouchId) return;
      if (!joystickBaseRef.current) return;

      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const maxRadius = rect.width / 2 - 12;
      const dist = Math.hypot(dx, dy);

      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      // Apply deadzone threshold
      const ratio = clampedDist / maxRadius;
      if (ratio < 0.15) {
        onMoveChange(0, 0);
      } else {
        const normX = Math.cos(angle) * ratio;
        const normY = Math.sin(angle) * ratio;
        onMoveChange(normX, normY);
      }
    },
    [activeTouchId, onMoveChange]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (e.pointerId === activeTouchId) {
        setActiveTouchId(null);
        setKnobPos({ x: 0, y: 0 });
        onMoveChange(0, 0);
      }
    },
    [activeTouchId, onMoveChange]
  );

  useEffect(() => {
    if (activeTouchId !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [activeTouchId, handlePointerMove, handlePointerUp]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex select-none items-end justify-between p-4 safe-pad-left safe-pad-right safe-pad-bottom">
      {/* Left Joystick Area */}
      <div className="pointer-events-auto flex items-end pb-2">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-slate-950/40 shadow-2xl backdrop-blur-md active:border-cyan-400/50"
          style={{ touchAction: 'none' }}
        >
          {/* Inner D-pad directional guides */}
          <div className="pointer-events-none absolute h-24 w-24 rounded-full border border-dashed border-white/10" />
          <div className="pointer-events-none absolute top-2 text-[9px] font-bold text-white/40">▲</div>
          <div className="pointer-events-none absolute bottom-2 text-[9px] font-bold text-white/40">▼</div>
          <div className="pointer-events-none absolute left-2 text-[9px] font-bold text-white/40">◀</div>
          <div className="pointer-events-none absolute right-2 text-[9px] font-bold text-white/40">▶</div>

          {/* Floating Joystick Thumb Knob */}
          <div
            className="pointer-events-none flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-b from-slate-700/90 to-slate-900/90 shadow-lg shadow-black/60 transition-transform duration-75"
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          >
            <div className="h-4 w-4 rounded-full bg-cyan-400/70" />
          </div>
        </div>
      </div>

      {/* Right Mobile Action Cluster */}
      <div className="pointer-events-auto flex items-end gap-2.5 pb-2">
        {/* Quick Mobile Bag & Quest Buttons Column */}
        {(onOpenInventory || onOpenQuests) && (
          <div className="flex flex-col gap-2 mb-1">
            {onOpenInventory && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onOpenInventory();
                }}
                className="relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl border border-amber-400/40 bg-slate-950/80 text-amber-200 shadow-lg backdrop-blur-md transition-all active:scale-95"
                style={{ touchAction: 'none' }}
                aria-label="Backpack"
              >
                <Package className="h-5 w-5" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-amber-300">Bag</span>
                {inventoryCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-slate-950">
                    {inventoryCount}
                  </span>
                )}
              </button>
            )}

            {onOpenQuests && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onOpenQuests();
                }}
                className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl border border-cyan-400/40 bg-slate-950/80 text-cyan-200 shadow-lg backdrop-blur-md transition-all active:scale-95"
                style={{ touchAction: 'none' }}
                aria-label="Quests"
              >
                <Scroll className="h-5 w-5" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-300">Quest</span>
              </button>
            )}
          </div>
        )}

        {/* Interaction Button (conditionally highlighted when near NPC/Chest) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onInteract();
          }}
          className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-95 ${
            canInteract
              ? 'border-amber-400/80 bg-gradient-to-b from-amber-600/80 to-amber-900/90 text-amber-100 shadow-lg shadow-amber-900/50 ring-2 ring-amber-400/30'
              : 'border-white/15 bg-slate-900/60 text-slate-400 shadow-md'
          }`}
          style={{ touchAction: 'none' }}
          aria-label={interactLabel}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider">
            {interactLabel}
          </span>
        </button>

        {/* Jump Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-sky-400/40 bg-gradient-to-b from-sky-600/80 to-sky-900/90 text-sky-100 shadow-lg shadow-sky-950/60 backdrop-blur-md transition-all active:scale-95 active:brightness-125"
          style={{ touchAction: 'none' }}
          aria-label="Jump"
        >
          <ChevronUp className="h-6 w-6 stroke-[3]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Jump</span>
        </button>

        {/* Strike / Attack Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onAttack();
          }}
          className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-rose-400/80 bg-gradient-to-b from-rose-600/90 to-red-950/95 text-white shadow-xl shadow-red-950/80 backdrop-blur-md transition-all active:scale-90 active:brightness-125"
          style={{ touchAction: 'none' }}
          aria-label="Attack"
        >
          <Zap className="h-7 w-7 fill-white stroke-rose-200" />
          <span className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider">
            Strike
          </span>
        </button>
      </div>
    </div>
  );
};
