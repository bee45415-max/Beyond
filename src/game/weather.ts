import { WeatherType, WorldZone, WeatherInfo } from './types';
import { soundManager } from './audio';

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  length?: number;
  alpha: number;
  wobble: number;
  wobbleSpeed: number;
  depth: number; // 0 (background) to 1 (foreground)
}

export interface GroundSplash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  vx: number;
  vy: number;
}

export class WeatherSystem {
  public current: WeatherType = 'clear';
  public targetWeather: WeatherType = 'clear';
  public timer: number = 0;
  public duration: number = 45; // 45 seconds per weather phase
  public intensity: number = 0; // 0 (none) to 1 (full storm)
  public windSpeed: number = 40; // horizontal wind drift
  public windDirection: number = 1; // 1 = right, -1 = left

  // Storm effects
  public lightningTimer: number = 0;
  public lightningAlpha: number = 0;

  // Particle pools
  public particles: WeatherParticle[] = [];
  public splashes: GroundSplash[] = [];
  private maxParticles: number = 180;
  private timeElapsed: number = 0;

  // Callbacks
  public onWeatherChange?: (weather: WeatherType, notification: string) => void;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 720;

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(screenW, screenH, true));
    }
  }

  private createParticle(screenW: number, screenH: number, randomY: boolean = false): WeatherParticle {
    const depth = 0.3 + Math.random() * 0.7;
    return {
      x: Math.random() * (screenW + 200) - 100,
      y: randomY ? Math.random() * screenH : -30 - Math.random() * 50,
      vx: (30 + Math.random() * 40) * depth,
      vy: 100 + Math.random() * 200,
      size: 1.5 + Math.random() * 2.5 * depth,
      length: 12 + Math.random() * 14 * depth,
      alpha: 0.4 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.5 + Math.random() * 2,
      depth,
    };
  }

  /**
   * Main weather system update cycle
   */
  public update(dt: number, currentZone: WorldZone, viewportWidth: number, viewportHeight: number) {
    this.timeElapsed += dt;
    this.timer += dt;

    // Wind oscillation (gentle natural breeze shifting over time)
    this.windSpeed = 35 + Math.sin(this.timeElapsed * 0.25) * 35;

    // Periodic toggling: cycle clear -> rain -> clear -> snow -> clear
    if (this.timer >= this.duration) {
      this.timer = 0;
      this.cycleToNextWeather();
    }

    // Weather transition ramp
    const isSheltered = currentZone === 'mine_cavern';
    const targetIntensity = isSheltered ? 0 : 1.0;

    if (this.intensity < targetIntensity) {
      this.intensity = Math.min(targetIntensity, this.intensity + dt * 0.4);
    } else if (this.intensity > targetIntensity) {
      this.intensity = Math.max(targetIntensity, this.intensity - dt * 0.4);
    }

    // Lightning simulation during rain
    if (this.current === 'rain' && !isSheltered && this.intensity > 0.4) {
      this.lightningTimer += dt;
      if (this.lightningTimer > 14 + Math.sin(this.timeElapsed) * 5) {
        this.lightningTimer = 0;
        this.lightningAlpha = 0.32;
        soundManager.playThunder?.();
      }
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 3.5);
    }

    // Update particles based on active weather state
    const width = Math.max(400, viewportWidth);
    const height = Math.max(300, viewportHeight);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.current === 'rain') {
        // Fast falling slanted rain streaks
        const fallSpeed = (650 + p.depth * 250) * dt;
        const drift = (this.windSpeed + 50) * dt;

        p.y += fallSpeed;
        p.x += drift;

        // Ground splash check
        if (p.y > height - 10) {
          if (Math.random() < 0.28 && !isSheltered && this.splashes.length < 35) {
            this.splashes.push({
              x: p.x,
              y: p.y,
              radius: 1,
              maxRadius: 4 + p.depth * 5,
              alpha: 0.65,
              vx: (Math.random() - 0.5) * 40,
              vy: -15 - Math.random() * 25,
            });
          }
          // Wrap to top
          p.y = -20 - Math.random() * 40;
          p.x = Math.random() * (width + 300) - 150;
        }
      } else if (this.current === 'snow') {
        // Soft floating snowflakes with horizontal sine-wave wobble
        p.wobble += p.wobbleSpeed * dt;
        const wobbleX = Math.sin(p.wobble) * 28 * dt;
        const drift = (this.windSpeed * 0.4 + 10) * dt;
        const fallSpeed = (55 + p.depth * 65) * dt;

        p.y += fallSpeed;
        p.x += drift + wobbleX;

        // Wrap to top
        if (p.y > height + 20) {
          p.y = -15 - Math.random() * 30;
          p.x = Math.random() * (width + 200) - 100;
        }
      } else {
        // Clear: ambient warm golden sun motes / floating pollen
        p.wobble += dt * 1.5;
        p.y -= (12 + p.depth * 14) * dt; // drifts gently upward
        p.x += (Math.sin(p.wobble) * 16 + 10) * dt;

        if (p.y < -30) {
          p.y = height + Math.random() * 40;
          p.x = Math.random() * width;
        }
      }

      // Horizontal wrapping
      if (p.x > width + 150) {
        p.x = -100;
      } else if (p.x < -150) {
        p.x = width + 100;
      }
    }

    // Update ground splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.radius += dt * 18;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.alpha -= dt * 2.8;

      if (s.alpha <= 0 || s.radius >= s.maxRadius) {
        this.splashes.splice(i, 1);
      }
    }
  }

  /**
   * Cycle to next weather condition in sequence
   */
  public cycleToNextWeather() {
    let next: WeatherType = 'clear';
    let message = '';

    if (this.current === 'clear') {
      // Toggle to rain or snow based on cycle
      if (Math.random() > 0.5) {
        next = 'rain';
        message = '🌧️ Storm clouds gather! Refreshing rain sweeps across the land.';
      } else {
        next = 'snow';
        message = '❄️ A crystalline chill fills the air! Soft snowflakes begin to fall.';
      }
    } else if (this.current === 'rain') {
      next = 'clear';
      message = '☀️ The rain subsides as warm golden sunlight illuminates the kingdom.';
    } else {
      next = 'clear';
      message = '☀️ Winter flurries clear as gentle sunshine warms the realm.';
    }

    this.setWeather(next, message);
  }

  /**
   * Manually or programmatically set weather
   */
  public setWeather(type: WeatherType, customNotification?: string) {
    if (this.current === type) return;

    this.current = type;
    this.timer = 0;
    this.intensity = 0.15; // smooth ramp up

    let note = customNotification;
    if (!note) {
      if (type === 'rain') {
        note = '🌧️ Rain begins to fall across the realm!';
      } else if (type === 'snow') {
        note = '❄️ Snow flurries swirl through the skies!';
      } else {
        note = '☀️ Clear skies return to Oakhaven!';
      }
    }

    if (this.onWeatherChange) {
      this.onWeatherChange(type, note);
    }
  }

  /**
   * Interactive cycling between clear, rain, snow
   */
  public cycleWeather(): WeatherType {
    let next: WeatherType = 'clear';
    if (this.current === 'clear') next = 'rain';
    else if (this.current === 'rain') next = 'snow';
    else next = 'clear';

    this.setWeather(next);
    return next;
  }

  /**
   * Provides UI details for display badges
   */
  public getWeatherInfo(): WeatherInfo {
    switch (this.current) {
      case 'rain':
        return {
          type: 'rain',
          name: 'Rainy Shower',
          icon: 'cloud-rain',
          description: 'Crops nourish quickly. Puddles form on village cobblestones.',
        };
      case 'snow':
        return {
          type: 'snow',
          name: 'Snowy Flurries',
          icon: 'snowflake',
          description: 'Frost glitters on pine trees. Cold winds sweep across the valleys.',
        };
      case 'clear':
      default:
        return {
          type: 'clear',
          name: 'Clear Skies',
          icon: 'sun',
          description: 'Bright sunshine and calm gentle breezes over the kingdom.',
        };
    }
  }
}
