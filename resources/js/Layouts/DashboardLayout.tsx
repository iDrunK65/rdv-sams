import { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '@heroui/react';

import { Sidebar } from '@/Components/ui/Sidebar';
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
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <div className="flex min-h-screen">
                <Sidebar
                    items={navItems}
                    activePath={url}
                    footer={
                        <div className="space-y-3">
                            <div className="text-sm">
                                <p className="text-neutral-400">Connecte</p>
                                <p className="font-semibold text-white">{user?.name || user?.identifier || 'Medecin'}</p>
                            </div>
                            <Button variant="flat" size="sm" onPress={handleLogout}>
                                Deconnexion
                            </Button>
                        </div>
                    }
                />
                <div className="flex-1">
                    <header className="border-b border-neutral-800 bg-neutral-950">
                        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-2 lg:hidden">
                                <Button as={Link} href="/dashboard" size="sm" variant="flat">
                                    Menu
                                </Button>
                            </div>
                            <div className="text-sm text-neutral-400">
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
