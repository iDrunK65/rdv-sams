import { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Divider } from '@heroui/react';

import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { api } from '@/lib/api';

type DashboardLayoutProps = {
    children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { url } = usePage();
    const user = useAuth();
    const isAdmin = useIsAdmin();
    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Calendriers', href: '/dashboard/calendriers' },
        ...(isAdmin ? [{ label: 'Admin', href: '/dashboard/admin' }] : []),
    ];

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } finally {
            router.visit('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900 text-foreground">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/40 px-6 py-6 lg:flex">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                            S
                        </span>
                        <span className="text-lg font-semibold">SAMS</span>
                    </Link>
                    <Divider className="my-6 opacity-40" />
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = url === item.href || url.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center rounded-large px-3 py-2 text-sm ${
                                        isActive ? 'bg-white/10 text-white' : 'text-foreground/70'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <Divider className="my-6 opacity-40" />
                    <div className="mt-auto space-y-3">
                        <div className="text-sm">
                            <p className="text-foreground/60">Connecte</p>
                            <p className="font-semibold text-white">{user?.name || user?.identifier || 'Medecin'}</p>
                        </div>
                        <Button variant="flat" size="sm" onPress={handleLogout}>
                            Deconnexion
                        </Button>
                    </div>
                </aside>
                <div className="flex-1">
                    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
                        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-2 lg:hidden">
                                <Button as={Link} href="/dashboard" size="sm" variant="flat">
                                    Panel
                                </Button>
                            </div>
                            <div className="text-sm text-foreground/70">
                                {user ? `Connecte: ${user.name || user.identifier}` : 'Non connecte'}
                            </div>
                        </div>
                    </header>
                    <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
                </div>
            </div>
        </div>
    );
};
