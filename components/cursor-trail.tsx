"use client";

import { useEffect, useRef } from "react";
import { useCursorTrail } from "./cursor-trail-provider";

interface Point {
  x: number;
  y: number;
  time: number;
}

const MAX_POINTS = 80;
const TRAIL_LIFETIME = 500; // ms
const POINT_SPACING = 3; // min px between recorded points
const MAX_WIDTH = 8; // px at the cursor end
const MIN_WIDTH = 0.5; // px at the tail end

/** Read the current --primary HSL value and return it as an "h, s%, l%" string */
function getPrimaryHSL(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  if (!raw) return "270, 60%, 50%";
  const parts = raw.split(/\s+/);
  if (parts.length >= 3) return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
  return raw;
}

export function CursorTrail() {
  const { cursorTrail } = useCursorTrail();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const hslRef = useRef("270, 60%, 50%");

  useEffect(() => {
    if (!cursorTrail) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);

    const colorInterval = setInterval(() => {
      hslRef.current = getPrimaryHSL();
    }, 1000);
    hslRef.current = getPrimaryHSL();

    let lastX = -100;
    let lastY = -100;

    function tick() {
      if (!canvas || !ctx) return;
      const now = performance.now();
      const { x, y } = mouseRef.current;

      // Record point if cursor moved enough
      const dx = x - lastX;
      const dy = y - lastY;
      if (dx * dx + dy * dy >= POINT_SPACING * POINT_SPACING) {
        pointsRef.current.push({ x, y, time: now });
        lastX = x;
        lastY = y;
        if (pointsRef.current.length > MAX_POINTS) {
          pointsRef.current = pointsRef.current.slice(-MAX_POINTS);
        }
      }

      // Prune expired points
      const cutoff = now - TRAIL_LIFETIME;
      const pts = pointsRef.current;
      let start = 0;
      while (start < pts.length && pts[start].time < cutoff) start++;
      if (start > 0) pointsRef.current = pts.slice(start);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const trail = pointsRef.current;
      if (trail.length < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const hsl = hslRef.current;

      // Draw the trail as a series of thick line segments with tapering width and fading alpha
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];

        // t goes from 0 (oldest visible) to 1 (newest / cursor)
        const t = i / (trail.length - 1);

        // Age-based fade for the older point
        const age0 = now - p0.time;
        const ageFade = 1 - Math.min(age0 / TRAIL_LIFETIME, 1);

        const alpha = t * ageFade;
        const width = MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * t;

        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineWidth = width;
        ctx.strokeStyle = `hsla(${hsl}, ${alpha * 0.85})`;
        ctx.stroke();

        // Soft glow layer
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineWidth = width * 3;
        ctx.strokeStyle = `hsla(${hsl}, ${alpha * 0.12})`;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      clearInterval(colorInterval);
      pointsRef.current = [];
    };
  }, [cursorTrail]);

  if (!cursorTrail) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}
