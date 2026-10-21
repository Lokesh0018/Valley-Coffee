"use client";

import { useEffect, useRef } from "react";
import { drawFit, getManifest, loadFrames, type FrameManifest } from "@/lib/frames";
import { loading } from "@/lib/loading";

/**
 * Draws an image sequence into a canvas. Call `seek(0..1)` to pick the frame.
 * If `blockLoader` is true, the intro loader waits for the first ~30 frames.
 *
 * Performance: drawing a plain <img> makes the browser decode it on the main thread at that moment (and it drops
 * decoded frames again under memory pressure), which stutters on every scroll step. So frames near the current one
 * are decoded ahead of time, off the main thread, into ImageBitmaps already scaled to the canvas size (a sliding
 * window either side of the frame on screen); the raw <img> is only a fallback. The draw loop runs only while the
 * canvas is on screen.
 */
export function useFramePlayer(
  folder: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  { fit = "cover", blockLoader = false }: { fit?: "cover" | "contain"; blockLoader?: boolean } = {},
) {
  const progress = useRef(0);
  const api = useRef<{ seek: (p: number) => void }>({ seek: (p) => (progress.current = p) });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const taskId = `frames:${folder}`;
    if (blockLoader) loading.register(taskId);

    const WINDOW = 14; // frames decoded ahead on each side of the current one
    const canBitmap = typeof createImageBitmap === "function";

    let manifest: FrameManifest | null = null;
    let player: ReturnType<typeof loadFrames> | null = null;
    let lastDrawn = -1;
    let lastSrc: CanvasImageSource | undefined;
    let raf = 0;
    let dirty = true;
    let cancelled = false;
    let visible = true;
    let generation = 0; // bumps on resize so stale bitmaps (old size) are dropped
    const bitmaps = new Map<number, ImageBitmap>();
    const pending = new Set<number>();

    const dropBitmaps = () => {
      for (const b of bitmaps.values()) b.close();
      bitmaps.clear();
      pending.clear();
      generation++;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      dirty = true;
      dropBitmaps();
    };

    // the size a frame needs at the canvas size (object-fit maths, so no bitmap is bigger than what is drawn)
    const targetSize = (img: HTMLImageElement) => {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = canvas.width / canvas.height;
      const byWidth = fit === "cover" ? cr > ir : cr < ir;
      const w = byWidth ? canvas.width : Math.round(canvas.height * ir);
      const h = byWidth ? Math.round(canvas.width / ir) : canvas.height;
      // never upscale the source
      const k = Math.min(1, img.naturalWidth / w, img.naturalHeight / h);
      return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) };
    };

    const decode = (i: number) => {
      if (!player || !canBitmap || bitmaps.has(i) || pending.has(i)) return;
      const img = player.images[i];
      if (!img) return;
      pending.add(i);
      const gen = generation;
      const { width, height } = targetSize(img);
      createImageBitmap(img, { resizeWidth: width, resizeHeight: height, resizeQuality: "high" })
        .then((bmp) => {
          pending.delete(i);
          if (cancelled || gen !== generation) {
            bmp.close();
            return;
          }
          bitmaps.set(i, bmp);
          if (i === lastDrawn || lastDrawn < 0) dirty = true;
        })
        .catch(() => pending.delete(i));
    };

    // keep the window around idx decoded, nearest first; drop what is far away
    const prefetch = (idx: number) => {
      if (!manifest || !canBitmap) return;
      for (let d = 0; d <= WINDOW; d++) {
        decode(idx + d);
        if (d) decode(idx - d);
      }
      for (const [i, b] of bitmaps) {
        if (Math.abs(i - idx) > WINDOW * 2) {
          b.close();
          bitmaps.delete(i);
        }
      }
    };

    const render = () => {
      raf = visible ? requestAnimationFrame(render) : 0;
      if (!manifest || !player) return;
      const idx = Math.round(Math.min(1, Math.max(0, progress.current)) * (manifest.count - 1));
      if (idx !== lastDrawn) prefetch(idx);
      const src: CanvasImageSource | undefined = bitmaps.get(idx) ?? player.get(idx);
      if (!src) return;
      if (!dirty && idx === lastDrawn && src === lastSrc) return;
      drawFit(ctx, src, canvas.width, canvas.height, fit);
      lastDrawn = idx;
      lastSrc = src;
      dirty = false;
    };

    api.current.seek = (p: number) => {
      progress.current = p;
    };

    getManifest(folder)
      .then((m) => {
        if (cancelled) return;
        manifest = m;
        const needed = Math.min(30, m.count);
        player = loadFrames(folder, m, (loaded) => {
          if (blockLoader) loading.update(taskId, loaded / needed);
          dirty = true;
          // a frame near the one on screen just arrived: decode it
          if (lastDrawn >= 0) prefetch(lastDrawn);
        });
      })
      .catch((err) => {
        console.warn(err.message);
        if (blockLoader) loading.update(taskId, 1);
      });

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // draw only while the canvas is on screen (a little margin so it is ready when it scrolls in)
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          dirty = true;
          raf = requestAnimationFrame(render);
        }
      },
      { rootMargin: "40% 0px" },
    );
    io.observe(canvas);
    raf = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      player?.cancel();
      dropBitmaps();
    };
  }, [folder, canvasRef, fit, blockLoader]);

  return api;
}
