/**
 * Hidden element for screen reader announcements
 */
export function ScreenReaderAnnouncer() {
  return (
    <div
      id="sr-announce"
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  );
}
