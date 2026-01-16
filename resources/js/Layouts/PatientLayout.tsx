import { ReactNode } from 'react';

import { AppHeader } from '@/Components/ui/AppHeader';

type PatientLayoutProps = {
    children: ReactNode;
};

export const PatientLayout = ({ children }: PatientLayoutProps) => {
    return (
        <div className="min-h-screen bg-sams-bg text-sams-text">
            <AppHeader />
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
};
