import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

interface LightningBolt {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  alpha: number;
  decay: number;
  width: number;
  color: string;
}

interface ExplosionEvent {
  x: number;
  y: number;
}

interface LightningEvent {
  x: number;
  y: number;
}

const PARTICLE_COUNT = 40;
const SPARK_COUNT = 20;
const LIGHTNING_BRANCH_CHANCE = 0.3;

const EXPLOSION_COLORS = [
  '#ff6b35',
  '#ff8c42',
  '#ffd166',
  '#ff4757',
  '#ff6348',
  '#ffa502',
  '#ffbe76',
  '#ffffff',
];

const LIGHTNING_COLORS = [
  '#a78bfa',
  '#818cf8',
  '#c4b5fd',
  '#e0e7ff',
  '#ffffff',
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pickColor(): string {
  return EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];
}

function createParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(2, 12);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomBetween(2, 6),
      color: pickColor(),
      alpha: 1,
      decay: randomBetween(0.015, 0.03),
      gravity: 0.08,
    });
  }

  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(6, 18);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomBetween(1, 2),
      color: '#ffffff',
      alpha: 1,
      decay: randomBetween(0.02, 0.045),
      gravity: 0.05,
    });
  }

  return particles;
}

function createLightningBolt(targetX: number, targetY: number, canvasWidth: number): LightningBolt {
  const startX = targetX + randomBetween(-80, 80);
  const startY = 0;
  const segments: LightningBolt['segments'] = [];

  let currentX = startX;
  let currentY = startY;
  const stepCount = Math.floor(randomBetween(8, 15));
  const stepY = targetY / stepCount;

  for (let i = 0; i < stepCount; i++) {
    const nextX = currentX + randomBetween(-40, 40);
    const nextY = currentY + stepY + randomBetween(-10, 10);
    segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });

    if (Math.random() < LIGHTNING_BRANCH_CHANCE) {
      const branchEndX = nextX + randomBetween(-60, 60);
      const branchEndY = nextY + randomBetween(20, 60);
      const clampedBranchX = Math.max(0, Math.min(canvasWidth, branchEndX));
      segments.push({ x1: nextX, y1: nextY, x2: clampedBranchX, y2: branchEndY });
    }

    currentX = nextX;
    currentY = nextY;
  }

  segments.push({ x1: currentX, y1: currentY, x2: targetX, y2: targetY });

  return {
    segments,
    alpha: 1,
    decay: randomBetween(0.03, 0.06),
    width: randomBetween(2, 4),
    color: LIGHTNING_COLORS[Math.floor(Math.random() * LIGHTNING_COLORS.length)],
  };
}

function drawLightningBolt(ctx: CanvasRenderingContext2D, bolt: LightningBolt): void {
  ctx.save();
  ctx.globalAlpha = bolt.alpha;
  ctx.strokeStyle = bolt.color;
  ctx.lineWidth = bolt.width;
  ctx.shadowBlur = 20;
  ctx.shadowColor = bolt.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (const seg of bolt.segments) {
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
  }
  ctx.stroke();

  ctx.lineWidth = bolt.width * 2.5;
  ctx.globalAlpha = bolt.alpha * 0.3;
  ctx.shadowBlur = 40;
  ctx.beginPath();
  for (const seg of bolt.segments) {
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
  }
  ctx.stroke();

  ctx.restore();
}

export function ExplosionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lightningRef = useRef<LightningBolt[]>([]);
  const flashAlphaRef = useRef(0);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (flashAlphaRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = flashAlphaRef.current;
        ctx.fillStyle = '#c4b5fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        flashAlphaRef.current -= 0.06;
        if (flashAlphaRef.current < 0) flashAlphaRef.current = 0;
      }

      const bolts = lightningRef.current;
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i];
        drawLightningBolt(ctx, bolt);
        bolt.alpha -= bolt.decay;
        if (bolt.alpha <= 0) {
          bolts.splice(i, 1);
        }
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.vx *= 0.98;
        particle.alpha -= particle.decay;

        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleExplosion = (event: CustomEvent<ExplosionEvent>) => {
      const { x, y } = event.detail;
      const newParticles = createParticles(x, y);
      particlesRef.current.push(...newParticles);
    };

    const handleLightning = (event: CustomEvent<LightningEvent>) => {
      const { x, y } = event.detail;
      const boltCount = Math.floor(randomBetween(3, 6));
      for (let i = 0; i < boltCount; i++) {
        const delay = i * 50;
        setTimeout(() => {
          lightningRef.current.push(createLightningBolt(x, y, canvas.width));
          if (i === 0) {
            flashAlphaRef.current = 0.25;
          }
        }, delay);
      }
    };

    window.addEventListener('explosion', handleExplosion as EventListener);
    window.addEventListener('lightning', handleLightning as EventListener);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('explosion', handleExplosion as EventListener);
      window.removeEventListener('lightning', handleLightning as EventListener);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export function triggerExplosion(x: number, y: number): void {
  window.dispatchEvent(
    new CustomEvent('explosion', { detail: { x, y } })
  );
}

export function triggerLightning(x: number, y: number): void {
  window.dispatchEvent(
    new CustomEvent('lightning', { detail: { x, y } })
  );
}
