import { ReactNode } from 'react';

import { AppHeader } from '@/Components/ui/AppHeader';

type PublicLayoutProps = {
    children: ReactNode;
    rightSlot?: ReactNode;
};

export const PublicLayout = ({ children, rightSlot }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <AppHeader rightSlot={rightSlot} />
            <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
    );
};
