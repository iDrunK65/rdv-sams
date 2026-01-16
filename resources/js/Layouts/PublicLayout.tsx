import { ReactNode } from 'react';

import { AppHeader } from '@/Components/ui/AppHeader';

type PublicLayoutProps = {
    children: ReactNode;
    rightSlot?: ReactNode;
};

export const PublicLayout = ({ children, rightSlot }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-sams-bg text-sams-text">
            <AppHeader rightSlot={rightSlot} />
            <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
    );
};
