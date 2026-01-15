import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type AppHeaderProps = {
    rightSlot?: ReactNode;
};

export const AppHeader = ({ rightSlot }: AppHeaderProps) => {
    return (
        <header className="border-b border-neutral-800 bg-neutral-950">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 text-white">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-800 text-sm font-semibold">
                        S
                    </span>
                    <span className="text-lg font-semibold">SAMS</span>
                </Link>
                {rightSlot ? <div className="text-sm text-neutral-300">{rightSlot}</div> : null}
            </div>
        </header>
    );
};
