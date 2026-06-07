import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import type { AppTheme } from '../../shared/lib/contracts';

type ThemeProviderProps = PropsWithChildren<{
  theme: AppTheme;
}>;

function resolveTheme(theme: AppTheme): Exclude<AppTheme, 'system'> {
  if (theme !== 'system') {
    return theme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolveTheme(theme);

    if (theme !== 'system') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (): void => {
      root.dataset.theme = resolveTheme('system');
    };

    media.addEventListener('change', handleChange);

    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, [theme]);

  return children;
}
