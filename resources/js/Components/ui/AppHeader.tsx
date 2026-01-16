import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type AppHeaderProps = {
    rightSlot?: ReactNode;
};

export const AppHeader = ({ rightSlot }: AppHeaderProps) => {
    return (
        <header className="border-b border-sams-border bg-sams-surface">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 text-sams-text">
                    <img src="/Logo_SAMS.png" alt="SAMS" className="h-9 w-9 place-items-center rounded-full" />
                    <span className="text-lg font-semibold">SAMS</span>
                </Link>
                {rightSlot ? <div className="text-sm text-sams-muted">{rightSlot}</div> : null}
            </div>
        </header>
    );
};
