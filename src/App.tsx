import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, InputState } from './game/engine';
import { GameRenderer } from './game/renderer';
import { VirtualControls } from './components/VirtualControls';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { DialogueModal } from './components/DialogueModal';
import { SignpostModal } from './components/SignpostModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { InventoryModal } from './components/InventoryModal';
import { QuestModal } from './components/QuestModal';
import { LandscapeNotice } from './components/LandscapeNotice';
import { KingAudienceModal } from './components/KingAudienceModal';
import { CompanionModal } from './components/CompanionModal';
import { PowersModal } from './components/PowersModal';
import { WorldPortalModal } from './components/WorldPortalModal';
import { VillagerModal } from './components/VillagerModal';
import { GameState, NPC, InteractiveProp, MiningNode, FarmPlot, InteractiveTarget, KingdomVillager } from './game/types';
import { soundManager } from './game/audio';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<NPC | null>(null);
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const [activeShopNpc, setActiveShopNpc] = useState<NPC | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showQuestLog, setShowQuestLog] = useState<boolean>(false);
  const [hasSave, setHasSave] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissPortraitNotice, setDismissPortraitNotice] = useState<boolean>(false);

  // Stage 5 Modals
  const [showKingAudience, setShowKingAudience] = useState<boolean>(false);
  const [showCompanion, setShowCompanion] = useState<boolean>(false);
  const [showPowers, setShowPowers] = useState<boolean>(false);
  const [showWorldPortals, setShowWorldPortals] = useState<boolean>(false);
  const [activeVillager, setActiveVillager] = useState<KingdomVillager | null>(null);

  // HUD Reactive copy for smooth 60fps React render decoupling
  const [hudPlayer, setHudPlayer] = useState(engineRef.current?.player || null);
  const [hoveredInteractive, setHoveredInteractive] = useState<InteractiveTarget | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [gameTimeInfo, setGameTimeInfo] = useState<{ timeString: string; phase: 'morning' | 'noon' | 'sunset' | 'night' }>({
    timeString: '08:00',
    phase: 'morning',
  });

  // Raw keyboard input accumulator
  const keyState = useRef<{ [key: string]: boolean }>({});
  const touchMove = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Game Engine
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // Check saved game on mount
  useEffect(() => {
    setHasSave(engine.hasSavedGame());
  }, [engine]);

  // Viewport & Screen Orientation detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      // Portrait check
      const portrait = height > width && width < 768;
      setIsPortrait(portrait);

      if (canvasRef.current && engine.renderer) {
        const canvas = canvasRef.current;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        engine.camera.resize(width, height, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    // Prevent browser zoom gestures (pinch-zoom, ctrl+wheel, double-tap zoom)
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const preventGestureZoom = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventPinchZoom, { passive: false });
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('touchstart', preventPinchZoom);
      document.removeEventListener('touchmove', preventPinchZoom);
      window.removeEventListener('wheel', preventWheelZoom);
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
    };
  }, [engine]);

  // Fullscreen state listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    soundManager.playClick();
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen not permitted or cancelled
    }
  }, []);

  // Keyboard controls listener (WASD, Arrows, Space, E, J, Shift)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyState.current[e.code] = true;

      // Prevent scrolling when pressing Space or Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (gameState === 'PLAYING') {
        if (e.code === 'KeyE') {
          engine.triggerInteract();
        }
        if (e.code === 'KeyI' || e.code === 'KeyB') {
          setShowInventory((prev) => !prev);
          setShowQuestLog(false);
          setActiveShopNpc(null);
        }
        if (e.code === 'KeyQ') {
          setShowQuestLog((prev) => !prev);
          setShowInventory(false);
          setActiveShopNpc(null);
        }
        if (e.code === 'KeyK') {
          setShowKingAudience((prev) => !prev);
        }
        if (e.code === 'KeyC') {
          setShowCompanion((prev) => !prev);
        }
        if (e.code === 'KeyP') {
          setShowPowers((prev) => !prev);
        }
        if (e.code === 'KeyM') {
          setShowWorldPortals((prev) => !prev);
        }
        if (e.code === 'Escape') {
          if (
            showInventory ||
            showQuestLog ||
            activeShopNpc ||
            activeDialogue ||
            activeSign ||
            showKingAudience ||
            showCompanion ||
            showPowers ||
            showWorldPortals ||
            activeVillager
          ) {
            setShowInventory(false);
            setShowQuestLog(false);
            setActiveShopNpc(null);
            setActiveDialogue(null);
            setActiveSign(null);
            setShowKingAudience(false);
            setShowCompanion(false);
            setShowPowers(false);
            setShowWorldPortals(false);
            setActiveVillager(null);
          } else {
            setShowSettings((prev) => !prev);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyState.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, engine]);

  // Main Game Animation Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!engine.renderer) {
      const renderer = new GameRenderer(canvasRef.current);
      engine.setRenderer(renderer);
      engine.camera.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
    }

    let animationFrameId: number;
    let lastHudSync = 0;

    const loop = (timestamp: number) => {
      if (gameState === 'PLAYING') {
        // Compute input state combining keyboard and virtual joystick
        let moveX = touchMove.current.x;
        let moveY = touchMove.current.y;

        if (keyState.current['KeyA'] || keyState.current['ArrowLeft']) moveX -= 1;
        if (keyState.current['KeyD'] || keyState.current['ArrowRight']) moveX += 1;
        if (keyState.current['KeyW'] || keyState.current['ArrowUp']) moveY -= 1;
        if (keyState.current['KeyS'] || keyState.current['ArrowDown']) moveY += 1;

        // Normalize movement vector if diagonal
        const mag = Math.hypot(moveX, moveY);
        if (mag > 1) {
          moveX /= mag;
          moveY /= mag;
        }

        const input: InputState = {
          moveX,
          moveY,
          jump: !!keyState.current['Space'],
          attack: !!keyState.current['KeyJ'],
          interact: !!keyState.current['KeyE'],
          sprint: !!(keyState.current['ShiftLeft'] || keyState.current['ShiftRight']),
        };

        // Engine Update
        engine.update(input);

        // Check if dialogue or sign was opened
        if (engine.activeDialogueNpc) {
          setActiveDialogue(engine.activeDialogueNpc);
          engine.activeDialogueNpc = null;
        }
        if (engine.activeSignText) {
          setActiveSign(engine.activeSignText);
          engine.activeSignText = null;
        }
        if (engine.isKingAudienceOpen) {
          setShowKingAudience(true);
          engine.isKingAudienceOpen = false;
        }
        if (engine.isCompanionOpen) {
          setShowCompanion(true);
          engine.isCompanionOpen = false;
        }
        if (engine.isPowersOpen) {
          setShowPowers(true);
          engine.isPowersOpen = false;
        }
        if (engine.isPortalMapOpen) {
          setShowWorldPortals(true);
          engine.isPortalMapOpen = false;
        }
        if (engine.activeVillager) {
          setActiveVillager(engine.activeVillager);
          engine.activeVillager = null;
        }

        // Render Frame
        if (engine.renderer && canvasRef.current) {
          const timeInfo = engine.getTimeOfDay();
          engine.renderer.clear(canvasRef.current.width, canvasRef.current.height);
          engine.renderer.render(
            engine.camera,
            engine.player,
            engine.npcs,
            engine.props,
            engine.particles,
            engine.hoveredInteractive,
            engine.boss,
            engine.miningNodes,
            engine.farmPlots,
            timeInfo.phase,
            {
              portals: engine.portals,
              animals: engine.animals,
              enemies: engine.enemies,
              vehicles: engine.vehicles,
              catCompanion: engine.catCompanion,
              king: engine.king,
              villagers: engine.villagers,
              activeSummons: engine.activeSummons,
              cityDefenders: engine.cityDefenders,
              invadingUnits: engine.invadingUnits,
            }
          );
        }

        // Sync React HUD state periodically (~10-15 Hz) to keep React ultra fast
        if (timestamp - lastHudSync > 65) {
          lastHudSync = timestamp;
          setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          setHoveredInteractive(engine.hoveredInteractive);
          setNotification(engine.notificationText);
          setGameTimeInfo(engine.getTimeOfDay());
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, engine]);

  // Touch controls visibility check
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const showVirtualControls =
    gameState === 'PLAYING' &&
    (engine.settings.virtualControls === 'always' ||
      (engine.settings.virtualControls === 'auto' && isTouchDevice));

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-slate-950">
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-none"
        onPointerDown={() => {
          // Canvas click allows attack strike on PC if not interacting with UI
          if (gameState === 'PLAYING') {
            engine.player.stats.stamina = Math.max(0, engine.player.stats.stamina);
            keyState.current['KeyJ'] = true;
            setTimeout(() => {
              keyState.current['KeyJ'] = false;
            }, 80);
          }
        }}
      />

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartNewGame={() => {
            engine.resetGame();
            setGameState('PLAYING');
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onContinueGame={() => {
            const loaded = engine.loadGame();
            if (loaded) {
              setGameState('PLAYING');
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
            return loaded;
          }}
          onOpenSettings={() => setShowSettings(true)}
          hasSave={hasSave}
        />
      )}

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && hudPlayer && (
        <HUD
          player={hudPlayer}
          npcs={engine.npcs}
          props={engine.props}
          onOpenSettings={() => setShowSettings(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          hoveredInteractive={hoveredInteractive}
          notificationText={notification}
          boss={engine.boss}
          isDuelActive={engine.isDuelActive}
          onOpenInventory={() => setShowInventory(true)}
          onOpenQuestLog={() => setShowQuestLog(true)}
          onOpenKingAudience={() => setShowKingAudience(true)}
          onOpenCompanion={() => setShowCompanion(true)}
          onOpenPowers={() => setShowPowers(true)}
          onOpenWorldPortals={() => setShowWorldPortals(true)}
          gameTimeInfo={gameTimeInfo}
        />
      )}

      {/* Virtual Touch Controls for Mobile */}
      {showVirtualControls && (
        <VirtualControls
          onMoveChange={(x, y) => {
            touchMove.current = { x, y };
          }}
          onJump={() => {
            keyState.current['Space'] = true;
            setTimeout(() => {
              keyState.current['Space'] = false;
            }, 100);
          }}
          onAttack={() => {
            keyState.current['KeyJ'] = true;
            setTimeout(() => {
              keyState.current['KeyJ'] = false;
            }, 100);
          }}
          onInteract={() => {
            engine.triggerInteract();
          }}
          canInteract={!!hoveredInteractive}
          interactLabel={
            hoveredInteractive && 'isSovereign' in hoveredInteractive
              ? 'Audience'
              : hoveredInteractive && 'isMagicalCat' in hoveredInteractive
              ? 'Pet Cat'
              : hoveredInteractive && 'profession' in hoveredInteractive
              ? 'Talk'
              : hoveredInteractive && 'targetZone' in hoveredInteractive
              ? 'Portal'
              : hoveredInteractive && 'species' in hoveredInteractive
              ? 'Trust'
              : hoveredInteractive && 'speedBonus' in hoveredInteractive
              ? 'Mount'
              : hoveredInteractive && 'dialogue' in hoveredInteractive
              ? (hoveredInteractive.id === 'npc_captain'
                  ? 'Duel'
                  : (hoveredInteractive as NPC).isBlacksmith
                  ? 'Forge'
                  : (hoveredInteractive as NPC).isMerchant
                  ? 'Trade'
                  : 'Talk')
              : hoveredInteractive && 'resourceType' in hoveredInteractive
              ? 'Mine'
              : hoveredInteractive && 'cropType' in hoveredInteractive
              ? 'Harvest'
              : hoveredInteractive && 'type' in hoveredInteractive && hoveredInteractive.type === 'dummy'
              ? 'Train'
              : hoveredInteractive && 'type' in hoveredInteractive && hoveredInteractive.type === 'well'
              ? 'Drink'
              : hoveredInteractive && 'type' in hoveredInteractive && hoveredInteractive.type === 'chest'
              ? 'Open'
              : hoveredInteractive && 'type' in hoveredInteractive && hoveredInteractive.type === 'mine_gate'
              ? 'Enter Mine'
              : hoveredInteractive && 'type' in hoveredInteractive && hoveredInteractive.type === 'mine_exit'
              ? 'Surface'
              : 'Inspect'
          }
          onOpenInventory={() => setShowInventory(true)}
          onOpenQuests={() => setShowQuestLog(true)}
          inventoryCount={hudPlayer?.inventory?.length || 0}
        />
      )}

      {/* Dialogue Modal */}
      {activeDialogue && (
        <DialogueModal
          npc={activeDialogue}
          onClose={() => setActiveDialogue(null)}
          onStartDuel={() => {
            setActiveDialogue(null);
            engine.startCaptainDuel();
          }}
          onOpenShop={(npc) => {
            setActiveDialogue(null);
            setActiveShopNpc(npc);
          }}
          onOpenQuests={() => {
            setActiveDialogue(null);
            setShowQuestLog(true);
          }}
        />
      )}

      {/* Merchant & Blacksmith Shop/Forge Modal */}
      {activeShopNpc && hudPlayer && (
        <ShopModal
          player={hudPlayer}
          npc={activeShopNpc}
          onBuyItem={(item) => {
            const success = engine.buyItem(item);
            if (success) {
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onSellItem={(item, quantity) => {
            const success = engine.sellItem(item, quantity);
            if (success) {
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onCraftRecipe={(recipe) => {
            const success = engine.craftEquipment(recipe);
            if (success) {
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onClose={() => setActiveShopNpc(null)}
        />
      )}

      {/* Backpack & Equipment Inventory Modal */}
      {showInventory && hudPlayer && (
        <InventoryModal
          player={hudPlayer}
          onUseItem={(item) => {
            engine.useItem(item);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onUnequip={(slot) => {
            engine.unequip(slot);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Village Quest Journal Modal */}
      {showQuestLog && hudPlayer && (
        <QuestModal
          quests={hudPlayer.quests}
          onTurnInQuest={(questId) => {
            const success = engine.turnInQuest(questId);
            if (success) {
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onClose={() => setShowQuestLog(false)}
        />
      )}

      {/* Signpost Notice Modal */}
      {activeSign && (
        <SignpostModal
          text={activeSign}
          onClose={() => setActiveSign(null)}
        />
      )}

      {/* Sovereign King Alden IV Royal Audience Modal */}
      {showKingAudience && (
        <KingAudienceModal
          king={engine.king}
          kingdom={engine.kingdom}
          playerGold={hudPlayer?.gold || 0}
          playerLevel={hudPlayer?.stats.level || 1}
          onToggleDecree={(id) => {
            engine.interactWithKing('decree', id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onSetTaxPolicy={(pol) => {
            engine.interactWithKing('tax', pol);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onPromoteKnight={() => {
            engine.interactWithKing('knighthood');
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onDonateTreasury={(amt) => {
            if (engine.player.gold >= amt) {
              engine.player.gold -= amt;
              engine.king.treasuryGold += amt;
              engine.kingdom.population += 2;
              soundManager.playCoinSound();
              engine.showNotification(`Donated ${amt} Gold to Royal Treasury!`);
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onDonateGranary={(amt) => {
            if (engine.player.gold >= 25) {
              engine.player.gold -= 25;
              engine.king.foodStock += amt;
              soundManager.playHarvest();
              engine.showNotification(`Provisioned ${amt} bushels of food to Royal Granaries!`);
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onClose={() => setShowKingAudience(false)}
        />
      )}

      {/* Magical Cat Companion Modal */}
      {showCompanion && (
        <CompanionModal
          cat={engine.catCompanion}
          playerGold={hudPlayer?.gold || 0}
          onFeedCat={(food) => {
            engine.interactWithCat('feed', food);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onPetCat={() => {
            engine.interactWithCat('pet');
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onTrainCat={() => {
            engine.interactWithCat('heal');
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onSetAction={(act) => {
            engine.catCompanion.currentAction = act;
            engine.showNotification(`Starlight is now: ${act.toUpperCase()}`);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onClose={() => setShowCompanion(false)}
        />
      )}

      {/* Character Powers & Summoning Modal */}
      {showPowers && hudPlayer && (
        <PowersModal
          powers={engine.powers}
          summonTemplates={engine.summonTemplates}
          activeSummons={engine.activeSummons}
          playerLevel={hudPlayer.stats.level}
          playerExp={hudPlayer.stats.exp}
          playerGold={hudPlayer.gold}
          playerStamina={hudPlayer.stats.stamina}
          onUpgradePower={(id) => {
            engine.upgradePower(id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onCastPower={(id) => {
            engine.castPower(id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onSummonWarrior={(id) => {
            engine.summonWarrior(id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onUpgradeSummon={(id) => {
            engine.upgradeSummon(id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onClose={() => setShowPowers(false)}
        />
      )}

      {/* Worlds & Magical Portals Modal */}
      {showWorldPortals && (
        <WorldPortalModal
          portals={engine.portals}
          currentZone={engine.player.currentZone}
          onWarpToPortal={(id) => {
            engine.fastTravelPortal(id);
            setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
          }}
          onClose={() => setShowWorldPortals(false)}
        />
      )}

      {/* Living Kingdom Villager Modal */}
      {activeVillager && (
        <VillagerModal
          villager={activeVillager}
          playerGold={hudPlayer?.gold || 0}
          onTrade={() => {
            setActiveVillager(null);
            const tradeNpc = engine.npcs.find((n) => n.isMerchant || n.isBlacksmith);
            if (tradeNpc) {
              setActiveShopNpc(tradeNpc);
            } else {
              engine.showNotification(`${activeVillager.name} shared supplies with you!`);
            }
          }}
          onGiftRation={() => {
            if (engine.player.gold >= 10) {
              engine.player.gold -= 10;
              const currentHap = activeVillager.happiness || 80;
              activeVillager.happiness = Math.min(100, currentHap + 12);
              engine.gainExp(15);
              soundManager.playHarvest();
              engine.showNotification(`Gifted bread & coin to ${activeVillager.name}! Happiness rose to ${activeVillager.happiness}%.`);
              setHudPlayer({ ...engine.player, stats: { ...engine.player.stats } });
            }
          }}
          onClose={() => setActiveVillager(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={engine.settings}
          onUpdateSettings={(newSettings) => {
            engine.settings = { ...engine.settings, ...newSettings };
          }}
          onSaveGame={() => {
            const saved = engine.saveGame();
            if (saved) setHasSave(true);
          }}
          onReturnToMenu={() => {
            setShowSettings(false);
            setGameState('MENU');
            setHasSave(engine.hasSavedGame());
          }}
          onClose={() => setShowSettings(false)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Portrait helper prompt on mobile */}
      {isPortrait && !dismissPortraitNotice && (
        <LandscapeNotice onDismiss={() => setDismissPortraitNotice(true)} />
      )}
    </div>
  );
}
