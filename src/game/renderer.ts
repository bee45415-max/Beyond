import { GameCamera } from './camera';
import {
  PlayerState,
  NPC,
  InteractiveProp,
  Particle,
  CaptainBossState,
  MiningNode,
  FarmPlot,
  Portal,
  Animal,
  Enemy,
  Vehicle,
  MagicalCatCompanion,
  KingState,
  KingdomVillager,
  InteractiveTarget,
  WorldZone,
} from './types';
import {
  HOUSES,
  FOREST_TREES,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MINE_CAVERN_WIDTH,
  MINE_CAVERN_HEIGHT,
} from './constants';
import { ActiveSummon, CityDefender, InvadingUnit } from './stage4_data';

export interface RenderExtraEntities {
  portals?: Portal[];
  animals?: Animal[];
  enemies?: Enemy[];
  vehicles?: Vehicle[];
  catCompanion?: MagicalCatCompanion;
  king?: KingState;
  villagers?: KingdomVillager[];
  activeSummons?: ActiveSummon[];
  cityDefenders?: CityDefender[];
  invadingUnits?: InvadingUnit[];
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public updateTime(dt: number) {
    this.time += dt;
  }

  public clear(width: number, height: number) {
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, width, height);
  }

  public render(
    camera: GameCamera,
    player: PlayerState,
    npcs: NPC[],
    props: InteractiveProp[],
    particles: Particle[],
    hoveredInteractive: InteractiveTarget | null,
    boss?: CaptainBossState | null,
    miningNodes?: MiningNode[],
    farmPlots?: FarmPlot[],
    timePhase: 'morning' | 'noon' | 'sunset' | 'night' = 'morning',
    extra?: RenderExtraEntities
  ) {
    const { ctx } = this;
    const offset = camera.getRenderOffset();
    const scale = camera.scale;
    const dpr = camera.dpr;

    ctx.save();
    ctx.scale(dpr * scale, dpr * scale);
    ctx.translate(-offset.x, -offset.y);

    const zone = player.currentZone;

    if (zone === 'mine_cavern') {
      // --- MINE CAVERN INTERIOR RENDERING ---
      this.renderCavernTerrain(camera);
      this.renderCavernProps(camera, props, hoveredInteractive);
      if (miningNodes) {
        this.renderMiningNodes(camera, miningNodes, hoveredInteractive);
      }
      this.renderNPCs(camera, npcs, hoveredInteractive, boss, 'mine_cavern');
    } else if (zone === 'modern_city') {
      // --- NEO-VERIDIA TECH METROPOLIS ---
      this.renderModernCityTerrain(camera);
      this.renderNPCs(camera, npcs, hoveredInteractive, boss, 'modern_city');
    } else if (zone === 'magic_realm') {
      // --- AETHERIA HIGH ARCANE REALM ---
      this.renderMagicRealmTerrain(camera);
      this.renderNPCs(camera, npcs, hoveredInteractive, boss, 'magic_realm');
    } else if (zone === 'ancient_ruins') {
      // --- PRECURSOR NEXUS ANCIENT RUINS ---
      this.renderAncientRuinsTerrain(camera);
      this.renderNPCs(camera, npcs, hoveredInteractive, boss, 'ancient_ruins');
    } else {
      // --- OVERWORLD & LIVING VILLAGE RENDERING ---
      this.renderTerrain(camera);
      this.renderRoads(camera);

      if (farmPlots) {
        this.renderFarmArea(camera, farmPlots, hoveredInteractive);
      }

      this.renderVillageFeatures(camera);
      this.renderHouseGrounds(camera);
      this.renderMineEntrance(camera);
      this.renderTrainingYard(camera);
      this.renderProps(camera, props, hoveredInteractive);

      // Living Kingdom Villagers with active professions & workplaces
      if (extra?.villagers) {
        this.renderVillagers(camera, extra.villagers, hoveredInteractive);
      }

      // Sovereign King Alden IV on Royal Throne
      if (extra?.king) {
        this.renderKing(camera, extra.king, hoveredInteractive);
      }

      this.renderNPCs(camera, npcs, hoveredInteractive, boss, 'overworld');
    }

    // --- ENTITIES RENDERED ACROSS ALL WORLDS & ZONES ---

    // 1. Portals
    if (extra?.portals) {
      this.renderPortals(camera, extra.portals, zone, hoveredInteractive);
    }

    // 2. Vehicles
    if (extra?.vehicles) {
      this.renderVehicles(camera, extra.vehicles, zone, hoveredInteractive);
    }

    // 3. Animals & Pets
    if (extra?.animals) {
      this.renderAnimals(camera, extra.animals, zone, hoveredInteractive);
    }

    // 4. Magical Cat Companion
    if (extra?.catCompanion && extra.catCompanion.zone === zone) {
      this.renderMagicalCat(camera, extra.catCompanion, hoveredInteractive);
    }

    // 5. Active Summons & City Defenders
    if (extra?.activeSummons) {
      this.renderSummons(camera, extra.activeSummons);
    }
    if (extra?.cityDefenders && zone === 'overworld') {
      this.renderCityDefenders(camera, extra.cityDefenders);
    }
    if (extra?.invadingUnits && zone === 'overworld') {
      this.renderInvadingUnits(camera, extra.invadingUnits);
    }

    // 6. Enemies (Flying Bats, Witches with Magic Shields, Ground Foes, Bosses)
    if (extra?.enemies) {
      this.renderEnemies(camera, extra.enemies, zone, hoveredInteractive);
    }

    // 7. Player Character Kaelen
    this.renderPlayer(player);

    // 8. House roofs & overhangs (overworld only)
    if (zone === 'overworld') {
      this.renderHouseRoofs(camera);
      this.renderTrees(camera);
    }

    // 9. Dynamic Particles (sparks, dust, leaf swirls, damage numbers)
    this.renderParticles(particles);

    // 10. Ambient Lighting & Day/Night Atmosphere
    if (zone === 'mine_cavern') {
      this.renderCavernLighting(camera);
    } else {
      this.renderDayNightLighting(camera, timePhase);
      this.renderWorldBorders(camera);
    }

    ctx.restore();
  }

  // ==========================================
  // OVERWORLD TERRAIN & FEATURES
  // ==========================================
  private renderTerrain(camera: GameCamera) {
    const { ctx } = this;
    ctx.fillStyle = '#1c361e';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Village meadow area
    ctx.fillStyle = '#244525';
    ctx.fillRect(750, 650, 1150, 950);

    // Whispering Forest floor
    ctx.fillStyle = '#112615';
    ctx.fillRect(1950, 300, 1200, 1750);

    // Rocky Mine approach
    ctx.fillStyle = '#26292e';
    ctx.fillRect(1600, 50, 850, 480);
  }

  private renderRoads(camera: GameCamera) {
    const { ctx } = this;

    // Village Cobblestone Square
    if (camera.isVisible(1100, 950, 380, 350)) {
      ctx.fillStyle = '#524a3c';
      ctx.beginPath();
      ctx.roundRect(1120, 970, 340, 300, 24);
      ctx.fill();

      ctx.strokeStyle = '#3e372b';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#635b4c';
      for (let cx = 1140; cx < 1440; cx += 45) {
        for (let cy = 990; cy < 1250; cy += 38) {
          ctx.fillRect(cx + ((cy % 76 === 0) ? 14 : 0), cy, 26, 18);
        }
      }
    }

    // Main East-West Dirt Road
    ctx.fillStyle = '#4a3f31';
    ctx.beginPath();
    ctx.rect(700, 1110, 1400, 55);
    // North branch to Mine
    ctx.rect(1380, 480, 55, 640);
    ctx.rect(1420, 480, 460, 50);
    ctx.rect(1840, 240, 50, 260);
    // South branch to Farmland
    ctx.rect(1080, 1160, 50, 420);
    ctx.rect(840, 1470, 350, 45);
    // East branch to Forest
    ctx.rect(2050, 1110, 800, 48);
    ctx.rect(2450, 750, 45, 750);
    ctx.fill();
  }

  /**
   * Stage 2: Farm plots with wheat, carrots, and pumpkins
   */
  private renderFarmArea(camera: GameCamera, plots: FarmPlot[], hovered: unknown) {
    const { ctx } = this;
    const fx = 830;
    const fy = 1420;

    if (!camera.isVisible(fx - 20, fy - 20, 340, 180)) return;

    // Farm boundary fence & tilled dark soil patch
    ctx.fillStyle = '#3f2817';
    ctx.beginPath();
    ctx.roundRect(fx, fy, 280, 140, 12);
    ctx.fill();
    ctx.strokeStyle = '#6b4321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Irrigation furrows
    ctx.strokeStyle = '#2b1b0f';
    ctx.lineWidth = 2;
    for (let r = fy + 24; r < fy + 130; r += 26) {
      ctx.beginPath();
      ctx.moveTo(fx + 10, r);
      ctx.lineTo(fx + 270, r);
      ctx.stroke();
    }

    // Render individual crops
    for (const plot of plots) {
      if (!camera.isVisible(plot.x - 10, plot.y - 10, 50, 50)) continue;

      const isRipe = plot.state === 'ripe';
      const isHov = hovered === plot;

      ctx.save();
      ctx.translate(plot.x, plot.y);

      if (plot.cropType === 'wheat') {
        // Golden wheat stalks waving in breeze
        const sway = Math.sin(this.time * 3 + plot.x) * 2;
        ctx.fillStyle = isRipe ? '#facc15' : '#84cc16';
        for (let i = 0; i < 4; i++) {
          const wx = i * 8 + 4;
          ctx.fillRect(wx + sway, isRipe ? 2 : 12, 3, isRipe ? 22 : 12);
          ctx.beginPath();
          ctx.arc(wx + 1.5 + sway, isRipe ? 2 : 10, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (plot.cropType === 'carrot') {
        // Carrot greens top + orange root peak
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(6, 6, 12, 10);
        if (isRipe) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(12, 18, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (plot.cropType === 'pumpkin') {
        // Orange pumpkin with green stem
        ctx.fillStyle = isRipe ? '#ea580c' : '#65a30d';
        ctx.beginPath();
        ctx.ellipse(14, 16, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(12, 6, 3, 5);
      }

      ctx.restore();

      if (isRipe && isHov) {
        this.renderInteractionBadge(plot.x + 14, plot.y - 8, 'Harvest');
      }
    }
  }

  /**
   * Stage 2: Village Features (Fisherman Pond, Builder Site, Wood Pile, Market Stall)
   */
  private renderVillageFeatures(camera: GameCamera) {
    const { ctx } = this;

    // 1. Fisherman's Village Pond (x: 1100..1280, y: 1530..1680)
    if (camera.isVisible(1100, 1520, 200, 160)) {
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.ellipse(1200, 1600, 85, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water ripples
      const rip = Math.sin(this.time * 2) * 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(1200, 1600, 60 + rip, 28 + rip * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Wooden Fishing Dock / Pier
      ctx.fillStyle = '#78350f';
      ctx.fillRect(1135, 1565, 48, 14);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1135, 1565, 48, 14);
    }

    // 2. Builder Cedric's Construction Site (x: 1520, y: 1320)
    if (camera.isVisible(1500, 1300, 140, 100)) {
      ctx.fillStyle = '#78350f';
      // Timber scaffolding beams
      ctx.fillRect(1530, 1330, 6, 35);
      ctx.fillRect(1570, 1330, 6, 35);
      ctx.fillRect(1524, 1334, 58, 4);

      // Stacked stone bricks
      ctx.fillStyle = '#64748b';
      ctx.fillRect(1585, 1345, 20, 14);
      ctx.fillRect(1590, 1337, 16, 8);
    }

    // 3. Woodcutter Silas's Timber Log Pile (x: 2010, y: 1200)
    if (camera.isVisible(1990, 1180, 90, 70)) {
      ctx.fillStyle = '#5c2b0c';
      // Tree stump chopping block
      ctx.beginPath();
      ctx.ellipse(2015, 1220, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cleaved logs stack
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2035, 1215, 34, 10);
      ctx.fillRect(2038, 1207, 30, 9);
      ctx.fillRect(2042, 1199, 22, 9);
    }

    // 4. Merchant Elian's Market Stall (x: 1310, y: 1150)
    if (camera.isVisible(1290, 1130, 100, 80)) {
      // Wooden counter table
      ctx.fillStyle = '#451a03';
      ctx.fillRect(1315, 1175, 54, 20);

      // Striped Market Canopy Awning (Red & Gold)
      ctx.beginPath();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(1310, 1148, 64, 14);
      ctx.fillStyle = '#f59e0b';
      for (let s = 1310; s < 1374; s += 16) {
        ctx.fillRect(s, 1148, 8, 14);
      }

      // Wooden awning support posts
      ctx.fillStyle = '#78350f';
      ctx.fillRect(1312, 1148, 4, 34);
      ctx.fillRect(1370, 1148, 4, 34);

      // Display crates with food & wares
      ctx.fillStyle = '#d97706';
      ctx.fillRect(1320, 1170, 14, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(1342, 1170, 14, 8);
    }
  }

  private renderHouseGrounds(camera: GameCamera) {
    const { ctx } = this;
    for (const h of HOUSES) {
      if (!camera.isVisible(h.x, h.y, h.w, h.h)) continue;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(h.x + h.w / 2, h.y + h.h - 10, h.w / 2 + 15, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#292524';
      ctx.fillRect(h.x, h.y + h.h - 24, h.w, 24);

      ctx.fillStyle = h.wallColor;
      ctx.fillRect(h.x + 4, h.y + 40, h.w - 8, h.h - 55);

      ctx.fillStyle = '#3f2212';
      ctx.fillRect(h.x + 4, h.y + 40, 10, h.h - 55);
      ctx.fillRect(h.x + h.w - 14, h.y + 40, 10, h.h - 55);
      ctx.fillRect(h.x + h.w / 2 - 5, h.y + 40, 10, h.h - 55);
      ctx.fillRect(h.x + 4, h.y + 65, h.w - 8, 8);

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(h.doorX, h.y + h.h - 48, 26, 40, [6, 6, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(h.doorX + 20, h.y + h.h - 26, 2.5, 0, Math.PI * 2);
      ctx.fill();

      const winY = h.y + 48;
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.fillRect(h.x + 22, winY, 20, 16);
      ctx.fillRect(h.x + h.w - 42, winY, 20, 16);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#3f2212';
      ctx.fillRect(h.x + 31, winY, 2, 16);
      ctx.fillRect(h.x + 22, winY + 7, 20, 2);
      ctx.fillRect(h.x + h.w - 33, winY, 2, 16);
      ctx.fillRect(h.x + h.w - 42, winY + 7, 20, 2);

      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(h.name, h.x + h.w / 2, h.y + h.h + 16);
    }
  }

  private renderHouseRoofs(camera: GameCamera) {
    const { ctx } = this;
    for (const h of HOUSES) {
      if (!camera.isVisible(h.x - 20, h.y - 40, h.w + 40, h.h)) continue;

      ctx.fillStyle = h.roofColor;
      ctx.beginPath();
      ctx.moveTo(h.x - 14, h.y + 44);
      ctx.lineTo(h.x + h.w / 2, h.y - 18);
      ctx.lineTo(h.x + h.w + 14, h.y + 44);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (h.hasChimney) {
        const chimX = h.x + h.w - 35;
        const chimY = h.y - 12;
        ctx.fillStyle = '#475569';
        ctx.fillRect(chimX, chimY, 18, 30);
        ctx.fillStyle = '#334155';
        ctx.fillRect(chimX - 2, chimY - 4, 22, 6);

        const smokeTime = this.time * 2;
        for (let s = 0; s < 3; s++) {
          const sy = chimY - 10 - ((smokeTime + s * 1.5) % 4) * 12;
          const sx = chimX + 9 + Math.sin(sy * 0.08) * 8;
          const sAlpha = Math.max(0, 0.4 - ((chimY - sy) / 60));
          ctx.fillStyle = `rgba(226, 232, 240, ${sAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 7 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private renderMineEntrance(camera: GameCamera) {
    const { ctx } = this;
    const mx = 1750;
    const my = 120;
    const mw = 360;
    const mh = 260;

    if (!camera.isVisible(mx - 50, my - 50, mw + 100, mh + 100)) return;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(mx - 60, my + mh);
    ctx.lineTo(mx - 40, my + 60);
    ctx.lineTo(mx + 80, my - 20);
    ctx.lineTo(mx + 220, my - 40);
    ctx.lineTo(mx + mw + 40, my + 30);
    ctx.lineTo(mx + mw + 80, my + mh);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#05070a';
    ctx.beginPath();
    ctx.ellipse(mx + mw / 2, my + mh - 20, 75, 95, 0, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.fillRect(mx + mw / 2 - 85, my + mh - 130, 18, 120);
    ctx.fillRect(mx + mw / 2 + 67, my + mh - 130, 18, 120);
    ctx.fillRect(mx + mw / 2 - 92, my + mh - 142, 184, 20);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(mx + mw / 2 - 60, my + mh - 138, 120, 14);
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('ALDEN MINE - SHAFT 1', mx + mw / 2, my + mh - 128);

    // Mine cart rails extending out
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mx + mw / 2 - 25, my + mh - 20);
    ctx.lineTo(mx + mw / 2 - 25, my + mh + 90);
    ctx.moveTo(mx + mw / 2 + 25, my + mh - 20);
    ctx.lineTo(mx + mw / 2 + 25, my + mh + 90);
    ctx.stroke();

    const cartX = mx + mw / 2 - 28;
    const cartY = my + mh + 35;
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(cartX, cartY, 56, 34);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cartX + 16, cartY + 6, 8, 0, Math.PI * 2);
    ctx.arc(cartX + 32, cartY + 4, 10, 0, Math.PI * 2);
    ctx.arc(cartX + 44, cartY + 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Portal entrance highlight pulse
    const portalPulse = Math.sin(this.time * 3) * 0.15 + 0.35;
    ctx.fillStyle = `rgba(192, 132, 252, ${portalPulse})`;
    ctx.beginPath();
    ctx.ellipse(mx + mw / 2, my + mh - 10, 35, 45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderTrainingYard(camera: GameCamera) {
    const { ctx } = this;
    const tx = 1610;
    const ty = 1040;

    if (!camera.isVisible(tx - 20, ty - 20, 180, 160)) return;

    ctx.fillStyle = '#4e3d28';
    ctx.beginPath();
    ctx.ellipse(tx + 60, ty + 70, 75, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 140, ty);
    ctx.lineTo(tx + 140, ty + 120);
    ctx.stroke();
  }

  // ==========================================
  // MINE CAVERN INTERIOR RENDERING
  // ==========================================
  private renderCavernTerrain(camera: GameCamera) {
    const { ctx } = this;
    // Dark subterranean bedrock
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, MINE_CAVERN_WIDTH, MINE_CAVERN_HEIGHT);

    ctx.fillStyle = '#111827';
    ctx.fillRect(60, 60, MINE_CAVERN_WIDTH - 120, MINE_CAVERN_HEIGHT - 120);

    // Underground cavern rail tracks running down center
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 420);
    ctx.lineTo(1250, 420);
    ctx.moveTo(80, 450);
    ctx.lineTo(1250, 450);
    ctx.stroke();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    for (let rx = 90; rx < 1250; rx += 25) {
      ctx.beginPath();
      ctx.moveTo(rx, 412);
      ctx.lineTo(rx, 458);
      ctx.stroke();
    }

    // Subterranean glowing spring water pool
    ctx.fillStyle = '#083344';
    ctx.beginPath();
    ctx.ellipse(640, 240, 95, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.ellipse(640, 240, 75, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderCavernProps(camera: GameCamera, props: InteractiveProp[], hovered: unknown) {
    const { ctx } = this;
    for (const prop of props) {
      if (prop.type === 'mine_exit') {
        // Portal arch to surface
        ctx.fillStyle = '#451a03';
        ctx.fillRect(prop.x - 8, prop.y - 20, 12, 50);
        ctx.fillRect(prop.x + 36, prop.y - 20, 12, 50);
        ctx.fillRect(prop.x - 12, prop.y - 26, 64, 10);

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(prop.x + 20, prop.y + 5, 22, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('SURFACE EXIT', prop.x + 20, prop.y - 32);

        if (hovered === prop) {
          this.renderInteractionBadge(prop.x + 20, prop.y - 12, 'Exit to Village');
        }
      } else if (prop.id === 'prop_quest_pickaxe' && prop.x > 0) {
        // Douglas's Lost Pickaxe resting on boulder
        ctx.fillStyle = '#78350f';
        ctx.fillRect(prop.x + 8, prop.y + 4, 4, 22);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(prop.x, prop.y + 4);
        ctx.lineTo(prop.x + 20, prop.y + 4);
        ctx.lineTo(prop.x + 10, prop.y + 12);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText("Douglas's Pickaxe", prop.x + 10, prop.y - 6);

        if (hovered === prop) {
          this.renderInteractionBadge(prop.x + 10, prop.y - 16, 'Take Pickaxe');
        }
      }
    }
  }

  /**
   * Stage 2 Mining Nodes (Coal, Copper, Iron, Gold, Sky Crystal)
   */
  private renderMiningNodes(camera: GameCamera, nodes: MiningNode[], hovered: unknown) {
    const { ctx } = this;
    for (const node of nodes) {
      if (!camera.isVisible(node.x - 20, node.y - 20, node.width + 40, node.height + 40)) continue;

      const isHov = hovered === node;
      const isDepleted = node.depleted;

      ctx.save();
      ctx.translate(node.x, node.y);

      if (isDepleted) {
        // Cracked depleted stone rubble
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(node.width / 2, node.height - 6, node.width / 2, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, node.height - 14, 12, 8);
        ctx.fillRect(24, node.height - 12, 14, 7);
      } else {
        // Rugged Mineral Rock formation
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, node.height);
        ctx.lineTo(6, 12);
        ctx.lineTo(node.width / 2, 0);
        ctx.lineTo(node.width - 6, 10);
        ctx.lineTo(node.width, node.height);
        ctx.closePath();
        ctx.fill();

        // Distinct Ore crystal facets
        ctx.fillStyle = node.color;
        if (node.resourceType === 'crystal') {
          // Luminous Sky Crystal Cluster
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(12, 28);
          ctx.lineTo(18, 4);
          ctx.lineTo(24, 28);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(24, 30);
          ctx.lineTo(32, 2);
          ctx.lineTo(38, 30);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Ore metallic chunks
          ctx.fillRect(10, 14, 10, 8);
          ctx.fillRect(24, 10, 12, 9);
          ctx.fillRect(18, 24, 14, 8);
        }

        // Ore Name
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.width / 2, -10);

        // Health Bar if damaged
        if (node.hp < node.maxHp) {
          const hpRatio = Math.max(0, node.hp / node.maxHp);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(4, -8, node.width - 8, 4);
          ctx.fillStyle = node.color;
          ctx.fillRect(4, -8, (node.width - 8) * hpRatio, 4);
        }
      }

      ctx.restore();

      if (!isDepleted && isHov) {
        this.renderInteractionBadge(node.x + node.width / 2, node.y - 20, 'Mine');
      }
    }
  }

  private renderCavernLighting(camera: GameCamera) {
    const { ctx } = this;
    // Ambient dark cavern vignette
    ctx.fillStyle = 'rgba(5, 7, 12, 0.35)';
    ctx.fillRect(0, 0, MINE_CAVERN_WIDTH, MINE_CAVERN_HEIGHT);
  }

  // ==========================================
  // LIVING VILLAGERS & NPC RENDERING
  // ==========================================
  private renderNPCs(
    camera: GameCamera,
    npcs: NPC[],
    hovered: unknown,
    boss?: CaptainBossState | null,
    currentZone: WorldZone = 'overworld'
  ) {
    const { ctx } = this;

    for (const npc of npcs) {
      const isCavernNpc = npc.id === 'npc_miner_cole';
      if (currentZone === 'overworld' && isCavernNpc) continue;
      if (currentZone === 'mine_cavern' && !isCavernNpc) continue;

      const isCaptain = npc.id === 'npc_captain';
      const isCaptainInDuel = !!(isCaptain && boss && boss.isActive);

      const posX = isCaptainInDuel ? boss.x : npc.x;
      const posY = isCaptainInDuel ? boss.y : npc.y;
      const facing = isCaptainInDuel ? boss.facing : npc.facing;
      const width = isCaptainInDuel ? boss.width : npc.width;
      const height = isCaptainInDuel ? boss.height : npc.height;

      if (!camera.isVisible(posX - 40, posY - 50, width + 80, height + 60)) continue;

      const isHovered = !isCaptainInDuel && hovered === npc;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(posX + width / 2, posY + height - 2, isCaptain ? 18 : 14, isCaptain ? 7 : 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const breath = Math.sin(this.time * 2.5 + posX) * 1.5;
      ctx.translate(posX + width / 2, posY + height);

      if (facing === 'left') {
        ctx.scale(-1, 1);
      }

      if (isCaptainInDuel && boss.recoil) {
        ctx.rotate(boss.recoil);
      }

      if (isCaptain) {
        // --- GUARD CAPTAIN RODERICK ---
        this.renderCaptainSprite(boss, breath, isCaptainInDuel);
      } else {
        // --- LIVING VILLAGERS WITH DISTINCT JOBS ---
        const legAngle = npc.walkFrame ? Math.sin(npc.walkFrame) * 0.4 : 0;

        // Legs
        ctx.save();
        ctx.translate(-6, -18);
        ctx.rotate(-legAngle);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-3, 0, 7, 18);
        ctx.restore();

        ctx.save();
        ctx.translate(6, -18);
        ctx.rotate(legAngle);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-3, 0, 7, 18);
        ctx.restore();

        // Torso / Robe / Apron
        ctx.fillStyle = npc.avatarColor;
        ctx.beginPath();
        ctx.roundRect(-12, -42 + breath, 24, 26, 5);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(0, -48 + breath, 10, 0, Math.PI * 2);
        ctx.fill();

        // Job-Specific Equipment & Clothing Accents
        if (npc.id === 'npc_elder') {
          // Grey beard & staff
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(-7, -46 + breath);
          ctx.lineTo(0, -34 + breath);
          ctx.lineTo(7, -46 + breath);
          ctx.fill();

          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(14, -58 + breath);
          ctx.lineTo(14, 0);
          ctx.stroke();
        } else if (npc.id === 'npc_smith') {
          // Red bandana & hammer
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-10, -56 + breath, 20, 6);
          ctx.fillStyle = '#475569';
          ctx.fillRect(12, -36 + breath, 10, 8);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(17, -36 + breath);
          ctx.lineTo(17, -10);
          ctx.stroke();
        } else if (npc.id === 'npc_merchant') {
          // Merchant feathered beret & coin pouch
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(0, -54 + breath, 11, Math.PI, 0, false);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(4, -62 + breath, 3, 10);
        } else if (npc.id === 'npc_farmer_barnaby') {
          // Farmer Straw Hat & rake
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.ellipse(0, -54 + breath, 15, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(14, -52 + breath);
          ctx.lineTo(14, 0);
          ctx.stroke();
        } else if (npc.id === 'npc_farmer_leah') {
          // Farmer Leah: hair band & watering pail
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-8, -55 + breath, 16, 4);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(12, -32 + breath, 8, 10);
        } else if (npc.id === 'npc_woodcutter') {
          // Lumberjack red vest & timber axe
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(-11, -38 + breath, 22, 18);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(12, -44 + breath, 10, 12);
        } else if (npc.id === 'npc_fisherman') {
          // Angler hat & fishing rod
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-10, -54 + breath, 20, 4);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(12, -62 + breath);
          ctx.lineTo(12, 10);
          ctx.stroke();
        } else if (npc.id === 'npc_builder') {
          // Carpenter tool belt & mallet
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-12, -26 + breath, 24, 4);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(12, -34 + breath, 9, 8);
        } else if (npc.id === 'npc_healer') {
          // Herbalist hood & mortar
          ctx.fillStyle = '#7e22ce';
          ctx.beginPath();
          ctx.arc(0, -49 + breath, 12, Math.PI, 0, false);
          ctx.fill();
        } else if (npc.id === 'npc_sentry_jarek') {
          // Guard blue tabard & halberd
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(-4, -64 + breath, 8, 8);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(14, -68 + breath);
          ctx.lineTo(14, 0);
          ctx.stroke();
        } else if (npc.id === 'npc_traveler') {
          // Wandering Bard pink cape & lute
          ctx.fillStyle = '#db2777';
          ctx.beginPath();
          ctx.moveTo(-10, -44 + breath);
          ctx.lineTo(-18, -12);
          ctx.lineTo(-6, -44 + breath);
          ctx.fill();
        }
      }

      ctx.restore();

      // Overhead Name & Job Tag
      if (!isCaptainInDuel) {
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isCaptain ? '#fef08a' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(npc.name, posX + width / 2, posY - 14);

        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = isCaptain ? '#fca5a5' : '#94a3b8';
        ctx.fillText(npc.job, posX + width / 2, posY - 4);
        ctx.shadowBlur = 0;

        if (isHovered) {
          const promptLabel = isCaptain
            ? 'Duel'
            : npc.isMerchant
            ? 'Shop'
            : npc.isBlacksmith
            ? 'Forge'
            : 'Talk';
          this.renderInteractionBadge(posX + width / 2, posY - 30, promptLabel);
        }
      }
    }
  }

  private renderCaptainSprite(boss: CaptainBossState | null | undefined, breath: number, inDuel: boolean | undefined) {
    const { ctx } = this;
    const captainState = inDuel && boss ? boss.state : 'idle';
    const isWindup = captainState === 'windup';
    const isAttacking = captainState === 'attack';
    const isDefeated = captainState === 'defeated';
    const isHurt = captainState === 'hurt';

    // Crimson Commander Cape
    const capeWind = Math.sin(this.time * 4) * 3 + (inDuel && boss?.vx !== 0 ? 8 : 2);
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-14, -46 + breath);
    ctx.lineTo(-24 - capeWind, -10);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-6, -46 + breath);
    ctx.closePath();
    ctx.fill();

    // Greaves
    const legAngle = inDuel && captainState === 'chase' && boss ? Math.sin(boss.walkFrame) * 0.4 : 0;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-10, -22, 8, 22);
    ctx.fillRect(2, -22, 8, 22);

    // Plate Cuirass & Chest
    ctx.fillStyle = isHurt ? '#ef4444' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-15, -48 + breath, 30, 28, 5);
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -46 + breath, 26, 24);

    // Great Helm with Plume
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-10, -64 + breath, 20, 16, 4);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -74 + breath);
    ctx.quadraticCurveTo(8, -78 + breath, 14, -62 + breath);
    ctx.lineTo(8, -64 + breath);
    ctx.closePath();
    ctx.fill();

    // Broadsword
    ctx.save();
    if (isDefeated) {
      ctx.translate(14, 0);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-3, -36, 6, 36);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-8, -37, 16, 4);
    } else if (isWindup) {
      ctx.translate(10, -56 + breath);
      ctx.rotate(-1.3);
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-3, -40, 7, 40);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-9, -2, 19, 5);
      ctx.shadowBlur = 0;
    } else if (isAttacking) {
      ctx.translate(16, -34 + breath);
      ctx.rotate(0.9);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-3, -40, 7, 40);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-9, -2, 19, 5);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -15, 38, -Math.PI * 0.4, Math.PI * 0.5, false);
      ctx.stroke();
    } else {
      ctx.translate(14, -36 + breath);
      ctx.rotate(0.15);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-2.5, 0, 5, 34);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-7, 0, 15, 4);
    }
    ctx.restore();

    if (isWindup) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠', 0, -82 + breath);
    }
  }

  // ==========================================
  // PLAYER CHARACTER KAELEN
  // ==========================================
  private renderPlayer(player: PlayerState) {
    const { ctx } = this;
    const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;

    ctx.save();
    const shadowScale = Math.max(0.3, 1 - player.jumpZ / 120);
    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(
      player.x + player.width / 2,
      player.y + player.height - 2,
      (player.width / 2 + 2) * shadowScale,
      7 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.translate(player.x + player.width / 2, player.y + player.height - player.jumpZ);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const walkCycle = player.walkFrame;
    const legAngle = isMoving && player.isGrounded ? Math.sin(walkCycle) * 0.45 : 0;
    const breath = player.isGrounded && !isMoving ? Math.sin(this.time * 3.5) * 1.5 : 0;
    const inAir = !player.isGrounded;

    // Legs & Boots
    ctx.save();
    ctx.translate(-5, -20);
    ctx.rotate(inAir ? -0.3 : -legAngle);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 7, 12);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, 10, 9, 10);
    ctx.restore();

    ctx.save();
    ctx.translate(5, -20);
    ctx.rotate(inAir ? 0.4 : legAngle);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 0, 7, 12);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, 10, 9, 10);
    ctx.restore();

    // Torso / Equipped Armor
    const hasArmor = player.equipped.armor !== null;
    ctx.fillStyle = hasArmor ? '#475569' : '#334155';
    ctx.beginPath();
    ctx.roundRect(-11, -44 + breath, 22, 26, 5);
    ctx.fill();

    // Pauldron & Chest Strap
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, -22 + breath, 20, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, -23 + breath, 6, 7);

    // Left Arm / Shield
    if (player.equipped.shield) {
      ctx.save();
      ctx.translate(-12, -34 + breath);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Right Arm / Weapon
    const isAttacking = player.isAttacking;
    const armAngle = isAttacking
      ? -1.2 + player.attackTimer * 2.5
      : isMoving
      ? -Math.sin(walkCycle) * 0.5
      : inAir
      ? -0.6
      : 0;

    ctx.save();
    ctx.translate(6, -38 + breath);
    ctx.rotate(armAngle);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-3, 0, 6, 10);

    // Weapon / Blade
    const hasWeapon = player.equipped.weapon !== null;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, 10, 4, hasWeapon ? 22 : 12);

    if (isAttacking) {
      ctx.strokeStyle = player.attackCombo === 2 ? '#38bdf8' : '#fbbf24';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 18, 24, -Math.PI * 0.4, Math.PI * 0.4, false);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Head, Eyes & Original Hairstyle
    ctx.save();
    ctx.translate(0, -50 + breath);
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Amber Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -2, 5, 4);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(4, -2, 3, 4);

    // Hair
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.arc(0, -2, 12, Math.PI * 0.8, Math.PI * 2.2, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-4, -13);
    ctx.lineTo(2, -7);
    ctx.lineTo(8, -14);
    ctx.lineTo(12, -4);
    ctx.lineTo(-2, -3);
    ctx.closePath();
    ctx.fill();

    // Braid
    ctx.strokeStyle = '#172554';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.quadraticCurveTo(-10, 8, -8, 14);
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(-8, 14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // Overhead Health Bar
    const hpRatio = Math.max(0, player.stats.hp / player.stats.maxHp);
    const barW = 36;
    const barH = 5;
    const barX = player.x + (player.width - barW) / 2;
    const barY = player.y - player.jumpZ - 14;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = hpRatio > 0.4 ? '#10b981' : hpRatio > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
  }

  // ==========================================
  // ENVIRONMENT, PROPS & TREES
  // ==========================================
  private renderProps(camera: GameCamera, props: InteractiveProp[], hovered: unknown) {
    const { ctx } = this;
    for (const prop of props) {
      if (prop.type === 'mine_exit' || prop.id === 'prop_quest_pickaxe') continue;
      if (!camera.isVisible(prop.x - 20, prop.y - 20, prop.width + 40, prop.height + 40)) continue;

      const isHovered = hovered === prop;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(prop.x + prop.width / 2, prop.y + prop.height - 4, prop.width / 2 + 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (prop.type === 'dummy') {
        const recoil = prop.recoil || 0;
        ctx.translate(prop.x + prop.width / 2, prop.y + prop.height);
        ctx.rotate(recoil);

        ctx.fillStyle = '#451a03';
        ctx.fillRect(-4, -prop.height, 8, prop.height);

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(-16, -prop.height + 14, 32, 34, 8);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-24, -prop.height + 22, 48, 8);

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -prop.height + 6, 11, 0, Math.PI * 2);
        ctx.fill();

        if (prop.hitHp !== undefined && prop.maxHitHp !== undefined) {
          const hpRatio = Math.max(0, prop.hitHp / prop.maxHitHp);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(-22, -prop.height - 14, 44, 6);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-21, -prop.height - 13, 42 * hpRatio, 4);
        }
      } else if (prop.type === 'well') {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(prop.x + 25, prop.y + 25, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(prop.x + 25, prop.y + 25, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(prop.x, prop.y + 4);
        ctx.lineTo(prop.x + 25, prop.y - 14);
        ctx.lineTo(prop.x + 50, prop.y + 4);
        ctx.closePath();
        ctx.fill();
      } else if (prop.type === 'chest') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(prop.x, prop.y + 10, prop.width, prop.height - 10);
        ctx.fillStyle = prop.isOpen ? '#facc15' : '#92400e';
        ctx.fillRect(prop.x, prop.y + 2, prop.width, 10);
      } else if (prop.type === 'sign') {
        ctx.fillStyle = '#5c2b0c';
        ctx.fillRect(prop.x + 13, prop.y + 16, 6, 32);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(prop.x, prop.y + 4, 32, 18);
      }

      ctx.restore();

      if (isHovered) {
        this.renderInteractionBadge(prop.x + prop.width / 2, prop.y - 12, 'Interact');
      }
    }
  }

  private renderTrees(camera: GameCamera) {
    const { ctx } = this;
    for (const tree of FOREST_TREES) {
      if (!camera.isVisible(tree.x - tree.radius, tree.y - tree.radius * 2, tree.radius * 2, tree.radius * 2 + 30)) {
        continue;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(tree.x, tree.y + 10, tree.radius * 0.85, tree.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3d2010';
      ctx.fillRect(tree.x - 8, tree.y - 15, 16, 28);

      if (tree.type === 'pine') {
        for (let l = 0; l < 3; l++) {
          const ly = tree.y - 15 - l * 24;
          const lRadius = tree.radius * (1 - l * 0.22);
          ctx.fillStyle = l === 2 ? '#14532d' : l === 1 ? '#166534' : '#15803d';
          ctx.beginPath();
          ctx.moveTo(tree.x, ly - 36);
          ctx.lineTo(tree.x - lRadius, ly);
          ctx.lineTo(tree.x + lRadius, ly);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        const sway = Math.sin(this.time * 2 + tree.x * 0.05) * 2;
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(tree.x + sway, tree.y - tree.radius * 0.7, tree.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderParticles(particles: Particle[]) {
    const { ctx } = this;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'text' && p.text) {
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.life * 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Day & Night cycle lighting overlay
   */
  private renderDayNightLighting(camera: GameCamera, phase: 'morning' | 'noon' | 'sunset' | 'night') {
    const { ctx } = this;

    if (phase === 'morning') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.04)';
      ctx.fillRect(camera.x - 20, camera.y - 20, camera.viewportWidth + 40, camera.viewportHeight + 40);
    } else if (phase === 'sunset') {
      ctx.fillStyle = 'rgba(234, 88, 12, 0.12)';
      ctx.fillRect(camera.x - 20, camera.y - 20, camera.viewportWidth + 40, camera.viewportHeight + 40);
    } else if (phase === 'night') {
      // Deep blue twilight wash
      ctx.fillStyle = 'rgba(15, 23, 42, 0.44)';
      ctx.fillRect(camera.x - 20, camera.y - 20, camera.viewportWidth + 40, camera.viewportHeight + 40);

      // Warm radial street lantern glows
      const lamps = [
        { x: 1280, y: 1080, r: 90 }, // well lamp
        { x: 1460, y: 920, r: 100 }, // forge hearth
        { x: 1010, y: 1240, r: 95 }, // tavern lamp
        { x: 1330, y: 1160, r: 85 }, // market stall lamp
      ];

      for (const l of lamps) {
        if (!camera.isVisible(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2)) continue;
        const grad = ctx.createRadialGradient(l.x, l.y, 10, l.x, l.y, l.r);
        grad.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
        grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderWorldBorders(camera: GameCamera) {
    const { ctx } = this;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, WORLD_WIDTH - 40, WORLD_HEIGHT - 40);
  }

  private renderInteractionBadge(x: number, y: number, label: string) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    const w = 76;
    const h = 22;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`[E] ${label}`, x, y - 6);
    ctx.restore();
  }

  // ==========================================
  // STAGE 5: LIVING KINGDOM & KING ALDEN IV
  // ==========================================
  private renderKing(camera: GameCamera, king: KingState, hovered: InteractiveTarget | null) {
    const { ctx } = this;
    if (!camera.isVisible(king.x - 60, king.y - 80, 120, 130)) return;

    ctx.save();
    ctx.translate(king.x, king.y);

    // 1. Royal Dais & Ornate Golden Throne
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-42, -8, 84, 16, 4);
    ctx.fill();

    // Crimson Royal Carpet
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-24, 6, 48, 28);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(-24, 6, 48, 28);

    // Throne Backrest & Gilded Carvings
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-26, -64, 52, 60, 8);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Throne Crest Banner & Heraldry
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-16, -60);
    ctx.lineTo(16, -60);
    ctx.lineTo(12, -40);
    ctx.lineTo(0, -32);
    ctx.lineTo(-12, -40);
    ctx.closePath();
    ctx.fill();

    // 2. Sovereign King Alden IV
    const breath = Math.sin(this.time * 2.5) * 1.5;

    // Crimson Velvet Mantle with Ermine Trim
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.moveTo(-18, -44 + breath);
    ctx.lineTo(-24, -2);
    ctx.lineTo(24, -2);
    ctx.lineTo(18, -44 + breath);
    ctx.closePath();
    ctx.fill();

    // White Ermine Fur Collar
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-16, -46 + breath, 32, 10, 4);
    ctx.fill();
    // Ermine black spots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -43 + breath, 3, 4);
    ctx.fillRect(0, -43 + breath, 3, 4);
    ctx.fillRect(10, -43 + breath, 3, 4);

    // Royal Robes & Tunic
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(-12, -36 + breath, 24, 34);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -36 + breath, 6, 34);

    // Royal Head & Majestic Beard
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -48 + breath, 9, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Silver-White Royal Beard
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-7, -46 + breath);
    ctx.lineTo(0, -32 + breath);
    ctx.lineTo(7, -46 + breath);
    ctx.closePath();
    ctx.fill();

    // Jeweled Gold Crown
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-9, -54 + breath);
    ctx.lineTo(-7, -64 + breath);
    ctx.lineTo(-3, -56 + breath);
    ctx.lineTo(0, -66 + breath);
    ctx.lineTo(3, -56 + breath);
    ctx.lineTo(7, -64 + breath);
    ctx.lineTo(9, -54 + breath);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ruby Crown Gem
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -58 + breath, 2, 0, Math.PI * 2);
    ctx.fill();

    // Golden Royal Scepter in Hand
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -48 + breath);
    ctx.lineTo(14, -14 + breath);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(14, -50 + breath, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Overhead Sovereign Title Tag
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 5;
    ctx.fillText(king.name, king.x, king.y - 74);
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`👑 ${king.title}`, king.x, king.y - 62);
    ctx.shadowBlur = 0;

    if (hovered === king) {
      this.renderInteractionBadge(king.x, king.y - 92, 'Royal Audience');
    }
  }

  private renderVillagers(camera: GameCamera, villagers: KingdomVillager[], hovered: InteractiveTarget | null) {
    const { ctx } = this;

    for (const vil of villagers) {
      if (!camera.isVisible(vil.x - 40, vil.y - 60, 80, 80)) continue;

      ctx.save();
      ctx.translate(vil.x, vil.y);

      const breath = Math.sin(this.time * 3 + vil.x) * 1.5;
      const walkCycle = Math.sin(vil.walkFrame) * 4;

      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs / Shoes
      ctx.fillStyle = '#334155';
      ctx.fillRect(-6 + walkCycle * 0.4, -14, 5, 14);
      ctx.fillRect(2 - walkCycle * 0.4, -14, 5, 14);

      // Body & Attire based on Profession
      if (vil.profession === 'farmer') {
        // Straw hat & Denim dungarees
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-8, -32 + breath, 16, 20);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(0, -42 + breath, 13, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pitchfork
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, -38);
        ctx.lineTo(10, 0);
        ctx.stroke();
      } else if (vil.profession === 'merchant') {
        // Crimson velvet doublet & Beret
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(-9, -32 + breath, 18, 20);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-9, -30 + breath, 18, 4);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -42 + breath, 8, Math.PI, 0);
        ctx.fill();
        // Coin satchel
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(8, -18 + breath, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (vil.profession === 'stonemason') {
        // Leather apron & Heavy mallet
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-9, -32 + breath, 18, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-6, -26 + breath, 12, 14);
        // Stone chisel
        ctx.fillStyle = '#64748b';
        ctx.fillRect(9, -24 + breath, 5, 10);
      } else if (vil.profession === 'blacksmith') {
        // Red smith bandana & Glowing hammer
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-9, -32 + breath, 18, 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -42 + breath, 16, 4);
        // Hammer
        ctx.fillStyle = '#f97316';
        ctx.fillRect(9, -28 + breath, 8, 6);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(13, -24 + breath);
        ctx.lineTo(13, -4);
        ctx.stroke();
      } else if (vil.profession === 'guard') {
        // Chainmail & Spear
        ctx.fillStyle = '#475569';
        ctx.fillRect(-8, -32 + breath, 16, 20);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-8, -32 + breath, 16, 6);
        // Spear
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, -48 + breath);
        ctx.lineTo(10, 0);
        ctx.stroke();
      } else if (vil.profession === 'scholar') {
        // Sapphire robe & Star scroll
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-8, -34 + breath, 16, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -42 + breath, 7, Math.PI, 0);
        ctx.fill();
        // Parchment scroll
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(7, -22 + breath, 6, 8);
      } else if (vil.profession === 'woodcutter') {
        // Flannel vest & Timber axe
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-9, -32 + breath, 18, 20);
        // Axe
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(8, -34 + breath, 8, 8);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, -30 + breath);
        ctx.lineTo(12, -2);
        ctx.stroke();
      } else {
        // Baker: White baker hat & apron
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-8, -32 + breath, 16, 20);
        ctx.beginPath();
        ctx.arc(0, -42 + breath, 8, 0, Math.PI * 2);
        ctx.fill();
        // Golden bread loaf in hands
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, -22 + breath, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -38 + breath, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Villager Name & Profession
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(vil.name, vil.x, vil.y - 48);
      ctx.font = '8px system-ui, sans-serif';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(vil.profession.toUpperCase(), vil.x, vil.y - 38);
      ctx.shadowBlur = 0;

      // Active Speech Bubble
      if (vil.speechBubble) {
        ctx.save();
        const bw = 160;
        const bh = 22;
        const bx = vil.x;
        const by = vil.y - 62;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx - bw / 2, by - bh, bw, bh, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(vil.speechBubble, bx, by - 8);
        ctx.restore();
      }

      if (hovered === vil) {
        this.renderInteractionBadge(vil.x, vil.y - 74, `Talk: ${vil.profession}`);
      }
    }
  }

  // ==========================================
  // STAGE 5: MAGICAL CAT COMPANION
  // ==========================================
  private renderMagicalCat(camera: GameCamera, cat: MagicalCatCompanion, hovered: InteractiveTarget | null) {
    const { ctx } = this;
    if (!camera.isVisible(cat.x - 40, cat.y - 40, 80, 80)) return;

    ctx.save();
    ctx.translate(cat.x, cat.y);

    const isFacingLeft = cat.facing === 'left';
    if (isFacingLeft) ctx.scale(-1, 1);

    const breath = Math.sin(this.time * 4) * 1.2;
    const tailWag = Math.sin(this.time * 5) * 0.35;

    // 1. Magical Trust Aura Halo
    const trustRatio = Math.max(0.15, cat.trust / 100);
    const auraRadius = 24 + trustRatio * 14;
    const auraGrad = ctx.createRadialGradient(0, -10, 4, 0, -10, auraRadius);
    auraGrad.addColorStop(0, cat.auraColor + '55');
    auraGrad.addColorStop(0.7, cat.auraColor + '22');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -10, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Cat Tail (Curled animated tail)
    ctx.save();
    ctx.translate(-14, -10);
    ctx.rotate(-0.4 + tailWag);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -10, -8, -20);
    ctx.stroke();
    // Glowing tail tip
    ctx.fillStyle = cat.auraColor;
    ctx.beginPath();
    ctx.arc(-8, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Cat Body (Sleek midnight/slate coat with starlight speckles)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, -10 + breath, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Starlight Paws with magical glowing sparkles
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-10, -4, 4, 5);
    ctx.fillRect(-2, -4, 4, 5);
    ctx.fillRect(5, -4, 4, 5);
    ctx.fillStyle = cat.auraColor;
    ctx.fillRect(-10, -1, 4, 2);
    ctx.fillRect(5, -1, 4, 2);

    // 5. Cat Head
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(10, -17 + breath, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Ears
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(6, -23 + breath);
    ctx.lineTo(8, -30 + breath);
    ctx.lineTo(12, -24 + breath);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, -23 + breath);
    ctx.lineTo(15, -29 + breath);
    ctx.lineTo(17, -22 + breath);
    ctx.closePath();
    ctx.fill();

    // Luminous Emerald/Star Eyes
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(11, -17 + breath, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pink nose
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(15, -15 + breath, 2, 1.5);

    ctx.restore();

    // Nameplate & Trust Percentage
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f472b6';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 4;
    ctx.fillText(`✨ ${cat.name}`, cat.x, cat.y - 36);
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillStyle = cat.trust >= 80 ? '#facc15' : '#c084fc';
    ctx.fillText(`Trust: ${cat.trust}/100 (${cat.trustLevel})`, cat.x, cat.y - 26);
    ctx.shadowBlur = 0;

    // Speech / Purr Bubble
    if (cat.statusSpeech && cat.statusSpeechTimer && cat.statusSpeechTimer > 0) {
      ctx.save();
      const bw = 170;
      const bh = 22;
      const bx = cat.x;
      const by = cat.y - 48;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = cat.auraColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2, by - bh, bw, bh, 6);
      ctx.fill();
      ctx.stroke();
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#fdf4ff';
      ctx.textAlign = 'center';
      ctx.fillText(cat.statusSpeech, bx, by - 8);
      ctx.restore();
    }

    if (hovered === cat) {
      this.renderInteractionBadge(cat.x, cat.y - 58, 'Care / Feed Cat');
    }
  }

  // ==========================================
  // STAGE 5: COMPREHENSIVE ENEMIES
  // (Bats, Witches, Magic Shields, Sonic Screeches, Ground Troops)
  // ==========================================
  private renderEnemies(camera: GameCamera, enemies: Enemy[], currentZone: WorldZone, hovered: InteractiveTarget | null) {
    const { ctx } = this;

    for (const e of enemies) {
      if (e.zone !== currentZone || e.aiState === 'defeated') continue;
      if (!camera.isVisible(e.x - 50, e.y - 90, e.width + 100, e.height + 120)) continue;

      ctx.save();

      const isFacingLeft = e.facing === 'left';
      const altitude = e.isFlying ? (e.flightAltitude || 35) + Math.sin(this.time * 5 + e.x * 0.1) * 5 : 0;
      const isDiving = e.isDiving || false;

      // 1. Ground Drop Shadow (Scales with altitude)
      const shadowScale = Math.max(0.4, 1 - altitude / 120);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(e.x + e.width / 2, e.y + e.height - 4, (e.width / 2) * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Translate to entity render center (elevated if flying)
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2 - altitude);

      if (isFacingLeft) ctx.scale(-1, 1);
      if (isDiving) ctx.rotate(0.35); // Dive attack angle

      // 2. Render Sprite by Category / Bat / Witch
      if (e.category === 'bat' || e.batVariant) {
        // --- MAGICAL FLYING BAT ---
        const wingFlap = Math.sin(this.time * 16 + e.x) * 0.8;
        const batSize = e.batVariant === 'giant_boss' ? 2.2 : e.batVariant === 'elite' ? 1.5 : e.batVariant === 'large' ? 1.2 : 0.9;

        ctx.save();
        ctx.scale(batSize, batSize);

        // Flapping Left & Right Wings
        ctx.fillStyle = e.batVariant === 'giant_boss' ? '#4c0519' : e.batVariant === 'elite' ? '#311042' : '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;

        // Left Wing
        ctx.save();
        ctx.translate(-4, -2);
        ctx.rotate(wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, -12);
        ctx.lineTo(-26, 4);
        ctx.lineTo(-14, 8);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right Wing
        ctx.save();
        ctx.translate(4, -2);
        ctx.rotate(-wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, -12);
        ctx.lineTo(26, 4);
        ctx.lineTo(14, 8);
        ctx.lineTo(8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Bat Body & Fur
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pointed Bat Ears
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-5, -6);
        ctx.lineTo(-6, -14);
        ctx.lineTo(-1, -8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, -6);
        ctx.lineTo(6, -14);
        ctx.lineTo(1, -8);
        ctx.closePath();
        ctx.fill();

        // Glowing Crimson/Amethyst Eyes
        ctx.fillStyle = e.batVariant === 'giant_boss' ? '#ef4444' : '#e879f9';
        ctx.beginPath();
        ctx.arc(-2, -4, 1.5, 0, Math.PI * 2);
        ctx.arc(2, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Sonic Screech wave effect if attacking
        if (e.specialAbility === 'sonic_screech' && e.attackCooldown > 1.2) {
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(10, 0, 12, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(16, 0, 20, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        ctx.restore();
      } else if (e.category === 'witch' || e.witchLevel) {
        // --- FLYING WITCH ENEMY ---
        const robeWave = Math.sin(this.time * 6) * 2;

        // Magic Broom / Floating Starlight Orbit
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-22, 10);
        ctx.lineTo(22, 6);
        ctx.stroke();
        // Broom bristles
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(-22, 10);
        ctx.lineTo(-32, 6);
        ctx.lineTo(-30, 16);
        ctx.closePath();
        ctx.fill();

        // Flowing Witch Robes
        ctx.fillStyle = e.witchLevel === 'boss' ? '#4a044e' : e.witchLevel === 'commander' ? '#581c87' : '#3b0764';
        ctx.beginPath();
        ctx.moveTo(-10, -12);
        ctx.lineTo(10, -12);
        ctx.lineTo(14 + robeWave, 14);
        ctx.lineTo(-14 - robeWave, 14);
        ctx.closePath();
        ctx.fill();

        // Witch Head & Hood
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -18, 7, 0, Math.PI * 2);
        ctx.fill();

        // Classic Pointed Witch Hat
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(0, -22, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-10, -22);
        ctx.quadraticCurveTo(-2, -38, 4, -46);
        ctx.lineTo(10, -22);
        ctx.closePath();
        ctx.fill();
        // Hat Gold Buckle
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-3, -24, 6, 4);

        // Glowing Arcane Wand
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, -8);
        ctx.lineTo(20, -18);
        ctx.stroke();
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(20, -18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Magic Shield Barrier Bubble
        if (e.hasMagicShield && (e.magicShieldHp || 0) > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.beginPath();
          ctx.arc(0, -6, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        // --- GROUND FORCES (Soldiers, Bandits, Knights, Monsters) ---
        ctx.fillStyle = e.category === 'knight' ? '#334155' : e.category === 'monster' ? '#166534' : '#7f1d1d';
        ctx.fillRect(-e.width / 2, -e.height / 2, e.width, e.height);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-e.width / 2, -e.height / 2, e.width, e.height);
      }

      ctx.restore();

      // 3. Overhead Health Bar & Tier Badge
      const barW = Math.max(34, e.width);
      const barH = 5;
      const barX = e.x + e.width / 2 - barW / 2;
      const barY = e.y - altitude - 14;

      const hpRatio = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = e.tier === 'boss' ? '#e11d48' : e.tier === 'strong' ? '#f97316' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // Name & Level
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = e.tier === 'boss' ? '#f43f5e' : '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText(e.name, e.x + e.width / 2, barY - 4);
      ctx.shadowBlur = 0;

      if (hovered === e) {
        this.renderInteractionBadge(e.x + e.width / 2, barY - 16, 'Attack');
      }
    }
  }

  // ==========================================
  // STAGE 3 & 4: PORTALS & REALMS
  // ==========================================
  private renderPortals(camera: GameCamera, portals: Portal[], currentZone: WorldZone, hovered: InteractiveTarget | null) {
    const { ctx } = this;

    for (const p of portals) {
      if (p.sourceZone !== currentZone) continue;
      if (!camera.isVisible(p.x - 40, p.y - 40, p.width + 80, p.height + 80)) continue;

      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

      const swirl = this.time * 2;
      const portalColor = p.color || '#38bdf8';

      // Outer Magic Ring
      ctx.strokeStyle = portalColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = portalColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling Arc Vortex
      for (let i = 0; i < 4; i++) {
        const arcAngle = swirl + (i * Math.PI) / 2;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 24, arcAngle, arcAngle + 0.8);
        ctx.stroke();
      }

      // Inner Core Gradient
      const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, portalColor);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Portal Label
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 5;
      ctx.fillText(`🌀 ${p.name}`, p.x + p.width / 2, p.y - 14);
      ctx.shadowBlur = 0;

      if (hovered === p) {
        this.renderInteractionBadge(p.x + p.width / 2, p.y - 28, 'Enter Portal');
      }
    }
  }

  // ==========================================
  // OTHER WORLDS TERRAIN (Modern City, Magic Realm, Ancient Ruins)
  // ==========================================
  private renderModernCityTerrain(camera: GameCamera) {
    const { ctx } = this;
    // Dark asphalt metropolis floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 3000, 2000);

    // Neon Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < 3000; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 2000);
      ctx.stroke();
    }
    for (let y = 0; y < 2000; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(3000, y);
      ctx.stroke();
    }

    // High-speed transit avenue
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(400, 900, 2200, 140);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(400, 970);
    ctx.lineTo(2600, 970);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private renderMagicRealmTerrain(camera: GameCamera) {
    const { ctx } = this;
    // Astral Void
    ctx.fillStyle = '#170b2a';
    ctx.fillRect(0, 0, 2800, 2200);

    // Floating Crystalline Landmass
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.roundRect(400, 400, 2000, 1400, 80);
    ctx.fill();

    // Radiant Mana Rivers
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(600, 1100);
    ctx.bezierCurveTo(1100, 900, 1700, 1300, 2200, 1100);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private renderAncientRuinsTerrain(camera: GameCamera) {
    const { ctx } = this;
    // Ancient stone Nexus floor
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 2400, 1800);

    // Overgrown stone pavers
    ctx.fillStyle = '#292524';
    ctx.fillRect(300, 300, 1800, 1200);

    // Monolith Dais Circles
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(1200, 900, 220, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderAnimals(camera: GameCamera, animals: Animal[], zone: WorldZone, hovered: InteractiveTarget | null) {
    const { ctx } = this;
    for (const a of animals) {
      if (a.zone !== zone) continue;
      if (!camera.isVisible(a.x - 30, a.y - 30, a.width + 60, a.height + 60)) continue;

      ctx.save();
      ctx.translate(a.x + a.width / 2, a.y + a.height / 2);
      if (a.facing === 'left') ctx.scale(-1, 1);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, a.height / 2, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animal body
      ctx.fillStyle = a.species === 'wolf' ? '#64748b' : a.species === 'bear' ? '#78350f' : a.species === 'deer' ? '#b45309' : '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(0, 0, a.width / 2, a.height / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Trust Bar
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbcfe8';
      ctx.fillText(`${a.name} (${a.trust}%)`, a.x + a.width / 2, a.y - 10);

      if (hovered === a) {
        this.renderInteractionBadge(a.x + a.width / 2, a.y - 24, 'Befriend / Feed');
      }
    }
  }

  private renderVehicles(camera: GameCamera, vehicles: Vehicle[], zone: WorldZone, hovered: InteractiveTarget | null) {
    const { ctx } = this;
    for (const v of vehicles) {
      if (v.zone !== zone) continue;
      if (!camera.isVisible(v.x - 30, v.y - 30, v.width + 60, v.height + 60)) continue;

      ctx.save();
      ctx.translate(v.x + v.width / 2, v.y + v.height / 2);
      if (v.facing === 'left') ctx.scale(-1, 1);

      ctx.fillStyle = v.color || '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(v.name, v.x + v.width / 2, v.y - 8);

      if (hovered === v && !v.isMounted) {
        this.renderInteractionBadge(v.x + v.width / 2, v.y - 22, 'Mount Vehicle');
      }
    }
  }

  private renderSummons(camera: GameCamera, summons: ActiveSummon[]) {
    const { ctx } = this;
    for (const s of summons) {
      if (!camera.isVisible(s.x - 30, s.y - 30, 60, 60)) continue;

      ctx.save();
      ctx.translate(s.x, s.y);

      // Ethereal Aura
      ctx.strokeStyle = s.auraColor || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = s.auraColor || '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -12, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(0, -12, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.font = 'bold 8px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(s.name, s.x, s.y - 32);
    }
  }

  private renderCityDefenders(camera: GameCamera, defenders: CityDefender[]) {
    const { ctx } = this;
    for (const d of defenders) {
      if (!camera.isVisible(d.x - 30, d.y - 40, 60, 60)) continue;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(d.x - 8, d.y - 26, 16, 26);
    }
  }

  private renderInvadingUnits(camera: GameCamera, invaders: InvadingUnit[]) {
    const { ctx } = this;
    for (const inv of invaders) {
      if (!camera.isVisible(inv.x - 30, inv.y - 40, 60, 60)) continue;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(inv.x - 8, inv.y - 26, 16, 26);
    }
  }
}

