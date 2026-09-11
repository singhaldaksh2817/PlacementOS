export type ThemeId = 'midnight' | 'emerald' | 'charcoal' | 'navy' | 'graphite';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  text: string;
  textMuted: string;
  previewColors: [string, string, string]; // bg, primary, secondary
  lightColorHex: number; // for Three.js lighting
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight + Electric Cyan',
    tagline: 'Futuristic deep dark cyan theme',
    bg: '#080C12',
    surface: '#101720',
    surfaceHover: '#16212C',
    border: '#243241',
    primary: '#22D3EE',
    secondary: '#38BDF8',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#FB7185',
    text: '#F8FAFC',
    textMuted: '#8B9AAA',
    previewColors: ['#080C12', '#22D3EE', '#38BDF8'],
    lightColorHex: 0x22d3ee,
  },
  emerald: {
    id: 'emerald',
    name: 'Off-White + Deep Green',
    tagline: 'Clean organic editorial theme',
    bg: '#F7F5EF',
    surface: '#FFFFFF',
    surfaceHover: '#F4F2EC',
    border: '#D3D8D2',
    primary: '#164A41',
    secondary: '#2E8B72',
    success: '#2D7A58',
    warning: '#C8831A',
    error: '#C94A4A',
    text: '#121A18',
    textMuted: '#52605C',
    previewColors: ['#F7F5EF', '#164A41', '#2E8B72'],
    lightColorHex: 0x164a41,
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal + Orange',
    tagline: 'High-contrast dark orange theme',
    bg: '#101010',
    surface: '#191919',
    surfaceHover: '#242424',
    border: '#343434',
    primary: '#FF6B35',
    secondary: '#FF8E53',
    success: '#49C878',
    warning: '#FFB703',
    error: '#FF5C5C',
    text: '#F5F5F5',
    textMuted: '#A3A3A3',
    previewColors: ['#101010', '#FF6B35', '#FF8E53'],
    lightColorHex: 0xff6b35,
  },
  navy: {
    id: 'navy',
    name: 'Deep Navy + Lime',
    tagline: 'Vibrant neon lime on deep navy',
    bg: '#07111F',
    surface: '#0D1B2A',
    surfaceHover: '#13263A',
    border: '#23394D',
    primary: '#A3E635',
    secondary: '#84CC16',
    success: '#4ADE80',
    warning: '#FACC15',
    error: '#FB7185',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    previewColors: ['#07111F', '#A3E635', '#84CC16'],
    lightColorHex: 0xa3e635,
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite + Coral',
    tagline: 'Sleek dark graphite with coral accent',
    bg: '#141318',
    surface: '#201F26',
    surfaceHover: '#292831',
    border: '#393640',
    primary: '#FF6B6B',
    secondary: '#FF8E72',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#FB7185',
    text: '#FAFAFA',
    textMuted: '#A7A5AE',
    previewColors: ['#141318', '#FF6B6B', '#FF8E72'],
    lightColorHex: 0xff6b6b,
  },
};

export const DEFAULT_THEME: ThemeId = 'midnight';

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId] || THEMES.midnight;
  const root = document.documentElement;

  const isLight = themeId === 'emerald';
  const isLime = themeId === 'navy';

  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--bg-main', theme.bg);
  root.style.setProperty('--bg-surface', theme.surface);
  root.style.setProperty('--bg-surface-hover', theme.surfaceHover);
  root.style.setProperty('--border-color', theme.border);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
  root.style.setProperty('--color-error', theme.error);
  root.style.setProperty('--text-main', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--button-text', isLime ? '#07111F' : '#FFFFFF');
  root.style.setProperty('--glass-bg', isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(16, 23, 32, 0.85)');
  root.style.setProperty('--glow-primary', isLight ? 'rgba(22, 74, 65, 0.18)' : `${theme.primary}40`);
  root.style.setProperty('--aurora-1', isLight ? 'rgba(46, 139, 114, 0.12)' : `${theme.primary}20`);
  root.style.setProperty('--aurora-2', isLight ? 'rgba(22, 74, 65, 0.08)' : `${theme.secondary}18`);
  root.style.setProperty('--dot-color', isLight ? 'rgba(22, 74, 65, 0.14)' : `${theme.primary}25`);

  try {
    localStorage.setItem('placementos-theme', theme.id);
  } catch (e) {
    console.warn('Could not save theme preference:', e);
  }
}

export function getInitialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem('placementos-theme') as ThemeId;
    if (saved && THEMES[saved]) return saved;
  } catch (e) {}
  return DEFAULT_THEME;
}
