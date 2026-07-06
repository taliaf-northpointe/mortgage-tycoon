import { useEffect, useMemo, useState } from 'react';
import { audioManager } from '../../../audio/AudioManager';
import { Button } from '../../components/Button';
import styles from './AudioSettings.module.css';

interface AudioSettingsProps {
  onBack(): void;
}

export function AudioSettings({ onBack }: AudioSettingsProps) {
  const [state, setState] = useState(() => audioManager.getState());

  useEffect(() => audioManager.subscribe(() => setState(audioManager.getState())), []);

  const settings = state.settings;

  const sliderConfig = useMemo(
    () => [
      { key: 'masterVolume' as const, label: 'Master', value: settings.masterVolume },
      { key: 'musicVolume' as const, label: 'Music', value: settings.musicVolume },
      { key: 'sfxVolume' as const, label: 'Sound Effects', value: settings.sfxVolume },
      { key: 'ambienceVolume' as const, label: 'Ambience', value: settings.ambienceVolume },
    ],
    [settings],
  );

  return (
    <main className={styles.screen}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Audio Settings</p>
            <h1>Shape the room tone</h1>
            <p className={styles.copy}>Fine-tune the soundtrack, ambience, and comfort of your office.</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>

        <div className={styles.controls}>
          {sliderConfig.map((slider) => (
            <label key={slider.key} className={styles.row}>
              <span className={styles.label}>{slider.label}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={slider.value}
                onChange={(event) =>
                  audioManager.setSettings({
                    [slider.key]: Number(event.target.value),
                  } as Partial<typeof settings>)
                }
              />
              <span className={styles.value}>{Math.round(slider.value * 100)}%</span>
            </label>
          ))}
        </div>

        <div className={styles.toggles}>
          <Toggle label="Mute Music" checked={settings.muteMusic} onChange={() => audioManager.toggleMute('music')} />
          <Toggle label="Mute Sound Effects" checked={settings.muteSfx} onChange={() => audioManager.toggleMute('sfx')} />
          <Toggle label="Mute Ambience" checked={settings.muteAmbience} onChange={() => audioManager.toggleMute('ambience')} />
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={() => audioManager.playCue('notification')}>
            Test sound
          </Button>
          <Button onClick={() => audioManager.muteAll()}>Mute all</Button>
          <Button variant="ghost" onClick={() => audioManager.resetSettings()}>
            Reset
          </Button>
        </div>
      </section>
    </main>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange(): void }) {
  return (
    <label className={styles.toggleRow}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}
