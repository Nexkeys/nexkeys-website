'use client';

import { useEffect, useRef } from 'react';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * FOOTER STORM — procedural gold lightning.
 *
 * Not a gif, not an emoji: every bolt is generated at runtime by recursive
 * midpoint displacement, drawn with additive glow, and given a short
 * multi-stage flash (strike → afterglow → occasional re-strike) so no two
 * are ever the same. A sheet-lightning bloom lights the whole footer a beat
 * before the bolt lands, which is what sells it as real weather.
 *
 * Performance guards:
 *  · Off entirely under prefers-reduced-motion and on low-power devices.
 *  · IntersectionObserver — no RAF while the footer is off-screen.
 *  · Pauses on tab blur.
 *  · DPR capped at 1.5.
 */

interface Point {
  x: number;
  y: number;
}

/** Recursive midpoint displacement — the classic lightning algorithm. */
function generateBolt(start: Point, end: Point, displace: number, detail = 5): Point[] {
  if (detail <= 0) return [start, end];

  const mid: Point = {
    x: (start.x + end.x) / 2 + (Math.random() - 0.5) * displace,
    y: (start.y + end.y) / 2 + (Math.random() - 0.5) * displace * 0.35,
  };

  return [
    ...generateBolt(start, mid, displace / 2, detail - 1).slice(0, -1),
    ...generateBolt(mid, end, displace / 2, detail - 1),
  ];
}

interface Strike {
  segments: Point[][];
  born: number;
  life: number;
  /** 0–1 overall brightness of this strike. */
  power: number;
  flashes: number[];
}

export function FooterStorm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canHeavy, reduced, ready } = useCapabilities();

  useEffect(() => {
    if (!ready || reduced || !canHeavy) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const strikes: Strike[] = [];
    let nextStrikeAt = performance.now() + 900;
    let rafId = 0;
    let running = false;

    const spawnStrike = (now: number) => {
      // Bolts fall from just above the footer's top edge.
      const originX = w * (0.08 + Math.random() * 0.84);
      const start: Point = { x: originX, y: -20 };
      const end: Point = {
        x: originX + (Math.random() - 0.5) * w * 0.3,
        y: h * (0.45 + Math.random() * 0.4),
      };

      const main = generateBolt(start, end, w * 0.14, 6);
      const segments: Point[][] = [main];

      // Forks — branch off random points on the main channel.
      const forkCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < forkCount; i++) {
        const idx = Math.floor(main.length * (0.25 + Math.random() * 0.5));
        const from = main[idx];
        if (!from) continue;
        const to: Point = {
          x: from.x + (Math.random() - 0.5) * w * 0.22,
          y: from.y + h * (0.12 + Math.random() * 0.25),
        };
        segments.push(generateBolt(from, to, w * 0.06, 4));
      }

      // 1–3 flashes: strike, then flicker.
      const flashCount = 1 + Math.floor(Math.random() * 3);
      const flashes = Array.from({ length: flashCount }, (_, i) =>
        i === 0 ? 0 : 90 + Math.random() * 190 * i
      );

      strikes.push({
        segments,
        born: now,
        life: 620 + Math.random() * 460,
        power: 0.55 + Math.random() * 0.45,
        flashes,
      });
    };

    const drawBolt = (points: Point[], alpha: number, width: number, power: number) => {
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer bloom
      ctx.shadowBlur = 34 * power;
      ctx.shadowColor = `rgba(201,162,39,${0.85 * alpha})`;
      ctx.strokeStyle = `rgba(201,162,39,${0.42 * alpha})`;
      ctx.lineWidth = width * 3.4;
      ctx.stroke();

      // Mid glow
      ctx.shadowBlur = 18 * power;
      ctx.shadowColor = `rgba(232,188,44,${0.9 * alpha})`;
      ctx.strokeStyle = `rgba(240,204,80,${0.7 * alpha})`;
      ctx.lineWidth = width * 1.7;
      ctx.stroke();

      // Hot core
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(255,246,214,${alpha})`;
      ctx.strokeStyle = `rgba(255,250,232,${0.95 * alpha})`;
      ctx.lineWidth = width;
      ctx.stroke();

      ctx.shadowBlur = 0;
    };

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);

      if (now >= nextStrikeAt) {
        spawnStrike(now);
        // Irregular cadence — real storms are not metronomes.
        nextStrikeAt = now + 2600 + Math.random() * 6200;
      }

      ctx.globalCompositeOperation = 'lighter';

      for (let i = strikes.length - 1; i >= 0; i--) {
        const s = strikes[i];
        const age = now - s.born;

        if (age > s.life) {
          strikes.splice(i, 1);
          continue;
        }

        // Sum the contribution of each flash in this strike.
        let intensity = 0;
        for (const offset of s.flashes) {
          const t = age - offset;
          if (t < 0 || t > 320) continue;
          intensity = Math.max(intensity, Math.pow(1 - t / 320, 2.4));
        }
        if (intensity <= 0.01) continue;

        const alpha = intensity * s.power;

        // Sheet-lightning bloom behind the bolt.
        const bloom = ctx.createRadialGradient(
          s.segments[0][0].x,
          0,
          0,
          s.segments[0][0].x,
          0,
          h * 1.2
        );
        bloom.addColorStop(0, `rgba(201,162,39,${0.14 * alpha})`);
        bloom.addColorStop(0.5, `rgba(139,105,20,${0.05 * alpha})`);
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, w, h);

        // Main channel, then thinner forks.
        drawBolt(s.segments[0], alpha, 1.9, s.power);
        for (let f = 1; f < s.segments.length; f++) {
          drawBolt(s.segments[f], alpha * 0.62, 1.05, s.power * 0.8);
        }
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, w, h);
    };

    // Only animate while visible.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready, reduced, canHeavy]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
