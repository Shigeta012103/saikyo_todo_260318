import { useCallback, useRef } from 'react';

const SHAKE_DURATION_MS = 400;
const SHAKE_INTENSITY = 12;
const SHAKE_INTERVAL_MS = 16;

export function useScreenShake(): () => void {
  const shakeTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const shake = useCallback(() => {
    const root = document.getElementById('root');
    if (!root) return;

    if (shakeTimerRef.current) {
      clearInterval(shakeTimerRef.current);
    }

    const startTime = Date.now();

    shakeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / SHAKE_DURATION_MS;

      if (progress >= 1) {
        clearInterval(shakeTimerRef.current);
        root.style.transform = '';
        return;
      }

      const dampening = 1 - progress;
      const offsetX = (Math.random() - 0.5) * 2 * SHAKE_INTENSITY * dampening;
      const offsetY = (Math.random() - 0.5) * 2 * SHAKE_INTENSITY * dampening;
      root.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }, SHAKE_INTERVAL_MS);
  }, []);

  return shake;
}
