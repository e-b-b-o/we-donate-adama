import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  const { isDark } = useTheme();
  return (
    <div className={cn('min-h-[60vh] flex flex-col items-center justify-center w-full', isDark ? 'bg-[var(--color-background)]' : 'bg-[var(--color-background)]')}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[var(--color-civic-emerald)] animate-spin" />
        <p className={cn('text-sm font-semibold tracking-wide text-[var(--text-muted)]')}>Loading...</p>
      </div>
    </div>
  );
}
