import React, { useState } from 'react';
import { PlayerState, Item, NPC, CraftingRecipe } from '../game/types';
import {
  MERCHANT_SHOP_ITEMS,
  BLACKSMITH_RECIPES,
} from '../game/constants';
import { X, Coins, ShoppingBag, Hammer, ArrowDownRight } from 'lucide-react';
import { soundManager } from '../game/audio';

interface ShopModalProps {
  player: PlayerState;
  npc: NPC;
  onBuyItem: (item: Item) => void;
  onSellItem: (item: Item, quantity?: number) => void;
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  player,
  npc,
  onBuyItem,
  onSellItem,
  onCraftRecipe,
  onClose,
}) => {
  const isBlacksmith = npc.isBlacksmith;
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'craft'>(
    isBlacksmith ? 'craft' : 'buy'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm select-none safe-pad-left safe-pad-right">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-amber-500/40 bg-slate-950/95 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 shadow"
              style={{ backgroundColor: npc.avatarColor }}
            >
              {isBlacksmith ? (
                <Hammer className="h-5 w-5 text-amber-200" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-amber-200" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200">
                {isBlacksmith ? "Torin's Smithy & Forge" : "Merchant Elian's Market Stall"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold tabular-nums">{player.gold} Gold Available</span>
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-900/40 px-5 pt-2 gap-2 text-xs font-bold">
          {isBlacksmith ? (
            <>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('craft');
                }}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === 'craft'
                    ? 'border-amber-400 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hammer className="h-4 w-4" />
                <span>Forge & Upgrade</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('sell');
                }}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === 'sell'
                    ? 'border-amber-400 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                <span>Sell Raw Metals</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('buy');
                }}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === 'buy'
                    ? 'border-amber-400 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Purchase Wares</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('sell');
                }}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === 'sell'
                    ? 'border-amber-400 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                <span>Sell Harvest & Ores</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[380px]">
          {/* TAB 1: BUY WARES */}
          {activeTab === 'buy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MERCHANT_SHOP_ITEMS.map((item) => {
                const canAfford = player.gold >= item.value;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3.5 hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {item.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-300">
                          {item.value} Gold
                        </span>
                      </div>
                      <h4 className="mt-1 font-serif text-sm font-semibold text-slate-100">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item)}
                      className={`mt-3 w-full rounded-lg py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        canAfford
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Buy' : 'Not Enough Gold'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: FORGE & UPGRADE (BLACKSMITH) */}
          {activeTab === 'craft' && (
            <div className="space-y-3">
              {BLACKSMITH_RECIPES.map((recipe) => {
                const canAffordGold = player.gold >= recipe.requiredGold;
                const hasMaterials = recipe.requiredMaterials.every((req) => {
                  const entry = player.inventory.find((i) => i.item.id === req.item.id);
                  return !!entry && entry.quantity >= req.quantity;
                });
                const canCraft = canAffordGold && hasMaterials;

                return (
                  <div
                    key={recipe.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-bold text-amber-200">
                          {recipe.resultItem.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {recipe.resultItem.slot || 'Equipment'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {recipe.resultItem.description}
                      </p>

                      {/* Material Requirements Checklist */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-400">Needs:</span>
                        <span
                          className={`font-mono font-bold ${
                            canAffordGold ? 'text-amber-300' : 'text-rose-400'
                          }`}
                        >
                          {recipe.requiredGold} Gold
                        </span>
                        {recipe.requiredMaterials.map((mat) => {
                          const playerEntry = player.inventory.find(
                            (i) => i.item.id === mat.item.id
                          );
                          const playerQty = playerEntry?.quantity || 0;
                          const hasEnough = playerQty >= mat.quantity;
                          return (
                            <span
                              key={mat.item.id}
                              className={`rounded px-1.5 py-0.5 text-[11px] font-medium border ${
                                hasEnough
                                  ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                                  : 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                              }`}
                            >
                              {mat.item.name}: {playerQty}/{mat.quantity}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canCraft}
                      onClick={() => onCraftRecipe(recipe)}
                      className={`shrink-0 rounded-lg px-5 py-2 text-xs font-bold transition-all active:scale-95 ${
                        canCraft
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canCraft ? 'Forge Gear' : 'Missing Mats'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SELL ITEMS */}
          {activeTab === 'sell' && (
            <div>
              {player.inventory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
                  You have no items in your backpack to sell.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {player.inventory.map((entry) => {
                    const sellVal = Math.round(entry.item.value * 0.8);
                    return (
                      <div
                        key={entry.item.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3"
                      >
                        <div className="flex-1 truncate mr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {entry.item.name}
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono">
                              x{entry.quantity}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Sell price: {sellVal}g each
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSellItem(entry.item, 1)}
                          className="rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-slate-700 active:scale-95"
                        >
                          Sell 1 (+{sellVal}g)
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
