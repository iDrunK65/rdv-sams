import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type PatientLayoutProps = {
    children: ReactNode;
};

export const PatientLayout = ({ children }: PatientLayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900 text-foreground">
            <header className="border-b border-white/10 bg-black/40 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                            S
                        </span>
                        <span className="text-lg font-semibold">SAMS</span>
                    </Link>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
};
