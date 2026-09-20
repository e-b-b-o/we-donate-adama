import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div className={cn('min-h-screen flex flex-col transition-colors duration-300', 'bg-page')}>
      <Navbar />
      <main className="flex-1 min-w-0">{children}</main>
      <Footer />
    </div>
  );
}
