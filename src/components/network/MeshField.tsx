import * as React from 'react';
import { prefersReducedMotion } from '@/lib/scramble';

/**
 * The map's living background, carried over from the legacy dashboard: a jittered
 * triangle mesh that breathes on simplex noise, a faint twinkling starfield with a
 * touch of parallax, and a heat trail that lights the triangles the cursor passes
 * over (faster cursor → wider, hotter trail).
 *
 * It is art, not data, and it says so: it never encodes state. Colours come from the
 * theme tokens (violet in dusk, warm umber in golden hour). Under reduced motion it
 * draws one still frame and ignores the cursor.
 */
export function MeshField({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = target.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const still = prefersReducedMotion();

    /* ── theme colours, re-read when the theme flips ── */
    let warm = false;
    let meshColor = '#a855f7';
    let starColor = '#b4b4d2';
    const readTheme = () => {
      const root = document.documentElement;
      warm = root.dataset.theme === 'warm';
      const cs = getComputedStyle(root);
      meshColor = warm ? 'rgb(170, 125, 85)' : cs.getPropertyValue('--primary').trim() || meshColor;
      starColor = warm ? 'rgb(80, 70, 55)' : 'rgb(180, 180, 210)';
    };
    readTheme();
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ── simplex noise (2D, public domain) ── */
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const perm = new Uint8Array(512);
    {
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    }
    const noise2D = (xin: number, yin: number) => {
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const x0 = xin - (i - t);
      const y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0;
      const j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2;
      const y2 = y0 - 1 + 2 * G2;
      const ii = i & 255;
      const jj = j & 255;
      let n0 = 0, n1 = 0, n2 = 0;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 > 0) { t0 *= t0; const g = grad3[perm[ii + perm[jj]] & 7]; n0 = t0 * t0 * (g[0] * x0 + g[1] * y0); }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) { t1 *= t1; const g = grad3[perm[ii + i1 + perm[jj + j1]] & 7]; n1 = t1 * t1 * (g[0] * x1 + g[1] * y1); }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) { t2 *= t2; const g = grad3[perm[ii + 1 + perm[jj + 1]] & 7]; n2 = t2 * t2 * (g[0] * x2 + g[1] * y2); }
      return 70 * (n0 + n1 + n2);
    };

    /* ── geometry ── */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let homeX = new Float32Array(0), homeY = new Float32Array(0);
    let px = new Float32Array(0), py = new Float32Array(0);
    let tris = new Uint16Array(0);
    let triCX = new Float32Array(0), triCY = new Float32Array(0), heat = new Float32Array(0);
    type Star = { x: number; y: number; size: number; alpha: number; speed: number; phase: number };
    let stars: Star[] = [];

    const build = () => {
      const rect = host.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = 28, rows = 18;
      const cw = w / cols, ch = h / rows;
      const n = (cols + 1) * (rows + 1);
      homeX = new Float32Array(n); homeY = new Float32Array(n);
      px = new Float32Array(n); py = new Float32Array(n);
      for (let r = 0, k = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++, k++) {
          const edge = r === 0 || r === rows || c === 0 || c === cols;
          homeX[k] = c * cw + (edge ? 0 : (Math.random() - 0.5) * cw * 0.5);
          homeY[k] = r * ch + (edge ? 0 : (Math.random() - 0.5) * ch * 0.5);
        }
      }
      const list: number[] = [];
      const stride = cols + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tl = r * stride + c, tr = tl + 1, bl = tl + stride, br = bl + 1;
          if ((r + c) % 2 === 0) list.push(tl, tr, bl, tr, br, bl);
          else list.push(tl, tr, br, tl, br, bl);
        }
      }
      tris = new Uint16Array(list);
      const tc = tris.length / 3;
      triCX = new Float32Array(tc); triCY = new Float32Array(tc); heat = new Float32Array(tc);
      for (let i = 0; i < tc; i++) {
        const a = tris[i * 3], b = tris[i * 3 + 1], c = tris[i * 3 + 2];
        triCX[i] = (homeX[a] + homeX[b] + homeX[c]) / 3;
        triCY[i] = (homeY[a] + homeY[b] + homeY[c]) / 3;
      }
      stars = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.015 + Math.random() * 0.03,
        speed: 3 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    /* ── cursor ── */
    let mx = -1000, my = -1000, rawSpeed = 0, speed = 0;
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      if (mx > -500) rawSpeed = Math.hypot(nx - mx, ny - my);
      mx = nx;
      my = ny;
    };
    const onLeave = () => { mx = -1000; my = -1000; rawSpeed = 0; speed = 0; };

    /* ── frame ── */
    const displace = (time: number) => {
      const tOff = time * 0.00015;
      const cursor = mx > -500;
      for (let i = 0; i < homeX.length; i++) {
        const hx = homeX[i] * 0.003, hy = homeY[i] * 0.003;
        let x = homeX[i] + noise2D(hx, hy + tOff) * 4;
        let y = homeY[i] + noise2D(hx + 100, hy + tOff) * 4;
        if (cursor) {
          const dx = x - mx, dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 40000) {
            const pull = 1 - Math.sqrt(d2) / 200;
            const k = pull * pull * 0.18;
            x -= dx * k;
            y -= dy * k;
          }
        }
        px[i] = x;
        py[i] = y;
      }
    };

    const updateHeat = (dt: number) => {
      const lerp = rawSpeed > speed ? 1 - Math.pow(0.0001, dt) : 1 - Math.pow(0.005, dt);
      speed += (rawSpeed - speed) * lerp;
      rawSpeed = 0;
      const decay = Math.pow(0.05, dt);
      for (let i = 0; i < heat.length; i++) {
        heat[i] *= decay;
        if (heat[i] < 0.001) heat[i] = 0;
      }
      if (mx < -500) return;
      const boost = Math.min(speed / 8, 1);
      const radius = 130 + boost * 100;
      const r2 = radius * radius;
      const mul = 0.2 + boost * 1.3;
      let hot = 0;
      for (let i = 0; i < heat.length; i++) {
        const dx = triCX[i] - mx, dy = triCY[i] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 <= r2) {
          const prox = 1 - Math.sqrt(d2) / radius;
          const target = Math.min(prox * prox * mul, 1.5);
          if (target > heat[i]) heat[i] = target;
        }
        if (heat[i] > 0.003) hot++;
      }
      if (hot > 120) for (let i = 0; i < heat.length; i++) heat[i] *= 0.7;
    };

    const drawStars = (time: number) => {
      const offX = mx > -500 ? (mx - w / 2) * 0.02 : 0;
      const offY = mx > -500 ? (my - h / 2) * 0.02 : 0;
      ctx.fillStyle = starColor;
      for (const s of stars) {
        ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin((time / 1000) * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x + offX, s.y + offY, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawMesh = () => {
      const baseFill = warm ? 0.03 : 0.02;
      const baseStroke = warm ? 0.05 : 0.035;
      ctx.lineWidth = 0.5;
      ctx.fillStyle = meshColor;
      ctx.strokeStyle = meshColor;
      for (let i = 0; i < heat.length; i++) {
        const fillA = Math.min(baseFill + heat[i] * (warm ? 0.12 : 0.15), warm ? 0.12 : 1);
        const strokeA = Math.min(baseStroke + heat[i] * (warm ? 0.18 : 0.2), warm ? 0.18 : 1);
        const a = tris[i * 3], b = tris[i * 3 + 1], c = tris[i * 3 + 2];
        ctx.beginPath();
        ctx.moveTo(px[a], py[a]);
        ctx.lineTo(px[b], py[b]);
        ctx.lineTo(px[c], py[c]);
        ctx.closePath();
        ctx.globalAlpha = fillA;
        ctx.fill();
        ctx.globalAlpha = strokeA;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      ctx.clearRect(0, 0, w, h);
      displace(now);
      updateHeat(dt);
      drawStars(now);
      drawMesh();
      if (!still) raf = requestAnimationFrame(frame);
    };

    build();
    const ro = new ResizeObserver(() => {
      build();
      if (still) frame(performance.now());
    });
    ro.observe(host);
    if (!still) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [target]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />;
}
