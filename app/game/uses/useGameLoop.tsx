"use client";

import { useEffect, useRef } from "react";

export function useGameLoop(callback: (delta: number) => void) {
  const cbRef = useRef(callback);

  // keep latest callback in ref to avoid re-subscribing RAF
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let rafId = 0;
    let last = 0;

    function loop(time: number) {
      if (!last) last = time;
      const delta = time - last;
      last = time;
      try {
        cbRef.current(delta);
      } catch (err) {
        // protect the loop from errors in the callback
        // eslint-disable-next-line no-console
        console.error("useGameLoop callback error:", err);
      }
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
