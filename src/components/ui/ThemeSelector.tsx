import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { THEMES, ThemeId } from '../../lib/themeSystem';

interface ThemeSelectorProps {
  compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { activeTheme, setTheme } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeConfig = THEMES[activeTheme] || THEMES.midnight;

  return (
    <div className="relative inline-block text-left z-40" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border shadow-sm ${
          isOpen
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
        }`}
        title="Change Theme (5 Skins Available)"
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center relative overflow-hidden border border-white/20">
          <span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${currentThemeConfig.previewColors[1]}, ${currentThemeConfig.previewColors[2]})`,
            }}
          />
          <Palette size={11} className="text-white relative z-10 drop-shadow-sm" />
        </div>
        {!compact && (
          <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
            {currentThemeConfig.name.split(' ')[0]}
          </span>
        )}
        <Sparkles size={12} className="text-amber-400 opacity-80" />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 p-2 rounded-2xl glass-card border border-white/15 shadow-2xl z-50 backdrop-blur-2xl"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Palette size={13} className="text-indigo-400" />
                <span>Select Theme</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                5 Skins
              </span>
            </div>

            <div className="space-y-1">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const theme = THEMES[themeKey];
                const isSelected = activeTheme === themeKey;

                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      setTheme(themeKey);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-md'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color Preview Dots */}
                      <div className="flex items-center -space-x-1.5 p-1 rounded-lg bg-black/20 border border-white/10">
                        {theme.previewColors.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div>
                        <div className="text-xs font-semibold leading-none mb-1 group-hover:translate-x-0.5 transition-transform">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal leading-none opacity-80">
                          {theme.tagline}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      >
                        <Check size={12} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
