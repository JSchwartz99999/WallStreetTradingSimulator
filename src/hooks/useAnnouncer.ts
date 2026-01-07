import { useCallback, useRef } from 'react';

/**
 * Hook for screen reader announcements
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    // Try to find the announcer element
    let announcer = announcerRef.current;

    if (!announcer) {
      announcer = document.getElementById('sr-announce') as HTMLDivElement;
      announcerRef.current = announcer;
    }

    if (announcer) {
      // Clear and set new message to trigger announcement
      announcer.textContent = '';
      announcer.setAttribute('aria-live', politeness);

      // Use requestAnimationFrame to ensure the DOM updates
      requestAnimationFrame(() => {
        if (announcer) {
          announcer.textContent = message;
        }
      });

      // Clear after announcement
      setTimeout(() => {
        if (announcer) {
          announcer.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
}
