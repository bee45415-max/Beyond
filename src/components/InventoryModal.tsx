import React, { useState } from 'react';
import { PlayerState, Item, InventoryItem } from '../game/types';
import { X, Shield, Swords, Sparkles, Coins, Package } from 'lucide-react';
import { soundManager } from '../game/audio';

interface InventoryModalProps {
  player: PlayerState;
  onUseItem: (item: Item) => void;
  onUnequip: (slot: 'weapon' | 'shield' | 'armor') => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  player,
  onUseItem,
  onUnequip,
  onClose,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<InventoryItem | null>(
    player.inventory[0] || null
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm select-none safe-pad-left safe-pad-right">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-amber-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200">
                Adventurer's Inventory & Gear
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold tabular-nums">{player.gold} Gold</span>
              </div>
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

        {/* Content Body: Split into Equipped Gear & Bag Grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto p-4 gap-4">
          {/* Left Column: Equipped Gear & Stats */}
          <div className="flex flex-col gap-3 md:w-56 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Equipped Equipment
            </h3>

            {/* Weapon Slot */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Swords className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Weapon</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {player.equipped.weapon ? player.equipped.weapon.name : 'Unarmed'}
                  </div>
                </div>
              </div>
              {player.equipped.weapon && (
                <button
                  type="button"
                  onClick={() => onUnequip('weapon')}
                  className="rounded px-2 py-1 text-[10px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30"
                >
                  Unequip
                </button>
              )}
            </div>

            {/* Shield Slot */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Shield</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {player.equipped.shield ? player.equipped.shield.name : 'None'}
                  </div>
                </div>
              </div>
              {player.equipped.shield && (
                <button
                  type="button"
                  onClick={() => onUnequip('shield')}
                  className="rounded px-2 py-1 text-[10px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30"
                >
                  Unequip
                </button>
              )}
            </div>

            {/* Armor Slot */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Armor</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {player.equipped.armor ? player.equipped.armor.name : 'Cloth Tunic'}
                  </div>
                </div>
              </div>
              {player.equipped.armor && (
                <button
                  type="button"
                  onClick={() => onUnequip('armor')}
                  className="rounded px-2 py-1 text-[10px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30"
                >
                  Unequip
                </button>
              )}
            </div>

            {/* Total Combat Attributes */}
            <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Attack Power:</span>
                <span className="font-bold text-rose-300">{player.stats.attackPower}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Defense:</span>
                <span className="font-bold text-sky-300">{player.stats.defense}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Max Vitality:</span>
                <span className="font-bold text-emerald-300">{player.stats.maxHp} HP</span>
              </div>
            </div>
          </div>

          {/* Right Column: Inventory Items Grid */}
          <div className="flex flex-col flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Backpack Items ({player.inventory.length})
            </h3>

            {player.inventory.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-xs text-slate-500 p-8 border border-dashed border-white/10 rounded-xl">
                Your inventory is empty. Mine ores, harvest crops, or trade with Elian!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1">
                {player.inventory.map((entry) => {
                  const isSelected = selectedEntry?.item.id === entry.item.id;
                  return (
                    <button
                      key={entry.item.id}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedEntry(entry);
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'border-amber-400/80 bg-amber-500/15 ring-1 ring-amber-400/30'
                          : 'border-white/10 bg-slate-900/70 hover:border-white/20'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {entry.item.type}
                        </span>
                        <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                          x{entry.quantity}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-200 truncate w-full">
                        {entry.item.name}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        Val: {entry.item.value}g
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Item Detail Card */}
            {selectedEntry && (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-slate-900/90 p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-200">
                      {selectedEntry.item.name}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {selectedEntry.item.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {selectedEntry.item.value} Gold
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  {(selectedEntry.item.type === 'food' ||
                    selectedEntry.item.type === 'crop' ||
                    selectedEntry.item.type === 'potion') && (
                    <button
                      type="button"
                      onClick={() => {
                        onUseItem(selectedEntry.item);
                      }}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95"
                    >
                      Consume / Eat
                    </button>
                  )}

                  {selectedEntry.item.type === 'equipment' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUseItem(selectedEntry.item);
                      }}
                      className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 active:scale-95"
                    >
                      Equip Item
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
