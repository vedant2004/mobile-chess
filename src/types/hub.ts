export type ActiveView = 'hub' | 'chess' | 'solitaire' | 'balloon';

export interface GlobalSettings {
  soundEnabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  theme: 'dark' | 'light';
}
