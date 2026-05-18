import Link from 'next/link';
import { LayoutDashboard, FilePlus } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-rule bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-serif text-xl text-berry">
            Hebammen<span className="italic text-orange">·</span>Vorsorge
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink/80 hover:bg-cream-dark"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/beratung/neu"
              className="inline-flex items-center gap-2 rounded-full bg-berry px-4 py-1.5 text-sm text-cream hover:bg-berry-deep"
            >
              <FilePlus className="h-4 w-4" />
              Neue Beratung
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t border-rule py-6 text-center text-xs text-muted">
        Schätzungen, keine Steuer- / Anlageberatung. Werte-Stand Mai 2026.
      </footer>
    </div>
  );
}
