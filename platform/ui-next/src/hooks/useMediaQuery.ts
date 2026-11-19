import { useSyncExternalStore } from 'react';

/**
 * Tracks whether a CSS media query currently matches and re-renders the
 * caller whenever that changes (for example when the window is resized
 * across a breakpoint or a pointing device is attached).
 *
 * @param query a media query string, e.g. `(max-width: 1023.98px)`
 * @returns true while the query matches
 */
export default function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener('change', onChange);

    return () => {
      mediaQueryList.removeEventListener('change', onChange);
    };
  };

  const getSnapshot = () => window.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot);
}
