import { useSettingsStore } from '@/store/settingsStore';
import { Button } from './Button';

export function SoundToggle() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSound}
      aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </Button>
  );
}
